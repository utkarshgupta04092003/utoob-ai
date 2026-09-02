"use client";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLES } from "@/lib/config";
import { cn } from "@/lib/utils";
import { MessageSquare, Send } from "lucide-react";
import { useEffect, useRef } from "react";

export function ChatPanel({
  messages,
  input,
  setInput,
  loading,
  onSend,
}: {
  messages: any[];
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  onSend: () => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <section className="flex h-[calc(100vh-15rem)] min-h-[420px] flex-col">
      <div className="border-b border-border pb-4">
        <h2 className="font-display text-h2 text-foreground">Chat</h2>
        <p className="text-small text-muted-foreground">
          Ask anything; answers come from the transcript.
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto py-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-body font-medium text-foreground">
                No messages yet
              </p>
              <p className="mt-1 max-w-xs text-small text-muted-foreground">
                Ask a question and I&apos;ll answer from the transcript.
              </p>
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const role = m.role?.toLowerCase().trim();
          const isUser = role === ROLES.USER;
          return (
            <div
              key={i}
              className={cn("flex", isUser ? "justify-end" : "justify-start")}
            >
              {isUser ? (
                <p className="max-w-[80%] rounded-lg rounded-br-sm bg-primary px-4 py-2.5 text-body text-primary-foreground">
                  {m.content}
                </p>
              ) : (
                <div className="prose-measure max-w-[85%] text-body">
                  <MarkdownRenderer content={m.content} className="text-body" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-1.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex gap-2 border-t border-border pt-4"
      >
        <Input
          placeholder="Ask a question about this video..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!loading && input.trim()) onSend();
            }
          }}
          disabled={loading}
          className="h-10"
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !input.trim()}
          className="h-10 w-10 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </section>
  );
}
