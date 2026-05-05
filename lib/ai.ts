import { PROVIDERS, ROLES } from "@/lib/config";
import { logger } from "@/lib/logger";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

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

export async function generateJson<T extends z.ZodTypeAny>(
  { provider, apiKey, model }: AIClientOptions,
  prompt: string,
  schema: T,
  schemaName: string,
  system?: string,
): Promise<z.infer<T>> {
  const openai = getClient({ provider, apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        ...(system
          ? [
              {
                role: ROLES.SYSTEM,
                content:
                  system +
                  "\n\nCRITICAL: You must return ONLY a valid JSON object matching the requested schema. Do not wrap it in markdown code blocks.",
              },
            ]
          : []),
        { role: ROLES.USER, content: prompt },
      ],
      response_format: zodResponseFormat(schema, schemaName),
    });

    const content = response.choices[0].message.content || "";
    const parsedData = JSON.parse(content);
    const result = schema.parse(parsedData);
    return result;
  } catch (error) {
    logger.error("Structured Output Error:", error);
    throw error;
  }
}
