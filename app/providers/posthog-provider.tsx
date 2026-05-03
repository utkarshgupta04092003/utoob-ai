"use client";

import { logger } from "@/lib/logger";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useState } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
        capture_pageview: false, // We can handle this manually if needed
        capture_pageleave: true,
      });
      setMounted(true);
    } else {
      // Mock for development if no key is provided
      if (process.env.NODE_ENV === "development") {
        logger.info("[Mock PostHog Client Init]");
      }
      setMounted(true); // Still mount children
    }
  }, []);

  if (!mounted) return <>{children}</>;

  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <PHProvider client={posthog}>{children}</PHProvider>;
  }

  // Fallback if no key
  return <>{children}</>;
}
