"use client";

import { cn } from "@/lib/utils";
import { extractVideoId } from "@/lib/youtube";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import type { LocalData } from "./use-generation";

export function ArtifactRail({
  video,
  localData,
  chatCount,
  activeTab,
  onSelect,
}: {
  video: any;
  localData: LocalData;
  chatCount: number;
  activeTab: string;
  onSelect: (id: string) => void;
}) {
  const videoId = extractVideoId(video.youtubeUrl) || "";

  const items = [
    { id: "summary", label: "Summary", ready: !!localData.summary },
    { id: "notes", label: "Notes", ready: !!localData.notes?.headings },
    { id: "quiz", label: "Quiz", ready: !!localData.quiz?.length },
    { id: "social", label: "Social", ready: !!localData.social?.length },
    { id: "chat", label: "Chat", ready: chatCount > 0, count: chatCount },
  ];

  return (
    <aside className="mb-8 hidden w-[260px] shrink-0 lg:block">
      <div className="sticky top-8 space-y-5">
        <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
          {videoId && (
            <Image
              unoptimized
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={video.title}
              fill
              className="object-cover"
            />
          )}
        </div>

        <div className="space-y-1.5">
          <h2 className="text-body font-medium leading-snug text-foreground">
            {video.title}
          </h2>
          <p className="text-small text-muted-foreground">
            {video.authorName}
          </p>
          <a
            href={video.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-small text-muted-foreground transition-colors hover:text-foreground"
          >
            Watch on YouTube
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <ul className="space-y-0.5 border-t border-border pt-4">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-small transition-colors",
                  activeTab === item.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    item.ready ? "bg-primary" : "bg-border",
                  )}
                />
                <span className="flex-1 text-left">{item.label}</span>
                <span className="font-mono text-muted-foreground">
                  {item.count ? item.count : item.ready ? "✓" : "—"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
