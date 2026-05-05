/**
 * Client-side YouTube transcript fetcher.
 *
 * REALITY CHECK (tested May 2025):
 * - Direct fetch to youtube.com → CORS blocked (no Access-Control-Allow-Origin)
 * - YouTube InnerTube API → CORS blocked from browser
 * - Public CORS proxies (corsproxy.io, allorigins.win) → rate-limited/blocked by YouTube
 *
 * WHAT ACTUALLY WORKS (in order of reliability):
 * 1. corsproxy.io + InnerTube — sometimes works on residential IPs, worth trying
 * 2. allorigins.win raw proxy — fallback
 * 3. null → server fallback (Supadata API or youtube-transcript library)
 *
 * The "Option 3 hack" reduces Vercel server load but is NOT guaranteed.
 * The server-side Supadata fallback is the reliable production path.
 */

const INNERTUBE_BODY = (videoId: string) =>
  JSON.stringify({
    videoId,
    context: {
      client: {
        clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER",
        clientVersion: "2.0",
        hl: "en",
        gl: "US",
      },
    },
  });

export async function fetchTranscriptClient(
  url: string,
): Promise<string | null> {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  // Strategy 1: InnerTube via CORS proxy (avoids direct browser CORS block)
  const result1 = await tryInnertubeViaProxy(videoId);
  if (result1) {
    console.log("[transcript-client] ✅ InnerTube proxy strategy succeeded");
    return result1;
  }

  // Strategy 2: Watch page via proxy → extract captionTracks → fetch XML directly
  const result2 = await tryWatchPageCaptionTracks(videoId);
  if (result2) {
    console.log("[transcript-client] ✅ Watch page captionTracks strategy succeeded");
    return result2;
  }

  console.warn("[transcript-client] ❌ All client-side strategies failed. Will use server fallback.");
  return null;
}

async function tryInnertubeViaProxy(videoId: string): Promise<string | null> {
  const innertubeUrl = `https://www.youtube.com/youtubei/v1/player?prettyPrint=false`;
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(innertubeUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(innertubeUrl)}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      const response = await fetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: INNERTUBE_BODY(videoId),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        console.warn(`[transcript-client] InnerTube proxy ${proxyUrl.slice(0, 40)} returned ${response.status}`);
        continue;
      }

      const data = await response.json();
      const captionTracks =
        data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

      if (!captionTracks?.length) continue;

      const track =
        captionTracks.find((t: any) => t.languageCode === "en") ||
        captionTracks.find((t: any) => t.languageCode?.startsWith("en")) ||
        captionTracks[0];

      if (!track?.baseUrl) continue;

      // Caption XML URLs are CORS-accessible — fetch directly
      const captionResponse = await fetch(`${track.baseUrl}&fmt=srv3`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!captionResponse.ok) continue;

      const xml = await captionResponse.text();
      const result = parseTranscriptXml(xml);
      if (result) return result;
    } catch (err) {
      console.warn(`[transcript-client] InnerTube proxy error:`, err);
    }
  }
  return null;
}

async function tryWatchPageCaptionTracks(videoId: string): Promise<string | null> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(watchUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(watchUrl)}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      const response = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) continue;

      const html = await response.text();
      if (!html || html.length < 500) continue;

      const match = html.match(/"captionTracks":(\[.*?\])/);
      if (!match) continue;

      let tracks: any[];
      try {
        tracks = JSON.parse(match[1]);
      } catch {
        continue;
      }

      const track =
        tracks.find((t: any) => t.languageCode === "en") ||
        tracks.find((t: any) => t.languageCode?.startsWith("en")) ||
        tracks[0];

      if (!track?.baseUrl) continue;

      const captionResponse = await fetch(track.baseUrl, {
        signal: AbortSignal.timeout(8000),
      });
      if (!captionResponse.ok) continue;

      const xml = await captionResponse.text();
      const result = parseTranscriptXml(xml);
      if (result) return result;
    } catch (err) {
      console.warn(`[transcript-client] Watch page proxy error:`, err);
    }
  }
  return null;
}

function parseTranscriptXml(xml: string): string | null {
  const textMatches = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
  if (!textMatches || textMatches.length === 0) return null;

  const result = textMatches
    .map((match: string) => {
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

  return result.length > 50 ? result : null;
}

export function extractVideoId(url: string): string | null {
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
