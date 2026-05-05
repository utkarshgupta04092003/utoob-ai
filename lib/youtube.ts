import { logger } from "./logger";

export async function fetchTranscript(youtubeUrl: string): Promise<string> {
  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) throw new Error("Invalid YouTube URL");

  if (!process.env.SUPADATA_API_KEY) {
    logger.error("[transcript-server] SUPADATA_API_KEY is missing");
    throw new Error(
      "Transcript service is not configured. Please set SUPADATA_API_KEY.",
    );
  }

  try {
    const result = await fetchTranscriptViaSupadata(videoId);
    logger.info(
      `[transcript-server] Successfully fetched transcript for ${videoId}`,
    );
    return result;
  } catch (error: any) {
    logger.error(
      `[transcript-server] Supadata failed for ${videoId}:`,
      error.message,
    );
    throw new Error(`Failed to fetch transcript: ${error.message}`);
  }
}

/**
 * Supadata API — reliable production-grade API.
 * Free tier: 100 requests/month. Set SUPADATA_API_KEY in your env.
 * Sign up at: https://dash.supadata.ai
 */
async function fetchTranscriptViaSupadata(videoId: string): Promise<string> {
  const response = await fetch(
    `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true`,
    {
      headers: {
        "x-api-key": process.env.SUPADATA_API_KEY!,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Supadata API returned ${response.status}`);
  }

  const data = await response.json();

  // Supadata returns { content: string } when text=true
  if (typeof data.content === "string" && data.content.length > 50) {
    return data.content;
  }

  // Or { content: Array<{ text, offset, duration }> }
  if (Array.isArray(data.content)) {
    return data.content.map((c: any) => c.text).join(" ");
  }

  throw new Error("Supadata returned unexpected response shape.");
}

export async function fetchVideoMetadata(youtubeUrl: string) {
  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) throw new Error("Invalid YouTube URL");

  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${youtubeUrl}&format=json`,
    );
    const data = await response.json();
    return {
      title: data.title || `Video ${videoId}`,
      authorName: data.author_name,
      thumbnailUrl: data.thumbnail_url,
    };
  } catch {
    return {
      title: `Video ${videoId}`,
      authorName: "Unknown",
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    };
  }
}

export function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
