import { Wordmark } from "@/components/layout/wordmark";
import Link from "next/link";
import * as React from "react";

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[2fr_3fr]">
      <div className="hidden flex-col justify-between border-r border-border bg-muted/40 p-10 lg:flex">
        <Wordmark />
        <blockquote className="max-w-sm space-y-4">
          <p className="font-display text-h1 leading-tight text-foreground">
            Stop re-watching. Start remembering.
          </p>
          <p className="text-body text-muted-foreground">
            Turn any video into a summary, structured notes, a quiz, and a
            conversation you can actually search.
          </p>
        </blockquote>
        <p className="font-mono text-small uppercase tracking-wide text-muted-foreground">
          Gemini · OpenAI
        </p>
      </div>

      <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Wordmark />
          </div>

          <div className="mb-8 space-y-1.5">
            <h1 className="font-display text-h1 text-foreground">{title}</h1>
            <p className="text-body text-muted-foreground">{description}</p>
          </div>

          {children}

          <div className="mt-8 space-y-4 border-t border-border pt-6">
            {footer}
            <Link
              href="/"
              className="block text-small text-muted-foreground transition-colors hover:text-foreground"
            >
              &larr; Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Field({
  id,
  label,
  ...props
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-small font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-body ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
    </div>
  );
}
