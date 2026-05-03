"use client";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROLES } from "@/lib/config";
import { ENDPOINTS } from "@/lib/endpoint";
import { useAPIKey } from "@/providers/api-key-provider";
import { Bot, Check, Copy, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

export function VideoTabs({ video }: { video: any }) {
  const [activeTab, setActiveTab] = useState("summary");
  const { provider, model, apiKey } = useAPIKey();
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const [localData, setLocalData] = useState({
    summary: video.summaries?.[0]?.content || "",
    notes: video.notes?.[0]?.content || null,
    quiz: video.quizzes?.[0]?.questions || null,
    social: video.socialPosts || [],
  });

  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "notes", label: "AI Notes" },
    { id: "quiz", label: "Quiz" },
    { id: "social", label: "Social Posts" },
    { id: "chat", label: "Chat with Video" },
  ];

  const [chatMessages, setChatMessages] = useState<any[]>(
    video.chatMessages?.map((m: any) => ({
      role: m.role,
      content: m.content,
    })) || [],
  );
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "chat") {
      scrollToBottom();
    }
  }, [chatMessages, activeTab]);

  const generateContent = async (type: string) => {
    if (!apiKey) {
      alert("Please configure your API key in the Settings page first.");
      return;
    }
    setLoading(true);
    try {
      const endpoint = ENDPOINTS[type.toUpperCase() as keyof typeof ENDPOINTS];
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id, provider, apiKey, model }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      setLocalData((prev) => ({
        ...prev,
        [type === "summarize" ? "summary" : type]: json.data,
      }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !apiKey || chatLoading) return;

    const userMessage = { role: ROLES.USER, content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(ENDPOINTS.CHAT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video.id,
          message: chatInput,
          provider,
          apiKey,
          model,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      if (!res.body) throw new Error("No response body");

      // Add a placeholder message for the assistant
      setChatMessages((prev) => [
        ...prev,
        { role: ROLES.ASSISTANT, content: "" },
      ]);
      setChatLoading(false); // Stop loading dots since we're streaming

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedContent = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        accumulatedContent += chunkValue;

        // Update the last message (the placeholder) with the new content
        setChatMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: ROLES.ASSISTANT,
            content: accumulatedContent,
          };
          return newMessages;
        });
      }
    } catch (err: any) {
      alert(err.message);
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b border-border pb-px overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 mb-[-1px] whitespace-nowrap ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "summary" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Detailed Summary</CardTitle>
                <CardDescription>
                  AI generated summary of the video transcript.
                </CardDescription>
              </div>
              <Button
                disabled={loading}
                onClick={() => generateContent("summarize")}
              >
                {loading
                  ? "Generating..."
                  : localData.summary
                    ? "Regenerate"
                    : "Generate"}
              </Button>
            </CardHeader>
            <CardContent>
              {localData.summary ? (
                <MarkdownRenderer content={localData.summary} />
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No summary generated yet.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "notes" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Structured Notes</CardTitle>
                <CardDescription>
                  Key insights formatted as structured notes.
                </CardDescription>
              </div>
              <Button
                disabled={loading}
                onClick={() => generateContent("notes")}
              >
                {loading
                  ? "Generating..."
                  : localData.notes
                    ? "Regenerate"
                    : "Generate"}
              </Button>
            </CardHeader>
            <CardContent>
              {localData.notes && localData.notes.headings ? (
                <div className="space-y-6 text-base">
                  {localData.notes.headings.map((h: any, i: number) => (
                    <div key={i}>
                      <h4 className="font-semibold text-base mb-2 text-primary">
                        {h.title}
                      </h4>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {h.bullets.map((b: string, j: number) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No notes generated yet.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "quiz" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Study Quiz</CardTitle>
                <CardDescription>
                  Test your knowledge with multiple choice questions.
                </CardDescription>
              </div>
              <Button
                disabled={loading}
                onClick={() => generateContent("quiz")}
              >
                {loading
                  ? "Generating..."
                  : localData.quiz
                    ? "Regenerate"
                    : "Generate"}
              </Button>
            </CardHeader>
            <CardContent>
              {localData.quiz && localData.quiz.length > 0 ? (
                <div className="space-y-8 text-base">
                  {localData.quiz.map((q: any, i: number) => (
                    <div
                      key={i}
                      className="space-y-2 border-l-2 border-muted pl-4"
                    >
                      <h4 className="font-medium text-foreground">
                        {i + 1}. {q.question}{" "}
                        <span className="text-xs text-muted-foreground ml-2 uppercase border px-1 rounded">
                          {q.difficulty}
                        </span>
                      </h4>
                      <div className="space-y-1">
                        {q.options.map((opt: string, j: number) => (
                          <div
                            key={j}
                            className={`p-2 rounded ${opt === q.correctAnswer ? "bg-primary/10 border-primary/20 border" : "bg-muted/50"}`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="font-semibold text-foreground">
                          Explanation:
                        </span>{" "}
                        {q.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No quiz generated yet.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "social" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Social Media Posts</CardTitle>
                <CardDescription>
                  Viral content for LinkedIn and Twitter.
                </CardDescription>
              </div>
              <Button
                disabled={loading}
                onClick={() => generateContent("social")}
              >
                {loading
                  ? "Generating..."
                  : localData.social.length > 0
                    ? "Regenerate"
                    : "Generate"}
              </Button>
            </CardHeader>
            <CardContent>
              {localData.social && localData.social.length > 0 ? (
                <div className="space-y-4 text-base">
                  {localData.social.map((post: any, i: number) => (
                    <div key={i} className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold uppercase text-primary">
                          {post.platform}
                        </div>
                        <CopyButton text={post.content} />
                      </div>
                      <div className="whitespace-pre-wrap text-muted-foreground">
                        {post.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No posts generated yet.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "chat" && (
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Chat with Video</CardTitle>
              <CardDescription>
                Ask questions about the video content.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4 p-6 scrollbar-hide">
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Ask anything about the video and I&apos;ll answer based on
                      the transcript.
                    </p>
                  </div>
                </div>
              )}
              {chatMessages.map((m, i) => {
                const role = m.role?.toLowerCase().trim();
                const isUser = role === ROLES.USER;
                return (
                  <div
                    key={i}
                    className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {isUser ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        isUser
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted rounded-tl-none"
                      }`}
                    >
                      {isUser ? (
                        <p className="text-base">{m.content}</p>
                      ) : (
                        <MarkdownRenderer
                          content={m.content}
                          className={isUser ? "text-primary-foreground" : ""}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                    <div className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </CardContent>
            <div className="p-4 border-t bg-card/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Ask a question about this video..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                  className="bg-background"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={chatLoading || !chatInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
