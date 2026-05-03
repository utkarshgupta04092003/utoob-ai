"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Provider } from "@/lib/ai";
import { APP_CONFIG } from "@/lib/config";
import { useAPIKey } from "@/providers/api-key-provider";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Settings,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { provider, model, apiKey, setProvider, setModel, setApiKey } =
    useAPIKey();
  const [tempKey, setTempKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTempKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    setApiKey(tempKey);
    setTestResult(null);
  };

  const handleRemove = () => {
    setApiKey("");
    setTempKey("");
    setTestResult(null);
  };

  const testKey = async () => {
    if (!tempKey) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey: tempKey, model }),
      });
      const data = await res.json();
      if (data.error) {
        setTestResult({ success: false, message: data.error });
      } else {
        setTestResult({ success: true, message: data.message });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setTesting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your AI configurations and API keys.
        </p>
      </div>

      <div className="grid gap-6">
        {/* AI Configuration */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>AI Provider</CardTitle>
                <CardDescription>
                  Select your preferred AI model provider.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Provider</label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as Provider)}
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai" disabled>
                    OpenAI (Not Available)
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Model</label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  {APP_CONFIG.models[provider].map(
                    (m: { id: string; name: string; available: boolean }) => (
                      <option key={m.id} value={m.id} disabled={!m.available}>
                        {m.name} {!m.available && "(Not Available)"}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <Input
                    type={showKey ? "text" : "password"}
                    placeholder={`Enter your ${provider === "openai" ? "OpenAI" : "Gemini"} API key`}
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    className="pr-10 bg-background/50 focus:bg-background transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <Button
                  variant="outline"
                  onClick={testKey}
                  disabled={testing || !tempKey}
                  className="shrink-0 gap-2 border-primary/20 hover:bg-primary/5 min-w-[120px]"
                >
                  {testing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  Test Key
                </Button>
              </div>

              {testResult && (
                <div
                  className={`mt-2 p-3 rounded-lg flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-1 ${
                    testResult.success
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {testResult.message}
                </div>
              )}

              <p className="text-[10px] text-muted-foreground italic">
                * Your key is stored safely in your browser&apos;s local
                storage.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                className="flex-1 gap-2 shadow-lg shadow-primary/20"
                disabled={!tempKey || testing}
              >
                <CheckCircle2 className="w-4 h-4" />
                Save Changes
              </Button>
              {apiKey && (
                <Button
                  variant="outline"
                  onClick={handleRemove}
                  className="gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5 border-dashed">
        <CardContent className="p-6">
          <div className="flex gap-4 items-start text-sm text-primary/80">
            <div className="p-2 bg-primary/10 rounded-full mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-primary">Your data is private</p>
              <p className="text-muted-foreground leading-relaxed">
                We don&apos;t store your API keys on our servers. They are
                stored locally in your browser&apos;s encrypted state and are
                only used to authenticate your requests directly with the AI
                providers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
