"use client";

import { ExternalLink } from "lucide-react";

export function ExternalLinkButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 text-muted-foreground"
      onClick={(e) => e.stopPropagation()}
    >
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}
