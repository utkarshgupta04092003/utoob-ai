"use client";

import { ExternalLink } from "lucide-react";

export function ExternalLinkButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      onClick={(e) => e.stopPropagation()}
    >
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}
