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
      where: { videoId, userId },
      orderBy: { createdAt: "desc" },
      take: posts.length,
    });

    return NextResponse.json({ data: createdPosts });
  } catch (error: any) {
    console.error("Social Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
