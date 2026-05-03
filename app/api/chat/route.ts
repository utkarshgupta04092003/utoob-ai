import { generateText, Provider } from "@/lib/ai";
import { ANALYTICS_EVENTS, ROLES } from "@/lib/config";
import { logger } from "@/lib/logger";
import { posthog } from "@/lib/posthog";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const { videoId, provider, apiKey, model, message } = await req.json();

    if (!videoId || !provider || !apiKey || !model || !message) {
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

    const systemPrompt = `You are an AI assistant answering questions about a specific video. 
    Here is the transcript of the video: \n\n${video.transcript}\n\n
    Answer the user's question based ONLY on this transcript.`;

    const responseContent = await generateText(
      { provider: provider as Provider, apiKey, model },
      message,
      systemPrompt,
    );

    await prisma.chatMessage.createMany({
      data: [
        { userId, videoId, role: ROLES.USER, content: message },
        {
          userId,
          videoId,
          role: ROLES.ASSISTANT,
          content: responseContent || "No response generated.",
        },
      ],
    });

    posthog.capture({
      distinctId: userId,
      event: ANALYTICS_EVENTS.CHAT_MESSAGE_SENT,
      properties: { videoId, provider, model },
    });

    return NextResponse.json({ data: responseContent });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    logger.error("Chat Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await posthog.shutdown();
  }
}
