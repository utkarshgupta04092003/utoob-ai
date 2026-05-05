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
    return new OpenAI({ apiKey });
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });
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
  const startTime = Date.now();
  console.log(
    `[AI] Generating JSON: ${schemaName} | Model: ${model} | Provider: ${provider}`,
  );

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
                  "\n\nCRITICAL: You must return ONLY a valid JSON object matching the requested schema. No markdown, no prose, no code blocks.",
              },
            ]
          : []),
        { role: ROLES.USER, content: prompt },
      ],
      response_format: zodResponseFormat(schema, schemaName),
    });

    const duration = Date.now() - startTime;
    logger.info(
      `[AI] Successfully generated ${schemaName} (Structured Output) in ${duration}ms`,
    );
    return response.choices[0].message.content as z.infer<T>;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(
      `[AI] Generation Failed for ${schemaName} after ${duration}ms:`,
      error,
    );
    throw error;
  }
}
