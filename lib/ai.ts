import { PROVIDERS, ROLES } from "@/lib/config";
import { logger } from "@/lib/logger";
import OpenAI from "openai";

export type Provider = (typeof PROVIDERS)[keyof typeof PROVIDERS];

export interface AIClientOptions {
  provider: Provider;
  model: string;
  apiKey: string;
}

function getClient({
  provider,
  apiKey,
}: {
  provider: Provider;
  apiKey: string;
}) {
  if (provider === PROVIDERS.OPENAI) {
    return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  } else {
    return new OpenAI({
      apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      dangerouslyAllowBrowser: true,
    });
  }
}

export async function validateKey({
  provider,
  apiKey,
  model,
}: AIClientOptions) {
  try {
    const openai = getClient({ provider, apiKey });
    await openai.models.list(); // Simple list models call to verify key
    return true;
  } catch (error) {
    logger.error("Key Validation Error:", error);
    return false;
  }
}

export async function generateText(
  { provider, apiKey, model }: AIClientOptions,
  prompt: string,
  system?: string,
) {
  const openai = getClient({ provider, apiKey });
  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      ...(system ? [{ role: ROLES.SYSTEM, content: system }] : []),
      { role: ROLES.USER, content: prompt },
    ],
  });
  return response.choices[0].message.content;
}

export async function generateStream(
  { provider, apiKey, model }: AIClientOptions,
  prompt: string,
  system?: string,
) {
  const openai = getClient({ provider, apiKey });
  return await openai.chat.completions.create({
    model: model,
    stream: true,
    messages: [
      ...(system ? [{ role: ROLES.SYSTEM, content: system }] : []),
      { role: ROLES.USER, content: prompt },
    ],
  });
}

export async function generateJson(
  { provider, apiKey, model }: AIClientOptions,
  prompt: string,
  system?: string,
) {
  const openai = getClient({ provider, apiKey });
  const response = await openai.chat.completions.create({
    model: model,
    response_format: { type: "json_object" },
    messages: [
      ...(system ? [{ role: ROLES.SYSTEM, content: system }] : []),
      { role: ROLES.USER, content: prompt },
    ],
  });

  const content = response.choices[0].message.content || "{}";

  try {
    // Clean potential markdown wrapping
    const cleanContent = content.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    logger.error("JSON Parsing Error:", error, "Raw Content:", content);
    // Fallback attempt to find any JSON object in the string
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        throw new Error("Failed to parse AI response as JSON");
      }
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}
