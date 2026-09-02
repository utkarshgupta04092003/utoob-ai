"use client";

import { Linkedin, Share2, Twitter } from "lucide-react";
import { CopyButton } from "../copy-button";
import { Panel } from "../panel";

function platformIcon(platform: string) {
  const p = platform?.toLowerCase() ?? "";
  if (p.includes("linkedin")) return Linkedin;
  if (p.includes("twitter") || p.includes("x")) return Twitter;
  return Share2;
}

export function SocialPanel({
  social,
  loading,
  onGenerate,
}: {
  social: any[];
  loading: boolean;
  onGenerate: () => void;
}) {
  const hasContent = !!(social && social.length > 0);

  return (
    <Panel
      title="Social posts"
      description="Ready-to-publish drafts for LinkedIn and X."
      hasContent={hasContent}
      loading={loading}
      onGenerate={onGenerate}
      emptyIcon={Share2}
      emptyText="No posts yet"
    >
      <div key={JSON.stringify(social)} className="grid gap-5 lg:grid-cols-2">
        {social?.map((post: any, i: number) => {
          const Icon = platformIcon(post.platform);
          return (
            <article
              key={i}
              className="flex flex-col rounded-lg border border-border"
            >
              <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span className="font-mono text-small uppercase tracking-wide">
                    {post.platform}
                  </span>
                </div>
                <CopyButton text={post.content} />
              </header>
              <div className="flex-1 whitespace-pre-wrap p-4 text-body leading-relaxed text-foreground">
                {post.content}
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}
