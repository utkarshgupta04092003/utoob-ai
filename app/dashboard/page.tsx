import { EmptyState } from "@/components/ui/empty-state";
import { relativeTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { extractVideoId } from "@/lib/youtube";
import { Youtube } from "lucide-react";
import Link from "next/link";
import { DeleteVideo } from "./_components/delete-video";
import { ExternalLinkButton } from "./_components/external-link-button";
import { HighResImage } from "./_components/high-res-image";
import { VideoIngestionForm } from "./_components/video-ingestion-form";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  const videos = await prisma.video.findMany({
    where: { userId, deleted: false },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-display text-h1 text-foreground">Library</h1>
        <p className="text-body text-muted-foreground">
          {videos.length === 0
            ? "Paste a YouTube link to get started."
            : `${videos.length} video${videos.length === 1 ? "" : "s"}`}
        </p>
      </div>

      <VideoIngestionForm />

      {videos.length === 0 ? (
        <EmptyState
          icon={Youtube}
          title="Nothing here yet"
          description="Add a YouTube video above and uToob AI will pull the transcript so you can summarize, take notes, quiz yourself, and chat with it."
        />
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div key={video.id} className="group relative">
              <Link href={`/video/${video.id}`} className="block space-y-3">
                <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
                  <HighResImage
                    videoId={extractVideoId(video.youtubeUrl) || ""}
                    title={video.title}
                  />
                </div>
                <div className="space-y-1.5 pr-16">
                  <h2 className="line-clamp-2 font-sans text-body font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                    {video.title}
                  </h2>
                  <p className="truncate text-small text-muted-foreground">
                    {video.authorName}
                    <span className="px-1.5">·</span>
                    {relativeTime(video.createdAt)}
                  </p>
                </div>
              </Link>
              <div className="absolute bottom-0 right-0 flex items-center gap-0.5">
                <ExternalLinkButton url={video.youtubeUrl} />
                <DeleteVideo videoId={video.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
