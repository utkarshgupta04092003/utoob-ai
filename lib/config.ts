export const APP_CONFIG = {
  appName: "YouTube SaaS",
  description:
    "Generate summaries, notes, quizzes, and social posts from YouTube videos.",
  models: {
    openai: [
      { id: "gpt-4o-mini", name: "GPT-4o Mini", available: false },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", available: false },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", available: false },
    ],
    gemini: [
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", available: true },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", available: true },
    ],
  },
  prompts: {
    summarize: {
      detailed:
        "You are an expert summarizer. Provide a highly detailed summary of the following video transcript. Include all main points, supporting details, and nuances. Format with clear headings and bullet points.",
      short:
        "You are an expert summarizer. Provide a short, concise TLDR (Too Long; Didn't Read) of the following video transcript. Limit it to 3-5 sentences.",
    },
    notes:
      'You are a master note-taker. Extract the most important insights from the following transcript into structured notes. Format the output as JSON with the following schema: { "headings": [{ "title": string, "bullets": string[] }] }',
    quiz: 'You are an educator. Generate a 5-question multiple choice quiz based on the following transcript. Include varying difficulty levels. Format the output as JSON with the following schema: { "questions": [{ "question": string, "options": string[], "correctAnswer": string, "explanation": string, "difficulty": "easy" | "medium" | "hard" }] }',
    social: {
      linkedin:
        'You are a top-tier LinkedIn ghostwriter. Create 5 engaging LinkedIn posts based on the provided video transcript. Each post must have a strong hook (curiosity gap), a valuable body, and a clear call to action. Use clean formatting and appropriate line breaks. Return as JSON: { "posts": [{ "hook": string, "body": string, "cta": string }] }',
      twitter:
        'You are a viral Twitter ghostwriter. Create 10 highly engaging Twitter threads or single tweets based on the transcript. Focus on virality, actionable insights, and hooks. Return as JSON: { "posts": [{ "hook": string, "body": string, "cta": string }] }',
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
