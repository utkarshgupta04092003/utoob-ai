import { Provider, validateKey } from "@/lib/ai";
import { ANALYTICS_EVENTS } from "@/lib/config";
import { logger } from "@/lib/logger";
import { posthog } from "@/lib/posthog";
import { requireAuth } from "@/lib/session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const { provider, apiKey, model } = await req.json();

    if (!provider || !apiKey || !model) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const isValid = await validateKey({
      provider: provider as Provider,
      apiKey,
      model,
    });

    posthog.capture({
      distinctId: userId,
      event: ANALYTICS_EVENTS.SETTINGS_UPDATED,
      properties: { action: "test_key", provider, isValid },
    });

    if (isValid) {
      return NextResponse.json({ message: "API Key is working!" });
    } else {
      return NextResponse.json(
        { error: "API Key is invalid or not working." },
        { status: 400 },
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    logger.error("Test Key Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await posthog.shutdown();
  }
}
