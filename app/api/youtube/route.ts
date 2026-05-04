import { ANALYTICS_EVENTS } from "@/lib/config";
import { logger } from "@/lib/logger";
import { posthog } from "@/lib/posthog";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import {
  extractVideoId,
  fetchTranscript,
  fetchVideoMetadata,
} from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

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

    const [transcript, metadata] = await Promise.all([
      fetchTranscript(url),
      fetchVideoMetadata(url),
    ]);

    const video = await prisma.video.create({
      data: {
        userId,
        youtubeUrl: url,
        title: metadata.title,
        authorName: metadata.authorName,
        transcript,
      },
    });

    posthog.capture({
      distinctId: userId,
      event: ANALYTICS_EVENTS.VIDEO_INGESTED,
      properties: { videoId: video.id, youtubeId: videoId },
    });

    return NextResponse.redirect(new URL(`/video/${video.id}`, req.url));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    logger.error("YouTube Ingestion Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await posthog.shutdown();
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const { videoId } = await req.json();

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 },
      );
    }

    // Perform soft delete on video and all related entities in a transaction
    await prisma.$transaction([
      prisma.video.update({
        where: { id: videoId, userId },
        data: { deleted: true },
      }),
      prisma.summary.updateMany({
        where: { videoId, userId },
        data: { deleted: true },
      }),
      prisma.note.updateMany({
        where: { videoId, userId },
        data: { deleted: true },
      }),
      prisma.quiz.updateMany({
        where: { videoId, userId },
        data: { deleted: true },
      }),
      prisma.socialPost.updateMany({
        where: { videoId, userId },
        data: { deleted: true },
      }),
      prisma.chatMessage.updateMany({
        where: { videoId, userId },
        data: { deleted: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
