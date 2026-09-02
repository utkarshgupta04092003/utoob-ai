"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ENDPOINTS } from "@/lib/endpoint";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteVideo({ videoId }: { videoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !confirm("Are you sure you want to delete this video and all its data?")
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.YOUTUBE, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to delete video", "error");
      }
    } catch (err) {
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground transition-colors hover:text-destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
