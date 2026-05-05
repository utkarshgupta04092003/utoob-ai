import { generateJson, Provider } from "@/lib/ai";
import { ANALYTICS_EVENTS, APP_CONFIG } from "@/lib/config";
import { logger } from "@/lib/logger";
import { posthog } from "@/lib/posthog";
import { prisma } from "@/lib/prisma";
import { QuizSchema } from "@/lib/schemas";
import { requireAuth } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const { videoId, provider, apiKey, model } = await req.json();

    if (!videoId || !provider || !apiKey || !model) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const video = await prisma.video.findFirst({
      where: { id: videoId, userId, deleted: false },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const content = await generateJson(
      { provider: provider as Provider, apiKey, model },
      video.transcript,
      QuizSchema,
      "quiz",
      APP_CONFIG.prompts.quiz,
    );

    logger.info(
      "Generated Quiz Content:",
      JSON.stringify(content).slice(0, 100) + "...",
    );

    // Use a transaction to ensure deletion and creation are atomic
    const [_, quiz] = await prisma.$transaction([
      prisma.quiz.deleteMany({
        where: { videoId, userId },
      }),
      prisma.quiz.create({
        data: {
          userId,
          videoId,
          questions: content.questions || content,
        },
      }),
    ]);

    logger.info("Successfully saved quiz to DB:", quiz.id);

    posthog.capture({
      distinctId: userId,
      event: ANALYTICS_EVENTS.QUIZ_GENERATED,
      properties: { videoId, provider, model },
    });

    return NextResponse.json({ data: quiz.questions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    logger.error("Quiz Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await posthog.shutdown();
  }
}
