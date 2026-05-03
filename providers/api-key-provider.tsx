"use client";

import { Provider } from "@/lib/ai";
import * as React from "react";

type APIKeyContextType = {
  provider: Provider;
  model: string;
  apiKey: string;
  setProvider: (provider: Provider) => void;
  setModel: (model: string) => void;
  setApiKey: (key: string) => void;
};

export const APIKeyContext = React.createContext<APIKeyContextType | undefined>(
  undefined,
);

export function APIKeyProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProviderState] = React.useState<Provider>("gemini");
  const [model, setModelState] = React.useState<string>("gemini-1.5-flash");
  const [apiKey, setApiKeyState] = React.useState<string>("");

  React.useEffect(() => {
    const savedProvider = localStorage.getItem(
      "ai_provider",
    ) as Provider | null;
    const savedModel = localStorage.getItem("ai_model");
    const savedKey = localStorage.getItem("ai_api_key");
    if (savedProvider) setProviderState(savedProvider);
    if (savedModel) setModelState(savedModel);
    if (savedKey) setApiKeyState(savedKey);
  }, []);

  const setProvider = (newProvider: Provider) => {
    localStorage.setItem("ai_provider", newProvider);
    setProviderState(newProvider);
    // When provider changes, set a default model for that provider
    const defaultModel =
      newProvider === "openai" ? "gpt-4o-mini" : "gemini-1.5-flash";
    setModel(defaultModel);
  };

  const setModel = (newModel: string) => {
    localStorage.setItem("ai_model", newModel);
    setModelState(newModel);
  };

  const setApiKey = (newKey: string) => {
    localStorage.setItem("ai_api_key", newKey);
    setApiKeyState(newKey);
  };

  return (
    <APIKeyContext.Provider
      value={{ provider, model, apiKey, setProvider, setModel, setApiKey }}
    >
      {children}
    </APIKeyContext.Provider>
  );
}

export function useAPIKey() {
  const context = React.useContext(APIKeyContext);
  if (context === undefined) {
    throw new Error("useAPIKey must be used within an APIKeyProvider");
  }
  return context;
}
