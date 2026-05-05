"use client";

import { useState } from "react";

type TestResult = {
  success?: boolean;
  error?: string;
  hint?: string;
  videoId?: string;
  elapsed_ms?: number;
  char_count?: number;
  word_count?: number;
  preview?: string;
  raw_shape?: {
    content_type: string;
    is_array: boolean;
    array_length: number | null;
    keys: string[];
  };
  body?: string;
};

export default function TestTranscriptPage() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const test = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/test-transcript?url=${encodeURIComponent(url)}`,
      );
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = result?.success === true;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">🧪 Supadata Transcript Test</h1>
        <p className="text-muted-foreground text-sm">
          Tests the Supadata API directly. Requires{" "}
          <code className="bg-muted px-1 rounded text-xs">SUPADATA_API_KEY</code>{" "}
          in your <code className="bg-muted px-1 rounded text-xs">.env</code> file.
          Get a free key at{" "}
          <a
            href="https://dash.supadata.ai"
            target="_blank"
            className="text-primary underline"
          >
            dash.supadata.ai
          </a>
        </p>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 bg-background text-sm"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="YouTube URL"
        />
        <button
          onClick={test}
          disabled={loading}
          className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 shrink-0"
        >
          {loading ? "Testing..." : "Test"}
        </button>
      </div>

      {result && (
        <div
          className={`rounded-xl border p-5 space-y-4 ${
            isSuccess
              ? "border-green-500/30 bg-green-500/5"
              : "border-red-500/30 bg-red-500/5"
          }`}
        >
          {/* Status */}
          <div className="flex items-center gap-2 font-bold text-lg">
            {isSuccess ? (
              <span className="text-green-600 dark:text-green-400">✅ Success</span>
            ) : (
              <span className="text-red-600 dark:text-red-400">❌ Failed</span>
            )}
            {result.elapsed_ms && (
              <span className="text-muted-foreground text-sm font-normal">
                ({result.elapsed_ms}ms)
              </span>
            )}
          </div>

          {/* Error */}
          {result.error && (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                Error: {result.error}
              </p>
              {result.hint && (
                <p className="text-xs text-muted-foreground">{result.hint}</p>
              )}
            </div>
          )}

          {/* Stats */}
          {isSuccess && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-background rounded-lg p-3 text-center border">
                <div className="text-xl font-bold text-primary">
                  {result.word_count?.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">words</div>
              </div>
              <div className="bg-background rounded-lg p-3 text-center border">
                <div className="text-xl font-bold text-primary">
                  {result.char_count?.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">characters</div>
              </div>
              <div className="bg-background rounded-lg p-3 text-center border">
                <div className="text-xl font-bold text-primary">
                  {result.elapsed_ms}
                </div>
                <div className="text-xs text-muted-foreground">ms</div>
              </div>
            </div>
          )}

          {/* Preview */}
          {result.preview && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Transcript Preview
              </p>
              <p className="text-sm bg-background border rounded-lg p-4 leading-relaxed font-mono">
                {result.preview}
              </p>
            </div>
          )}

          {/* Raw shape */}
          {result.raw_shape && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">
                Raw response shape
              </summary>
              <pre className="mt-2 bg-muted rounded p-3 overflow-auto">
                {JSON.stringify(result.raw_shape, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground border rounded-lg p-4 space-y-1 bg-muted/30">
        <p className="font-semibold">Quick test URLs:</p>
        {[
          { label: "Rick Astley — Never Gonna Give You Up", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { label: "Me at the zoo (first YouTube video)", url: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
          { label: "Y Combinator — How to Start a Startup", url: "https://www.youtube.com/watch?v=CBYhVcO4WgI" },
        ].map((v) => (
          <button
            key={v.url}
            onClick={() => setUrl(v.url)}
            className="block text-left text-primary hover:underline"
          >
            → {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
