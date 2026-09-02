"use client";

import { BookOpen } from "lucide-react";
import { Panel } from "../panel";

export function NotesPanel({
  notes,
  loading,
  onGenerate,
}: {
  notes: any;
  loading: boolean;
  onGenerate: () => void;
}) {
  const hasContent = !!(notes && notes.headings);

  return (
    <Panel
      title="Notes"
      description="Structured notes you can drop into Notion or Obsidian."
      hasContent={hasContent}
      loading={loading}
      onGenerate={onGenerate}
      emptyIcon={BookOpen}
      emptyText="No notes yet"
    >
      <div key={JSON.stringify(notes)} className="prose-measure space-y-8">
        {notes?.headings?.map((h: any, i: number) => (
          <div key={i} className="space-y-3">
            <h4 className="font-display text-h2 text-foreground">{h.title}</h4>
            <ul className="space-y-2 pl-5">
              {h.bullets.map((b: string, j: number) => (
                <li
                  key={j}
                  className="list-disc text-read leading-relaxed text-foreground marker:text-muted-foreground"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}
