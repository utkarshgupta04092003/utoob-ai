import { z } from "zod";

export const SummarySchema = z.object({
  title: z.string(),
  overview: z.string(),
  keyPoints: z.array(z.string()),
  deepInsights: z.array(z.string()),
  actionableTakeaways: z.array(z.string()),
  quotes: z.array(z.string()),
});

export const NotesSchema = z.object({
  headings: z.array(
    z.object({
      title: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
});

export const QuizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.string(),
      explanation: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
    }),
  ),
});

export const SocialPostSchema = z.object({
  posts: z.array(
    z.object({
      hook: z.string(),
      body: z.string(),
      cta: z.string(),
    }),
  ),
});

export type SummaryData = z.infer<typeof SummarySchema>;
export type NotesData = z.infer<typeof NotesSchema>;
export type QuizData = z.infer<typeof QuizSchema>;
export type SocialPostData = z.infer<typeof SocialPostSchema>;
