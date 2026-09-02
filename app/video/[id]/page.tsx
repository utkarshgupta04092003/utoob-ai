import { AppShell } from "@/components/layout/app-shell";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { VideoTabs } from "./_components/video-tabs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function VideoPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    redirect("/login");
  }
  const userId = (session.user as any).id;

  const video = await prisma.video.findFirst({
    where: { id: params.id, userId, deleted: false },
    include: {
      summaries: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" } },
      quizzes: { orderBy: { createdAt: "desc" } },
      socialPosts: { orderBy: { createdAt: "desc" } },
      chatMessages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!video) {
    redirect("/dashboard");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-small text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Library
        </Link>

        <h1 className="mb-8 font-display text-h1 leading-tight text-foreground lg:hidden">
          {video.title}
        </h1>

        <VideoTabs video={video} />
      </div>
    </AppShell>
  );
}
