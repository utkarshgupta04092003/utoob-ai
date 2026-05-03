import { generateStream, Provider } from "@/lib/ai";
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

    const { videoId, message, provider, apiKey, model } = await req.json();

    if (!videoId || !message || !provider || !apiKey || !model) {
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

    const systemPrompt = `You are a helpful assistant that answers questions based ON THE PROVIDED TRANSCRIPT of a YouTube video. 
    
TRANSCRIPT:
${video.transcript}

INSTRUCTIONS:
1. Use the transcript as your primary source of information.
2. If the answer is not in the transcript, say you don't know based on the video.
3. Keep your response concise and high-signal.
4. USE MARKDOWN FOR FORMATTING (bold, lists, etc).
5. DO NOT use emojis.
6. Speak as if you are explaining the video content.`;

    // Save the user message to DB
    await prisma.chatMessage.create({
      data: {
        userId,
        videoId,
        role: ROLES.USER,
        content: message,
      },
    });

    const stream = await generateStream(
      { provider: provider as Provider, apiKey, model },
      message,
      systemPrompt,
    );

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullContent = "";
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          fullContent += content;
          controller.enqueue(encoder.encode(content));
        }

        // Save the final assistant message to DB in the background
        try {
          await prisma.chatMessage.create({
            data: {
              userId,
              videoId,
              role: ROLES.ASSISTANT,
              content: fullContent,
            },
          });
        } catch (dbError) {
          logger.error("DB Save Error (Stream):", dbError);
        }

        controller.close();
      },
    });

    posthog.capture({
      distinctId: userId,
      event: ANALYTICS_EVENTS.CHAT_MESSAGE_SENT,
      properties: { videoId, provider, model },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    logger.error("Chat Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await posthog.shutdown();
  }
}
