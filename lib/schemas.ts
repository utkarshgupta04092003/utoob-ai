import { z } from "zod";

export const SummarySchema = z.object({
  title: z.string().describe("A clean, improved title for the video"),
  overview: z.string().describe("A 2-3 sentence summary of the entire video"),
  keyPoints: z
    .array(z.string())
    .describe("8-15 concise bullet points, each starting with a strong verb"),
  deepInsights: z
    .array(z.string())
    .describe("3-5 non-obvious takeaways or mental models"),
  actionableTakeaways: z
    .array(z.string())
    .describe("3-7 things the viewer can actually do after watching"),
  quotes: z.array(z.string()).describe("Impactful lines from the video"),
});

export const NotesSchema = z.object({
  headings: z.array(
    z.object({
      title: z.string().describe("Section Title"),
      bullets: z.array(z.string()).describe("Detailed insights for this section"),
    }),
  ),
});

export const QuizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe("The question text"),
      options: z.array(z.string()).describe("Exactly 4 multiple choice options"),
      correctAnswer: z.string().describe("The exact string of the correct option"),
      explanation: z.string().describe("Why this is correct"),
      difficulty: z.enum(["easy", "medium", "hard"]),
    }),
  ),
});

export const SocialPostSchema = z.object({
  posts: z.array(
    z.object({
      hook: z.string().describe("Strong curiosity gap hook"),
      body: z.string().describe("Valuable body content"),
      cta: z.string().describe("Clear call to action"),
    }),
  ),
});

export type SummaryData = z.infer<typeof SummarySchema>;
export type NotesData = z.infer<typeof NotesSchema>;
export type QuizData = z.infer<typeof QuizSchema>;
export type SocialPostData = z.infer<typeof SocialPostSchema>;
