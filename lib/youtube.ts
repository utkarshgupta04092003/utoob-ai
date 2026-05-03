export async function fetchTranscript(youtubeUrl: string): Promise<string> {
  // In a real production app, use youtube-transcript package or a scraping service.
  // For MVP purposes, returning a mock transcript to ensure the flow works.

  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) throw new Error("Invalid YouTube URL");

  return `This is a mock transcript for video ${videoId}. In a real implementation, you would use a service like youtube-transcript to fetch the actual closed captions. The purpose of this video is to explain how to build a SaaS application using Next.js, Prisma, and MongoDB. We will cover the database schema, API routes, and frontend components. This involves setting up Tailwind CSS, NextAuth for authentication, and integrating with LLMs like OpenAI and Gemini for content generation. We will also discuss how to deploy this application and handle edge cases like rate limiting and error handling.`;
}

export function extractVideoId(url: string): string | null {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
