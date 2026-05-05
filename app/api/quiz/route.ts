import { generateJson, Provider } from "@/lib/ai";
import { ANALYTICS_EVENTS, APP_CONFIG } from "@/lib/config";
import { posthog } from "@/lib/posthog";
import { prisma } from "@/lib/prisma";
import { QuizSchema } from "@/lib/schemas";
import { requireAuth } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const startTime = Date.now();
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
    posthog.capture({
      distinctId: userId,
      event: ANALYTICS_EVENTS.QUIZ_GENERATED,
      properties: { videoId, provider, model },
    });
    return NextResponse.json({ data: quiz.questions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await posthog.shutdown();
  }
}
