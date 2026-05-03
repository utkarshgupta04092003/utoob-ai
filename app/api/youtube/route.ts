import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractVideoId, fetchTranscript } from "@/lib/youtube";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const formData = await req.formData();
    const url = formData.get("url") as string;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 },
      );
    }

    const transcript = await fetchTranscript(url);

    const video = await prisma.video.create({
      data: {
        userId,
        youtubeUrl: url,
        title: `Video ${videoId}`, // In a real app, fetch metadata
        transcript,
      },
    });

    return NextResponse.redirect(new URL(`/video/${video.id}`, req.url));
  } catch (error: any) {
    console.error("YouTube Ingestion Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
