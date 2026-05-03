import { generateJson, Provider } from "@/lib/ai";
import { authOptions } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/config";
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
      APP_CONFIG.prompts.notes,
    );

    const note = await prisma.note.create({
      data: {
        userId,
        videoId,
        content,
      },
    });

    return NextResponse.json({ data: note.content });
  } catch (error: any) {
    console.error("Notes Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
