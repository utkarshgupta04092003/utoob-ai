"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ENDPOINTS } from "@/lib/endpoint";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function VideoIngestionForm() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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

      // Success! Clear input and navigate
      setUrl("");
      router.push(`/video/${data.id}`);
      router.refresh();
    } catch (err: any) {
      console.error("Ingestion error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="h-11 w-80"
          required
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="min-w-[140px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ingesting...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Ingest Video
            </>
          )}
        </Button>
      </form>
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-2 rounded-md animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}
    </div>
  );
}
