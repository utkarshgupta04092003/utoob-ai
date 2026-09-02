import { Wordmark } from "@/components/layout/wordmark";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/config";
import { ArrowRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import {
  ChatSample,
  NotesSample,
  QuizSample,
  SummarySample,
} from "./_components/samples";

const BANDS = [
  {
    label: "Read",
    title: "The whole video, in the time it takes to drink coffee",
    body: "A structured summary with key points, deep insights, and the quotes worth keeping. Set like an article, not dumped like a chat log.",
    sample: <SummarySample />,
  },
  {
    label: "Test",
    title: "Find out what actually stuck",
    body: "Generated multiple-choice questions with explanations, one at a time, scored as you go. Because re-reading is not the same as remembering.",
    sample: <QuizSample />,
  },
  {
    label: "Ask",
    title: "Interrogate the transcript",
    body: "Ask follow-up questions and get answers grounded in what was actually said, streamed back as you read.",
    sample: <ChatSample />,
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);
  const href = session ? "/dashboard" : "/login";
  const cta = session ? "Open dashboard" : "Get started";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 lg:px-10">
          <Wordmark />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href={href}>
              <Button size="sm">{session ? "Dashboard" : "Sign in"}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl overflow-hidden px-5 pb-20 pt-16 lg:overflow-visible lg:px-10 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
            <div className="min-w-0 max-w-xl">
              <p className="font-mono text-small uppercase tracking-wide text-muted-foreground">
                Gemini · OpenAI
              </p>
              <h1 className="mt-5 font-display text-display text-foreground">
                Watch once.
                <br />
                Keep everything.
              </h1>
              <p className="mt-6 max-w-md text-read leading-relaxed text-muted-foreground">
                {APP_CONFIG.appName} turns any YouTube video into a summary,
                structured notes, a quiz, and a conversation you can search.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href={href}>
                  <Button size="lg" className="gap-2">
                    {cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how">
                  <Button size="lg" variant="ghost">
                    See how it works
                  </Button>
                </Link>
              </div>
            </div>

            <div className="min-w-0 lg:-mr-32">
              <NotesSample tall />
            </div>
          </div>
        </section>

        <section id="how" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-5 lg:px-10">
            {BANDS.map((band, i) => (
              <div
                key={band.label}
                className="grid items-center gap-10 border-b border-border py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:py-24"
              >
                <div className={cn("min-w-0", i % 2 === 1 && "lg:order-2")}>
                  <p className="font-mono text-small uppercase tracking-wide text-muted-foreground">
                    {band.label}
                  </p>
                  <h2 className="mt-4 max-w-md font-display text-h1 leading-tight text-foreground">
                    {band.title}
                  </h2>
                  <p className="mt-4 max-w-md text-body leading-relaxed text-muted-foreground">
                    {band.body}
                  </p>
                </div>
                <div className={cn("min-w-0", i % 2 === 1 && "lg:order-1")}>
                  {band.sample}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 lg:px-10 lg:py-28">
          <div className="rounded-lg border border-border px-5 py-14 text-center sm:px-8 lg:py-20">
            <h2 className="mx-auto max-w-lg font-display text-h1 leading-tight text-foreground">
              Your watch-later list is a graveyard. Fix it.
            </h2>
            <div className="mt-8 flex justify-center">
              <Link href={href}>
                <Button size="lg" className="gap-2">
                  {cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-small text-muted-foreground sm:flex-row lg:px-10">
          <Wordmark />
          <p>
            © {new Date().getFullYear()} {APP_CONFIG.appName}
          </p>
        </div>
      </footer>
    </div>
  );
}
