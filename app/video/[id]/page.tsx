import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { VideoTabs } from "./_components/video-tabs";

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
    },
  });

  if (!video) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg truncate flex-1">{video.title}</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <VideoTabs video={video} />
      </main>
    </div>
  );
}
