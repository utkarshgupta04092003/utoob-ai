import { YoutubeTranscript } from "youtube-transcript";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
];

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoff = 1000,
): Promise<Response> {
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const headers = {
    ...options.headers,
    "User-Agent": userAgent,
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://www.youtube.com/",
    Origin: "https://www.youtube.com",
    "sec-ch-ua":
      '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { ...options, headers });

      // If we get rate limited, wait and retry
      if (response.status === 429 && i < retries - 1) {
        const delay = backoff * Math.pow(2, i) + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      const delay = backoff * Math.pow(2, i) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Fetch failed after retries");
}

export async function fetchTranscript(youtubeUrl: string): Promise<string> {
  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) throw new Error("Invalid YouTube URL");

  try {
    // 1. Try with the library first
    return await fetchTranscriptWithLibrary(videoId);
  } catch (error: any) {
    console.error(
      "Library fetch failed, trying manual approach:",
      error.message,
    );

    // 2. Manual fallback with custom headers and retries
    try {
      return await fetchTranscriptManually(videoId);
    } catch (manualError: any) {
      console.error(
        "Manual fetch failed, trying TimedText API:",
        manualError.message,
      );

      // 3. Last resort: TimedText API directly
      try {
        return await fetchTranscriptViaTimedTextApi(videoId);
      } catch (apiError: any) {
        console.error("TimedText API failed:", apiError.message);

        if (
          error.message.includes("429") ||
          manualError.message.includes("429") ||
          apiError.message.includes("429")
        ) {
          throw new Error(
            "YouTube is rate-limiting requests. Please try again in a few minutes.",
          );
        }

        if (
          error.message.includes("403") ||
          manualError.message.includes("403") ||
          apiError.message.includes("403")
        ) {
          throw new Error(
            "Access to transcripts is restricted on Vercel. Try a different video or try again later.",
          );
        }

        throw new Error(
          "Failed to fetch transcript. Ensure the video has captions enabled and is not restricted.",
        );
      }
    }
  }
}

async function fetchTranscriptViaTimedTextApi(
  videoId: string,
): Promise<string> {
  // Try to get English captions directly from the API
  const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srv3`;
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    // If English fails, try without lang to get whatever is available
    const fallbackUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&fmt=srv3`;
    const fallbackResponse = await fetchWithRetry(fallbackUrl);
    if (!fallbackResponse.ok)
      throw new Error(`API returned ${fallbackResponse.status}`);
    const xml = await fallbackResponse.text();
    return parseTranscriptXml(xml);
  }
  const xml = await response.text();
  return parseTranscriptXml(xml);
}

function parseTranscriptXml(xml: string): string {
  // Simple XML parsing for text content (works for srv3 format too)
  const textMatches = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
  if (!textMatches) throw new Error("Transcript is empty.");

  return textMatches
    .map((match) => {
      const content = match.replace(/<text[^>]*>([\s\S]*?)<\/text>/, "$1");
      return content
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/\n/g, " ")
        .trim();
    })
    .join(" ");
}

async function fetchTranscriptWithLibrary(videoId: string): Promise<string> {
  try {
    const items = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
    });
    return items.map((item) => item.text).join(" ");
  } catch {
    const items = await YoutubeTranscript.fetchTranscript(videoId);
    return items.map((item) => item.text).join(" ");
  }
}

async function fetchTranscriptManually(videoId: string): Promise<string> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetchWithRetry(videoUrl);
  const html = await response.text();

  // 1. Try to find captionTracks in the page source with multiple regex options
  const tracksMatch =
    html.match(/"captionTracks":\s*(\[.*?\])/) ||
    html.match(/captionTracks\\":\s*(\[.*?\])/) ||
    html.match(/&quot;captionTracks&quot;:\s*(\[.*?\])/);

  if (tracksMatch) {
    try {
      const tracks = JSON.parse(
        tracksMatch[1].replace(/\\"/g, '"').replace(/&quot;/g, '"'),
      );
      const track =
        tracks.find((t: any) => t.languageCode === "en") || tracks[0];
      if (track && track.baseUrl) {
        const transcriptResponse = await fetchWithRetry(track.baseUrl);
        const xml = await transcriptResponse.text();
        return parseTranscriptXml(xml);
      }
    } catch (e) {
      console.error("Failed to parse captionTracks:", e);
    }
  }

  // 2. Brute force search for any timedtext URL in the HTML
  const timedTextMatch = html.match(
    /https:\/\/www\.youtube\.com\/api\/timedtext[^"'>\s\\]+/,
  );
  if (timedTextMatch) {
    try {
      const url = timedTextMatch[0]
        .replace(/\\u0026/g, "&")
        .replace(/&amp;/g, "&");
      const transcriptResponse = await fetchWithRetry(url);
      const xml = await transcriptResponse.text();
      return parseTranscriptXml(xml);
    } catch (e) {
      console.error("Failed to fetch brute-forced timedtext URL:", e);
    }
  }

  // 3. Check for specific error indicators
  if (html.includes("player-error-message-renderer")) {
    throw new Error("Video is restricted or unavailable.");
  }
  if (html.includes("consent.youtube.com")) {
    throw new Error(
      "YouTube redirected to a consent page. This often happens on Vercel IPs.",
    );
  }

  throw new Error("No captions found for this video in the page source.");
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
