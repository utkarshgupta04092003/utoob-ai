import { extractVideoId } from "@/lib/youtube";
import { NextResponse } from "next/server";

/**
 * Test endpoint for verifying Supadata transcript API.
 * GET /api/test-transcript?url=https://youtube.com/watch?v=...
 *
 * DELETE this endpoint before going to production.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url") || "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const videoId = extractVideoId(url);

  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  const apiKey = process.env.SUPADATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "SUPADATA_API_KEY is not set in environment variables.",
        hint: "Add SUPADATA_API_KEY=your_key to your .env file. Get a key at https://dash.supadata.ai",
      },
      { status: 500 },
    );
  }

  const start = Date.now();

  try {
    const response = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true`,
      {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    const elapsed = Date.now() - start;

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json(
        {
          error: `Supadata API returned ${response.status}`,
          body,
          videoId,
          elapsed_ms: elapsed,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Normalize the response
    let transcript = "";
    if (typeof data.content === "string") {
      transcript = data.content;
    } else if (Array.isArray(data.content)) {
      transcript = data.content.map((c: any) => c.text).join(" ");
    }

    return NextResponse.json({
      success: true,
      videoId,
      elapsed_ms: elapsed,
      char_count: transcript.length,
      word_count: transcript.split(" ").filter(Boolean).length,
      preview: transcript.slice(0, 300) + (transcript.length > 300 ? "..." : ""),
      raw_shape: {
        content_type: typeof data.content,
        is_array: Array.isArray(data.content),
        array_length: Array.isArray(data.content) ? data.content.length : null,
        keys: Object.keys(data),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message,
        videoId,
        elapsed_ms: Date.now() - start,
      },
      { status: 500 },
    );
  }
}
