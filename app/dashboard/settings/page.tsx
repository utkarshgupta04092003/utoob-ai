"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Provider } from "@/lib/ai";
import { APP_CONFIG, PROVIDERS } from "@/lib/config";
import { ENDPOINTS } from "@/lib/endpoint";
import { useAPIKey } from "@/providers/api-key-provider";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 border-t border-border py-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-8">
      <div className="space-y-1">
        <h3 className="font-sans text-body font-medium text-foreground">{label}</h3>
        <p className="text-small text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { provider, model, apiKey, setProvider, setModel, setApiKey } =
    useAPIKey();
  const [tempKey, setTempKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();
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
    toast("Settings saved.", "success");
  };

  const handleRemove = () => {
    setApiKey("");
    setTempKey("");
    setTestResult(null);
    toast("API key removed.", "info");
  };

  const testKey = async () => {
    if (!tempKey) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(ENDPOINTS.TEST_KEY, {
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
    <div className="max-w-3xl space-y-8">
      <div className="space-y-1">
        <h1 className="font-display text-h1 text-foreground">Settings</h1>
        <p className="text-body text-muted-foreground">
          Your key is stored in this browser only — never on our servers.
        </p>
      </div>

      <div>
        <Row
          label="Provider"
          description="Which service runs your generations."
        >
          <Select
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
          >
            <option value={PROVIDERS.GEMINI}>Google Gemini</option>
            <option value={PROVIDERS.OPENAI} disabled>
              OpenAI (Not Available)
            </option>
          </Select>
        </Row>

        <Row label="Model" description="Larger models are slower but sharper.">
          <Select value={model} onChange={(e) => setModel(e.target.value)}>
            {APP_CONFIG.models[provider].map(
              (m: { id: string; name: string; available: boolean }) => (
                <option key={m.id} value={m.id} disabled={!m.available}>
                  {m.name} {!m.available && "(Not Available)"}
                </option>
              ),
            )}
          </Select>
        </Row>

        <Row
          label="API key"
          description={`Your ${provider === PROVIDERS.OPENAI ? "OpenAI" : "Gemini"} key, kept in local storage.`}
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="Paste your key"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="pr-10 font-mono text-small"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? "Hide key" : "Show key"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <Button
              variant="outline"
              onClick={testKey}
              disabled={testing || !tempKey}
              className="shrink-0 gap-2"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Test
            </Button>
          </div>

          {testResult && (
            <p
              className={`flex items-start gap-2 text-small ${
                testResult.success ? "text-success" : "text-destructive"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              )}
              {testResult.message}
            </p>
          )}
        </Row>
      </div>

      <div className="flex gap-3 border-t border-border pt-6">
        <Button onClick={handleSave} disabled={!tempKey || testing}>
          Save changes
        </Button>
        {apiKey && (
          <Button variant="ghost" onClick={handleRemove}>
            Remove key
          </Button>
        )}
      </div>
    </div>
  );
}
