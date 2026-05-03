import { generateText, Provider } from "@/lib/ai";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { videoId, provider, apiKey, message } = await req.json();

    if (!videoId || !provider || !apiKey || !message) {
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
    Here is the transcript of the video: \\n\\n\${video.transcript}\\n\\n
    Answer the user's question based ONLY on this transcript.`;

    const responseContent = await generateText(
      { provider: provider as Provider, apiKey },
      message,
      systemPrompt,
    );

    await prisma.chatMessage.createMany({
      data: [
        { userId, videoId, role: "user", content: message },
        {
          userId,
          videoId,
          role: "assistant",
          content: responseContent || "No response generated.",
        },
      ],
    });

    return NextResponse.json({ data: responseContent });
  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
