import { generateJson, Provider } from "@/lib/ai";
import { ANALYTICS_EVENTS, APP_CONFIG } from "@/lib/config";
import { logger } from "@/lib/logger";
import { posthog } from "@/lib/posthog";
import { prisma } from "@/lib/prisma";
import { NotesSchema } from "@/lib/schemas";
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
      NotesSchema,
      "notes",
      APP_CONFIG.prompts.notes,
    );
    logger.info(
      "Generated Notes Content:",
      JSON.stringify(content).slice(0, 100) + "...",
    );

    // Use a transaction to ensure deletion and creation are atomic
    const [_, note] = await prisma.$transaction([
      prisma.note.deleteMany({
        where: { videoId, userId },
      }),
      prisma.note.create({
        data: {
          userId,
          videoId,
          content,
        },
      }),
    ]);

    logger.info("Successfully saved note to DB:", note.id);

    posthog.capture({
      distinctId: userId,
      event: ANALYTICS_EVENTS.NOTES_GENERATED,
      properties: { videoId, provider, model },
    });

    return NextResponse.json({ data: note.content });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    logger.error("Notes Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await posthog.shutdown();
  }
}
