import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ExternalLink } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 py-2">
        <div className="container mx-auto px-6 h-20 flex items-center gap-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-xl truncate">{video.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary font-bold">{video.authorName}</span>
              <span>•</span>
              <a
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground flex items-center gap-1 transition-colors"
              >
                View on YouTube <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <VideoTabs video={video} />
      </main>
    </div>
  );
}
