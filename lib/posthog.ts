import { PostHog } from "posthog-node";
import { logger } from "./logger";

const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

let posthogClient: PostHog | null = null;

if (apiKey) {
  posthogClient = new PostHog(apiKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
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
