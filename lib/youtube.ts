import { YoutubeTranscript } from "youtube-transcript";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
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
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { ...options, headers });

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

  const errors: string[] = [];

  // 1. Supadata API — most reliable on Vercel/production (free tier: 100 req/month)
  //    Sign up at https://dash.supadata.ai and set SUPADATA_API_KEY in env vars
  if (process.env.SUPADATA_API_KEY) {
    try {
      const result = await fetchTranscriptViaSupadata(videoId);
      console.log("[transcript-server] Strategy 1 (Supadata) ✅ succeeded");
      return result;
    } catch (e: any) {
      errors.push(`supadata: ${e.message}`);
      console.warn("[transcript-server] Strategy 1 (Supadata) ❌ failed:", e.message);
    }
  } else {
    console.warn("[transcript-server] SUPADATA_API_KEY not set — skipping Strategy 1");
  }

  // 2. youtube-transcript library (works locally, fails on Vercel datacenter IPs)
  try {
    const result = await fetchTranscriptWithLibrary(videoId);
    console.log("[transcript-server] Strategy 2 (library) ✅ succeeded");
    return result;
  } catch (e: any) {
    errors.push(`library: ${e.message}`);
    console.warn("[transcript-server] Strategy 2 (library) ❌ failed:", e.message);
  }

  // 3. Manual HTML scraping (works locally, fails on Vercel due to IP blocks)
  try {
    const result = await fetchTranscriptManually(videoId);
    console.log("[transcript-server] Strategy 3 (manual HTML) ✅ succeeded");
    return result;
  } catch (e: any) {
    errors.push(`manual: ${e.message}`);
    console.warn("[transcript-server] Strategy 3 (manual HTML) ❌ failed:", e.message);
  }

  // 4. Legacy timedtext API (last resort)
  try {
    const result = await fetchTranscriptViaTimedTextApi(videoId);
    console.log("[transcript-server] Strategy 4 (timedtext) ✅ succeeded");
    return result;
  } catch (e: any) {
    errors.push(`timedtext: ${e.message}`);
    console.warn("[transcript-server] Strategy 4 (timedtext) ❌ failed:", e.message);
  }

  console.error("[transcript-server] ❌ All strategies failed:", errors.join(" | "));

  const allErrors = errors.join(" ");
  if (allErrors.includes("429")) {
    throw new Error("YouTube is rate-limiting. Please try again in a few minutes.");
  }
  if (allErrors.includes("403") || allErrors.includes("consent")) {
    throw new Error(
      "YouTube is blocking server requests from this environment. Set SUPADATA_API_KEY for reliable production transcript fetching.",
    );
  }
  throw new Error(
    "Failed to fetch transcript. Ensure the video has captions enabled and is publicly accessible.",
  );
}

async function fetchTranscriptWithLibrary(videoId: string): Promise<string> {
  try {
    const items = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    if (!items?.length) throw new Error("Empty transcript");
    return items.map((item) => item.text).join(" ");
  } catch {
    const items = await YoutubeTranscript.fetchTranscript(videoId);
    if (!items?.length) throw new Error("Empty transcript");
    return items.map((item) => item.text).join(" ");
  }
}

async function fetchTranscriptManually(videoId: string): Promise<string> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetchWithRetry(videoUrl);
  const html = await response.text();

  if (html.includes("consent.youtube.com")) {
    throw new Error("YouTube redirected to consent page — datacenter IP blocked.");
  }
  if (html.includes("player-error-message-renderer")) {
    throw new Error("Video is restricted or unavailable.");
  }

  // Extract captionTracks from ytInitialPlayerResponse
  const captionTracksMatch =
    html.match(/"captionTracks":(\[.*?\])/) ||
    html.match(/captionTracks\\":(\[.*?\])/) ||
    html.match(/&quot;captionTracks&quot;:(\[.*?\])/);

  if (captionTracksMatch) {
    try {
      const tracks = JSON.parse(
        captionTracksMatch[1].replace(/\\"/g, '"').replace(/&quot;/g, '"'),
      );
      const track =
        tracks.find((t: any) => t.languageCode === "en") ||
        tracks.find((t: any) => t.languageCode?.startsWith("en")) ||
        tracks[0];

      if (track?.baseUrl) {
        const transcriptResponse = await fetchWithRetry(track.baseUrl);
        const xml = await transcriptResponse.text();
        return parseTranscriptXml(xml);
      }
    } catch (e) {
      console.error("[transcript-server] captionTracks parse error:", e);
    }
  }

  // Brute force: find any timedtext URL in the page
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
      console.error("[transcript-server] Brute-force timedtext failed:", e);
    }
  }

  throw new Error("No captions found in page source.");
}

async function fetchTranscriptViaTimedTextApi(videoId: string): Promise<string> {
  const urls = [
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srv3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&fmt=srv3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`,
  ];

  for (const url of urls) {
    const response = await fetchWithRetry(url);
    if (response.ok) {
      const xml = await response.text();
      if (xml?.includes("<text")) {
        return parseTranscriptXml(xml);
      }
    }
  }
  throw new Error("TimedText API returned empty or failed.");
}

/**
 * Supadata API fallback — reliable production-grade API.
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

function parseTranscriptXml(xml: string): string {
  const textMatches = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
  if (!textMatches) throw new Error("Transcript XML is empty.");

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
        .replace(/<[^>]*>/g, "")
        .replace(/\n/g, " ")
        .trim();
    })
    .filter(Boolean)
    .join(" ");
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
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
