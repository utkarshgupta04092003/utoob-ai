import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { APP_CONFIG } from "./config";

export type Provider = "openai" | "gemini";

export interface AIClientOptions {
  provider: Provider;
  apiKey: string;
}

export async function generateText(
  { provider, apiKey }: AIClientOptions,
  prompt: string,
  system?: string,
) {
  if (provider === "openai") {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const response = await openai.chat.completions.create({
      model: APP_CONFIG.models.openai,
      messages: [
        ...(system ? [{ role: "system" as const, content: system }] : []),
        { role: "user" as const, content: prompt },
      ],
    });
    return response.choices[0].message.content;
  } else if (provider === "gemini") {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: APP_CONFIG.models.gemini });
    const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  }
  throw new Error("Invalid provider");
}

export async function generateJson(
  { provider, apiKey }: AIClientOptions,
  prompt: string,
  system?: string,
) {
  if (provider === "openai") {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const response = await openai.chat.completions.create({
      model: APP_CONFIG.models.openai,
      response_format: { type: "json_object" },
      messages: [
        ...(system ? [{ role: "system" as const, content: system }] : []),
        { role: "user" as const, content: prompt },
      ],
    });
    return JSON.parse(response.choices[0].message.content || "{}");
  } else if (provider === "gemini") {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: APP_CONFIG.models.gemini,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const fullPrompt = system
      ? `${system}\n\n${prompt}\n\nEnsure output is valid JSON.`
      : `${prompt}\n\nEnsure output is valid JSON.`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return JSON.parse(response.text() || "{}");
  }
  throw new Error("Invalid provider");
}
