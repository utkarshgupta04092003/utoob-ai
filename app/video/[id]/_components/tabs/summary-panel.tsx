"use client";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { FileText } from "lucide-react";
import { Panel } from "../panel";

export function SummaryPanel({
  summary,
  loading,
  onGenerate,
}: {
  summary: any;
  loading: boolean;
  onGenerate: () => void;
}) {
  return (
    <Panel
      title="Summary"
      description="The core message of the video, without the filler."
      hasContent={!!summary}
      loading={loading}
      onGenerate={onGenerate}
      emptyIcon={FileText}
      emptyText="No summary yet"
    >
      {typeof summary === "string" ? (
        <div className="prose-measure">
          <MarkdownRenderer content={summary} />
        </div>
      ) : (
        summary && (
          <div className="space-y-10">
            <div className="prose-measure space-y-3">
              <h3 className="font-display text-h1 text-foreground">
                {summary.title}
              </h3>
              <p className="text-read leading-relaxed text-foreground">
                {summary.overview}
              </p>
            </div>

            {summary.keyPoints && (
              <div className="space-y-4">
                <h4 className="font-mono text-small uppercase tracking-wide text-muted-foreground">
                  Key points
                </h4>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {summary.keyPoints.map((point: string, i: number) => (
                    <li
                      key={i}
                      className="flex gap-3 rounded-md border border-border p-3.5 text-body leading-relaxed text-foreground"
                    >
                      <span className="font-mono text-small text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              {summary.deepInsights && (
                <div className="space-y-4">
                  <h4 className="font-mono text-small uppercase tracking-wide text-muted-foreground">
                    Deep insights
                  </h4>
                  <ul className="space-y-2.5">
                    {summary.deepInsights.map((insight: string, i: number) => (
                      <li
                        key={i}
                        className="flex gap-2.5 text-body leading-relaxed text-foreground"
                      >
                        <span className="text-muted-foreground">—</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.actionableTakeaways && (
                <div className="space-y-4">
                  <h4 className="font-mono text-small uppercase tracking-wide text-muted-foreground">
                    Takeaways
                  </h4>
                  <ul className="space-y-2.5">
                    {summary.actionableTakeaways.map(
                      (takeaway: string, i: number) => (
                        <li
                          key={i}
                          className="flex gap-2.5 text-body leading-relaxed text-foreground"
                        >
                          <span className="text-success">✓</span>
                          {takeaway}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>

            {summary.quotes && summary.quotes.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-mono text-small uppercase tracking-wide text-muted-foreground">
                  Quotes
                </h4>
                <div className="prose-measure grid gap-5">
                  {summary.quotes.map((quote: string, i: number) => (
                    <blockquote
                      key={i}
                      className="border-l-2 border-primary/40 pl-4 font-display text-read leading-relaxed text-foreground"
                    >
                      {quote}
                    </blockquote>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </Panel>
  );
}
