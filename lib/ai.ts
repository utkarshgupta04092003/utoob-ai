import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export type Provider = "openai" | "gemini";

export interface AIClientOptions {
  provider: Provider;
  model: string;
  apiKey: string;
}

export async function validateKey({
  provider,
  apiKey,
  model,
}: AIClientOptions) {
  try {
    if (provider === "openai") {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
      await openai.models.list(); // Simple list models call to verify key
      return true;
    } else if (provider === "gemini") {
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({ model });
      await geminiModel.generateContent("Hello"); // Small prompt to verify key
      return true;
    }
    return false;
  } catch (error) {
    console.error("Key Validation Error:", error);
    return false;
  }
}

export async function generateText(
  { provider, apiKey, model }: AIClientOptions,
  prompt: string,
  system?: string,
) {
  if (provider === "openai") {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        ...(system ? [{ role: "system" as const, content: system }] : []),
        { role: "user" as const, content: prompt },
      ],
    });
    return response.choices[0].message.content;
  } else if (provider === "gemini") {
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model: model });
    const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;
    const result = await geminiModel.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  }
  throw new Error("Invalid provider");
}

export async function generateJson(
  { provider, apiKey, model }: AIClientOptions,
  prompt: string,
  system?: string,
) {
  if (provider === "openai") {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const response = await openai.chat.completions.create({
      model: model,
      response_format: { type: "json_object" },
      messages: [
        ...(system ? [{ role: "system" as const, content: system }] : []),
        { role: "user" as const, content: prompt },
      ],
    });
    return JSON.parse(response.choices[0].message.content || "{}");
  } else if (provider === "gemini") {
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({
      model: model,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const fullPrompt = system
      ? `${system}\n\n${prompt}\n\nEnsure output is valid JSON.`
      : `${prompt}\n\nEnsure output is valid JSON.`;
    const result = await geminiModel.generateContent(fullPrompt);
    const response = await result.response;
    return JSON.parse(response.text() || "{}");
  }
  throw new Error("Invalid provider");
}
