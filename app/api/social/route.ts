import { generateJson, Provider } from "@/lib/ai";
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

    const [linkedinData, twitterData] = await Promise.all([
      generateJson(
        { provider: provider as Provider, apiKey, model },
        video.transcript,
        APP_CONFIG.prompts.social.linkedin,
      ),
      generateJson(
        { provider: provider as Provider, apiKey, model },
        video.transcript,
        APP_CONFIG.prompts.social.twitter,
      ),
    ]);

    const linkedinPosts = linkedinData.posts || [];
    const twitterPosts = twitterData.posts || [];

    const posts = [
      ...linkedinPosts.map((p: any) => ({
        platform: "linkedin",
        content: `${p.hook}\n\n${p.body}\n\n${p.cta}`,
      })),
      ...twitterPosts.map((p: any) => ({
        platform: "twitter",
        content: `${p.hook}\n\n${p.body}\n\n${p.cta}`,
      })),
    ];

    await prisma.socialPost.createMany({
      data: posts.map((post) => ({
        userId,
        videoId,
        platform: post.platform,
        content: post.content,
      })),
    });

    const createdPosts = await prisma.socialPost.findMany({
      where: { videoId, userId, deleted: false },
      orderBy: { createdAt: "desc" },
      take: posts.length,
    });

    posthog.capture({
      distinctId: userId,
      event: ANALYTICS_EVENTS.SOCIAL_POSTS_GENERATED,
      properties: { videoId, provider, model },
    });

    return NextResponse.json({ data: createdPosts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    logger.error("Social Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await posthog.shutdown();
  }
}
