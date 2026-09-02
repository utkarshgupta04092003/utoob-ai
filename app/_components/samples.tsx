import { cn } from "@/lib/utils";
import { Check, Send } from "lucide-react";

function Frame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border border-border bg-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}

function TabBar({ active }: { active: string }) {
  return (
    <div className="relative">
      <div className="scrollbar-hide flex gap-1 overflow-x-auto border-b border-border px-4">
        {["Summary", "Notes", "Quiz", "Social", "Chat"].map((t) => (
          <span
            key={t}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-2.5 py-2.5 text-small font-medium",
              t === active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground",
            )}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-px right-0 top-0 w-8 bg-gradient-to-l from-surface to-transparent" />
    </div>
  );
}

export function NotesSample({ tall = false }: { tall?: boolean }) {
  return (
    <Frame>
      <TabBar active="Notes" />
      <div className={cn("space-y-7 p-5 sm:p-6", tall && "lg:p-8")}>
        <div className="space-y-2.5">
          <h3 className="font-display text-h2 text-foreground">
            Why the reconciler batches updates
          </h3>
          <p className="text-body leading-relaxed text-foreground">
            State updates are queued and flushed together, so several calls in
            one handler produce a single render pass.
          </p>
        </div>
        <div className="space-y-2.5">
          <h3 className="font-display text-h2 text-foreground">
            Where effects actually run
          </h3>
          <ul className="space-y-2 pl-5">
            {[
              "Layout effects fire before the browser paints.",
              "Passive effects are deferred until after paint.",
              "Cleanup runs before the next effect, not after unmount only.",
            ].map((b) => (
              <li
                key={b}
                className="list-disc text-body leading-relaxed text-foreground marker:text-muted-foreground"
              >
                {b}
              </li>
            ))}
          </ul>
        </div>
        {tall && (
          <div className="space-y-3 border-t border-border pt-6">
            <p className="font-mono text-small uppercase tracking-wide text-muted-foreground">
              Quotes
            </p>
            <blockquote className="border-l-2 border-primary/40 pl-4 font-display text-read leading-relaxed text-foreground">
              You are not fighting the renderer. You are fighting your own
              assumptions about when it runs.
            </blockquote>
          </div>
        )}
      </div>
    </Frame>
  );
}

export function SummarySample() {
  return (
    <Frame>
      <TabBar active="Summary" />
      <div className="space-y-7 p-5 sm:p-6">
        <div className="space-y-2.5">
          <h3 className="font-display text-h1 leading-tight text-foreground">
            How rendering actually works
          </h3>
          <p className="text-read leading-relaxed text-foreground">
            A walk through the render, commit, and paint phases — and the mental
            model that makes the rest of the API stop feeling arbitrary.
          </p>
        </div>

        <div className="space-y-3">
          <p className="font-mono text-small uppercase tracking-wide text-muted-foreground">
            Key points
          </p>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {[
              "Rendering is a pure function of props and state.",
              "Committing is the only phase that touches the DOM.",
              "Keys tell the reconciler what identity means.",
              "Memoization is a cache, not a correctness fix.",
            ].map((p, i) => (
              <li
                key={p}
                className="flex gap-3 rounded-md border border-border p-3 text-body leading-relaxed text-foreground"
              >
                <span className="font-mono text-small text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Frame>
  );
}

export function QuizSample() {
  const options = [
    { text: "It flushes each setState immediately", state: "idle" },
    { text: "It batches them into one render pass", state: "correct" },
    { text: "It re-renders only the changed node", state: "idle" },
  ];

  return (
    <Frame>
      <TabBar active="Quiz" />
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-1 gap-1">
            <span className="h-1 flex-1 rounded-full bg-success" />
            <span className="h-1 flex-1 rounded-full bg-success" />
            <span className="h-1 flex-1 rounded-full bg-foreground" />
            <span className="h-1 flex-1 rounded-full bg-border" />
            <span className="h-1 flex-1 rounded-full bg-border" />
          </div>
          <span className="font-mono text-small text-muted-foreground">
            2/5
          </span>
        </div>

        <h3 className="font-display text-h2 leading-snug text-foreground">
          What happens when you call setState twice in one handler?
        </h3>

        <div className="grid gap-2">
          {options.map((o, i) => (
            <div
              key={o.text}
              className={cn(
                "flex items-center gap-3 rounded-md border p-3 text-body",
                o.state === "correct"
                  ? "border-success/40 bg-success/5"
                  : "border-border",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border font-mono text-small",
                  o.state === "correct"
                    ? "border-success text-success"
                    : "border-border text-muted-foreground",
                )}
              >
                {o.state === "correct" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span className="text-foreground">{o.text}</span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function ChatSample() {
  return (
    <Frame>
      <TabBar active="Chat" />
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex justify-end">
          <p className="max-w-[80%] rounded-lg rounded-br-sm bg-primary px-4 py-2.5 text-body text-primary-foreground">
            Did they say anything about error boundaries?
          </p>
        </div>
        <div className="space-y-3 text-body leading-relaxed text-foreground">
          <p>
            Yes — around the middle of the video. The point made was that error
            boundaries only catch errors during rendering, lifecycle methods,
            and constructors.
          </p>
          <p className="text-muted-foreground">
            They explicitly do not catch errors inside event handlers, async
            code, or on the server.
          </p>
        </div>
        <div className="flex gap-2 border-t border-border pt-4">
          <div className="flex h-10 flex-1 items-center rounded-md border border-border px-3 text-body text-muted-foreground">
            Ask a question about this video...
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Send className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Frame>
  );
}
