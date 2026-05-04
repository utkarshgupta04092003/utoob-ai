import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ENDPOINTS } from "@/lib/endpoint";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { extractVideoId } from "@/lib/youtube";
import Link from "next/link";
import { DeleteVideo } from "./_components/delete-video";
import { ExternalLinkButton } from "./_components/external-link-button";
import { HighResImage } from "./_components/high-res-image";

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
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight">Your Videos</h1>
        <form action={ENDPOINTS.YOUTUBE} method="POST" className="flex gap-2">
          <input
            type="url"
            name="url"
            placeholder="https://youtube.com/watch?v=..."
            className="flex h-11 w-80 rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          <Button type="submit" size="lg">
            Ingest Video
          </Button>
        </form>
      </div>

      {videos.length === 0 ? (
        <Card className="text-center p-12 border-dashed">
          <CardTitle className="text-2xl mb-2">No videos yet</CardTitle>
          <CardDescription className="text-base">
            Paste a YouTube URL above to get started.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <Link key={video.id} href={`/video/${video.id}`}>
              <Card className="group hover:border-primary/50 transition-all cursor-pointer h-full overflow-hidden flex flex-col shadow-sm hover:shadow-md">
                <div className="relative w-full aspect-video bg-muted">
                  <HighResImage
                    videoId={extractVideoId(video.youtubeUrl) || ""}
                    title={video.title}
                  />
                  <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1 rounded-lg">
                    <ExternalLinkButton url={video.youtubeUrl} />
                    <DeleteVideo videoId={video.id} />
                  </div>
                </div>
                <CardHeader className="flex-1 p-6 space-y-3">
                  <CardTitle className="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                    {video.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-primary font-bold truncate max-w-[150px]">
                      {video.authorName}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground truncate flex-1">
                      {video.youtubeUrl.replace(
                        "https://www.youtube.com/watch?v=",
                        "",
                      )}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/60">
                    Added {new Date(video.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
