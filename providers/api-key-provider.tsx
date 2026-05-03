"use client";

import { Provider } from "@/lib/ai";
import * as React from "react";

type APIKeyContextType = {
  provider: Provider;
  apiKey: string;
  setProvider: (provider: Provider) => void;
  setApiKey: (key: string) => void;
};

export const APIKeyContext = React.createContext<APIKeyContextType | undefined>(
  undefined,
);

export function APIKeyProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProviderState] = React.useState<Provider>("openai");
  const [apiKey, setApiKeyState] = React.useState<string>("");

  React.useEffect(() => {
    const savedProvider = localStorage.getItem(
      "ai_provider",
    ) as Provider | null;
    const savedKey = localStorage.getItem("ai_api_key");
    if (savedProvider) setProviderState(savedProvider);
    if (savedKey) setApiKeyState(savedKey);
  }, []);

  const setProvider = (newProvider: Provider) => {
    localStorage.setItem("ai_provider", newProvider);
    setProviderState(newProvider);
  };

  const setApiKey = (newKey: string) => {
    localStorage.setItem("ai_api_key", newKey);
    setApiKeyState(newKey);
  };

  return (
    <APIKeyContext.Provider
      value={{ provider, apiKey, setProvider, setApiKey }}
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
