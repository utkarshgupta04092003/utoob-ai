"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ENDPOINTS } from "@/lib/endpoint";
import { ArrowRight, Loader2, Youtube } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function VideoIngestionForm() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("url", url);
      const response = await fetch(ENDPOINTS.YOUTUBE, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to ingest video");
      }
      setUrl("");
      router.push(`/video/${data.id}`);
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Youtube className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="h-11 pl-9 font-mono text-small"
          required
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!isLoading && url.trim()) handleSubmit(e);
            }
          }}
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={isLoading || !url}
        className="shrink-0 gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="hidden sm:inline">Adding</span>
          </>
        ) : (
          <>
            <span className="hidden sm:inline">Add video</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
