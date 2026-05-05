/**
 * Client-side YouTube transcript fetcher.
 * This runs in the user's browser to bypass Vercel IP blocking.
 */

import { logger } from "./logger";

export async function fetchTranscriptClient(
  url: string,
): Promise<string | null> {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) return null;

    // Use a CORS proxy to fetch the transcript directly from the client
    // This still uses the user's IP for the final fetch if the proxy is just a header-adder,
    // but most CORS proxies fetch on their own server.

    // HOWEVER, the "Option 3" hack usually refers to fetching the video page
    // and parsing it, which is hard in the browser.

    // Let's try the TimedText API directly first.
    // Some browsers/environments might allow it or we can use a "clever" proxy.

    const transcriptUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srv3`;

    // Use a public CORS proxy as a "hack"
    // Allorigins is a popular one that doesn't require a key
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(transcriptUrl)}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) return null;

    const data = await response.json();
    const xml = data.contents;

    if (!xml) return null;

    return parseTranscriptXml(xml);
  } catch (error) {
    logger.error("Client-side transcript fetch failed:", error);
    return null;
  }
}

function extractVideoId(url: string): string | null {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function parseTranscriptXml(xml: string): string {
  const textMatches = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
  if (!textMatches) return "";

  return textMatches
    .map((match: string) => {
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
