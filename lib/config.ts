import { SYSTEM_PROMPTS } from "./prompts";

export const APP_CONFIG = {
  appName: "YouTube SaaS",
  description:
    "Generate summaries, notes, quizzes, and social posts from YouTube videos.",
  models: {
    openai: [
      { id: "gpt-5.4", name: "GPT-5.4", available: true },
      { id: "gpt-5.4-mini", name: "GPT-5.4 Mini", available: true },
      { id: "gpt-5.4-nano", name: "GPT-5.4 Nano", available: true },
    ],
    gemini: [
      {
        id: "gemini-3-flash-preview",
        name: "Gemini 3 Flash Preview",
        available: true,
      },
      {
        id: "gemini-3-pro-preview",
        name: "Gemini 3 Pro Preview",
        available: true,
      },
    ],
  },
  prompts: {
    summarize: SYSTEM_PROMPTS.SUMMARIZE,
    notes: SYSTEM_PROMPTS.NOTES,
    quiz: SYSTEM_PROMPTS.QUIZ,
    social: {
      linkedin: SYSTEM_PROMPTS.SOCIAL_LINKEDIN,
      twitter: SYSTEM_PROMPTS.SOCIAL_TWITTER,
    },
  },
  limits: {
    maxTranscriptLength: 100000,
  },
} as const;

export const ANALYTICS_EVENTS = {
  USER_SIGNED_UP: "user_signed_up",
  USER_LOGGED_IN: "user_logged_in",
  VIDEO_INGESTED: "video_ingested",
  SUMMARY_GENERATED: "summary_generated",
  NOTES_GENERATED: "notes_generated",
  QUIZ_GENERATED: "quiz_generated",
  SOCIAL_POSTS_GENERATED: "social_posts_generated",
  CHAT_MESSAGE_SENT: "chat_message_sent",
  SETTINGS_UPDATED: "settings_updated",
} as const;

export const ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
} as const;

export const PROVIDERS = {
  OPENAI: "openai",
  GEMINI: "gemini",
} as const;
