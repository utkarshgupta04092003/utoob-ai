import { Provider, validateKey } from "@/lib/ai";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (isValid) {
      return NextResponse.json({ message: "API Key is working!" });
    } else {
      return NextResponse.json(
        { error: "API Key is invalid or not working." },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("Test Key Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
