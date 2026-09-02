import { PostHog } from "posthog-node";
import { logger } from "./logger";

const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

let posthogClient: PostHog | null = null;

if (apiKey) {
  posthogClient = new PostHog(apiKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    flushAt: 20,
    flushInterval: 10000,
  });
}

// Graceful degradation for optional services
export const posthog = posthogClient || {
  capture: (options: any) => {
    if (process.env.NODE_ENV === "development") {
      logger.info("[Mock PostHog Capture]", options);
    }
  },
  shutdown: async () => {},
};

/**
 * Fire-and-forget flush. Never await this in a request path — awaiting
 * shutdown() adds a full network round-trip to every response.
 */
export function flushAnalytics() {
  posthogClient?.flush().catch(() => {});
}
