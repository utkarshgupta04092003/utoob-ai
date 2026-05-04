import { generateText, Provider } from "@/lib/ai";
import { ANALYTICS_EVENTS, APP_CONFIG } from "@/lib/config";
import { logger } from "@/lib/logger";
import { posthog } from "@/lib/posthog";
import { prisma } from "@/lib/prisma";
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
    const content = await generateText(
      { provider: provider as Provider, apiKey, model },
      `Transcript: ${video.transcript}`,
      APP_CONFIG.prompts.summarize,
    );

    // Use a transaction to ensure deletion and creation are atomic
    const [_, summary] = await prisma.$transaction([
      prisma.summary.deleteMany({
        where: { videoId, userId, type: "detailed" },
      }),
      prisma.summary.create({
        data: {
          userId,
          videoId,
          type: "detailed",
          content: content || "",
        },
      }),
    ]);

    posthog.capture({
      distinctId: userId,
      event: ANALYTICS_EVENTS.SUMMARY_GENERATED,
      properties: { videoId, provider, model },
    });

    return NextResponse.json({ data: summary.content });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    logger.error("Summarize Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await posthog.shutdown();
  }
}
