"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAPIKey } from "@/providers/api-key-provider";
import { useState } from "react";

export function VideoTabs({ video }: { video: any }) {
  const [activeTab, setActiveTab] = useState("summary");
  const { provider, model, apiKey } = useAPIKey();
  const [loading, setLoading] = useState(false);
  const [localData, setLocalData] = useState({
    summary: video.summaries?.[0]?.content || "",
    notes: video.notes?.[0]?.content || null,
    quiz: video.quizzes?.[0]?.questions || null,
    social: video.socialPosts || [],
  });

  const generateContent = async (type: string) => {
    if (!apiKey) {
      alert("Please configure your API key in the Settings page first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/${type}`, {
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

  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "notes", label: "AI Notes" },
    { id: "quiz", label: "Quiz" },
    { id: "social", label: "Social Posts" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b border-border pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 mb-[-1px] ${
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
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {localData.summary}
                </div>
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
                <div className="space-y-6 text-sm">
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
                <div className="space-y-8 text-sm">
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
                <div className="space-y-4 text-sm">
                  {localData.social.map((post: any, i: number) => (
                    <div key={i} className="p-4 border rounded-lg bg-muted/20">
                      <div className="text-xs font-semibold uppercase text-primary mb-2">
                        {post.platform}
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
      </div>
    </div>
  );
}
