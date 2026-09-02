"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TextSkeleton } from "@/components/ui/skeleton";
import { LucideIcon, RefreshCw, Sparkles } from "lucide-react";
import * as React from "react";

export function Panel({
  title,
  description,
  hasContent,
  loading,
  onGenerate,
  emptyIcon,
  emptyText,
  children,
}: {
  title: string;
  description: string;
  hasContent: boolean;
  loading: boolean;
  onGenerate: () => void;
  emptyIcon: LucideIcon;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <h2 className="font-display text-h2 text-foreground">{title}</h2>
          <p className="text-small text-muted-foreground">{description}</p>
        </div>
        <Button
          variant={hasContent ? "outline" : "default"}
          disabled={loading}
          onClick={onGenerate}
          className="shrink-0 gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating
            </>
          ) : hasContent ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </div>

      {loading && !hasContent ? (
        <div className="space-y-6 py-2">
          <TextSkeleton lines={4} />
          <TextSkeleton lines={3} />
        </div>
      ) : hasContent ? (
        <div className="animate-fade-in">{children}</div>
      ) : (
        <EmptyState
          icon={emptyIcon}
          title={emptyText}
          description="Generate it from the transcript in a few seconds."
          action={
            <Button onClick={onGenerate} disabled={loading} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate {title.toLowerCase()}
            </Button>
          }
        />
      )}
    </section>
  );
}
