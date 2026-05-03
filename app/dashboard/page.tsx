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
import Image from "next/image";
import Link from "next/link";

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
        <h1 className="text-3xl font-bold tracking-tight">Your Videos</h1>
        <form action={ENDPOINTS.YOUTUBE} method="POST" className="flex gap-2">
          <input
            type="url"
            name="url"
            placeholder="https://youtube.com/watch?v=..."
            className="flex h-10 w-80 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          <Button type="submit">Ingest Video</Button>
        </form>
      </div>

      {videos.length === 0 ? (
        <Card className="text-center p-12 border-dashed">
          <CardTitle className="text-xl mb-2">No videos yet</CardTitle>
          <CardDescription>
            Paste a YouTube URL above to get started.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Link key={video.id} href={`/video/${video.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <div className="relative w-full aspect-video rounded-t-2xl overflow-hidden bg-muted">
                  <Image
                    unoptimized
                    src={`https://img.youtube.com/vi/${extractVideoId(video.youtubeUrl)}/mqdefault.jpg`}
                    alt={video.title}
                    className="object-cover w-full h-full"
                    fill
                    priority
                  />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">
                    {video.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-1">
                    {video.youtubeUrl}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
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
