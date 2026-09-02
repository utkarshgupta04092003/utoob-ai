"use client";

import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArtifactRail } from "./artifact-rail";
import { ChatPanel } from "./tabs/chat-panel";
import { NotesPanel } from "./tabs/notes-panel";
import { QuizPanel } from "./tabs/quiz-panel";
import { SocialPanel } from "./tabs/social-panel";
import { SummaryPanel } from "./tabs/summary-panel";
import { useGeneration } from "./use-generation";

const TABS = [
  { id: "summary", label: "Summary" },
  { id: "notes", label: "Notes" },
  { id: "quiz", label: "Quiz" },
  { id: "social", label: "Social" },
  { id: "chat", label: "Chat" },
];

export function VideoTabs({ video }: { video: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab") || "summary";
  const [activeTab, setActiveTab] = useState(currentTab);

  useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const {
    loading,
    loadingType,
    localData,
    generateContent,
    quizResults,
    setQuizResults,
    chatMessages,
    chatInput,
    setChatInput,
    chatLoading,
    sendMessage,
  } = useGeneration(video);

  const busy = (type: string) => loading && loadingType === type;

  return (
    <div className="lg:flex lg:gap-10">
      <ArtifactRail
        video={video}
        localData={localData}
        chatCount={chatMessages.length}
        activeTab={activeTab}
        onSelect={handleTabChange}
      />

      <div className="min-w-0 flex-1">
        <div className="mb-8 flex gap-1 overflow-x-auto border-b border-border scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-body font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "summary" && (
          <SummaryPanel
            summary={localData.summary}
            loading={busy("summarize")}
            onGenerate={() => generateContent("summarize")}
          />
        )}

        {activeTab === "notes" && (
          <NotesPanel
            notes={localData.notes}
            loading={busy("notes")}
            onGenerate={() => generateContent("notes")}
          />
        )}

        {activeTab === "quiz" && (
          <QuizPanel
            quiz={localData.quiz}
            loading={busy("quiz")}
            onGenerate={() => generateContent("quiz")}
            quizResults={quizResults}
            setQuizResults={setQuizResults}
          />
        )}

        {activeTab === "social" && (
          <SocialPanel
            social={localData.social}
            loading={busy("social")}
            onGenerate={() => generateContent("social")}
          />
        )}

        {activeTab === "chat" && (
          <ChatPanel
            messages={chatMessages}
            input={chatInput}
            setInput={setChatInput}
            loading={chatLoading}
            onSend={sendMessage}
          />
        )}
      </div>
    </div>
  );
}
