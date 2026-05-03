import { ANALYTICS_EVENTS, APP_CONFIG } from "./config";

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type Provider = keyof typeof APP_CONFIG.models;
