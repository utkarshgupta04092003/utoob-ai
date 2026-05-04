import { YoutubeTranscript } from "youtube-transcript";

export async function fetchTranscript(youtubeUrl: string): Promise<string> {
  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) throw new Error("Invalid YouTube URL");

  try {
    // Attempt to fetch English transcript first
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
    });
    return transcriptItems.map((item) => item.text).join(" ");
  } catch (error) {
    try {
      // Fallback to default transcript if English is not available
      const fallbackItems = await YoutubeTranscript.fetchTranscript(videoId);
      return fallbackItems.map((item) => item.text).join(" ");
    } catch (fallbackError) {
      throw new Error(
        "Failed to fetch transcript. Ensure the video has captions enabled.",
      );
    }
  }
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
  } catch (error) {
    return {
      title: `Video ${videoId}`,
      authorName: "Unknown",
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    };
  }
}

export function extractVideoId(url: string): string | null {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
