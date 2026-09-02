"use client";

import { useToast } from "@/components/ui/toast";
import { ROLES } from "@/lib/config";
import { ENDPOINTS } from "@/lib/endpoint";
import { useAPIKey } from "@/providers/api-key-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type LocalData = {
  summary: any;
  notes: any;
  quiz: any;
  social: any[];
};

export function useGeneration(video: any) {
  const router = useRouter();
  const { provider, model, apiKey } = useAPIKey();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const [localData, setLocalData] = useState<LocalData>({
    summary: video.summaries?.[0]?.content || "",
    notes: video.notes?.[0]?.content || null,
    quiz: video.quizzes?.[0]?.questions || null,
    social: video.socialPosts || [],
  });

  useEffect(() => {
    setLocalData({
      summary: video.summaries?.[0]?.content || "",
      notes: video.notes?.[0]?.content || null,
      quiz: video.quizzes?.[0]?.questions || null,
      social: video.socialPosts || [],
    });
  }, [video]);

  const [quizResults, setQuizResults] = useState<Record<number, boolean>>({});

  const [chatMessages, setChatMessages] = useState<any[]>(
    video.chatMessages?.map((m: any) => ({
      role: m.role,
      content: m.content,
    })) || [],
  );
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const generateContent = async (type: string) => {
    if (!apiKey) {
      toast("Please configure your API key in the Settings page first.", "error");
      return;
    }
    setLoading(true);
    setLoadingType(type);
    try {
      const endpoint = ENDPOINTS[type.toUpperCase() as keyof typeof ENDPOINTS];
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id, provider, apiKey, model }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      if (type === "quiz") {
        setQuizResults({});
      }

      const key = type === "summarize" ? "summary" : type;

      setLocalData((prev) => ({
        ...prev,
        [key]: json.data,
      }));

      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
      setLoadingType(null);
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

      setChatMessages((prev) => [
        ...prev,
        { role: ROLES.ASSISTANT, content: "" },
      ]);
      setChatLoading(false);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedContent = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        accumulatedContent += chunkValue;

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
      toast(err.message, "error");
      setChatLoading(false);
    }
  };

  return {
    apiKey,
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
  };
}
