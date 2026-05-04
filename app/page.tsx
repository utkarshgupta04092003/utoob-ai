import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Brain,
  Layout,
  Share2,
  Sparkles,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/30">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <Youtube className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">uToob AI</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center text-sm font-medium text-muted-foreground">
            <Link
              href="#features"
              className="hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="rounded-full px-5">
                Dashboard
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>

          <div className="container px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-3 duration-1000">
              <Sparkles className="h-3 w-3" />
              <span>Powered by Gemini & OpenAI</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              Transform YouTube into <br />
              <span className="gradient-text">Actionable Wisdom</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-[800px] mx-auto mb-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
              The ultimate AI sidekick for content creators and learners. Turn
              any video into professional summaries, study notes, quizzes, and
              viral social posts in seconds.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="h-14 px-10 rounded-full text-lg font-bold shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                  Try for Free
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 rounded-full text-lg font-semibold bg-background/50"
              >
                How it works
              </Button>
            </div>

            {/* Hero Visual */}
            <div className="mt-20 relative max-w-6xl mx-auto animate-in fade-in zoom-in duration-1000 delay-500">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2.5rem] blur opacity-25"></div>
              <div className="relative bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden aspect-[16/10]">
                <Image
                  src="/hero-mockup.png"
                  alt="App Dashboard Preview"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-muted/30">
          <div className="container px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
              <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
                Stop spending hours re-watching videos. Let our AI handle the
                hard work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Smart Summaries",
                  desc: "Get the core message without the fluff. Detailed, structured, and precise.",
                  icon: Layout,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                },
                {
                  title: "AI Study Notes",
                  desc: "Clean, formatted markdown notes ready for your Notion or Obsidian.",
                  icon: BookOpen,
                  color: "text-purple-500",
                  bg: "bg-purple-500/10",
                },
                {
                  title: "Knowledge Quizzes",
                  desc: "Test your learning with AI-generated interactive quizzes based on video content.",
                  icon: Brain,
                  color: "text-pink-500",
                  bg: "bg-pink-500/10",
                },
                {
                  title: "Social Multiplier",
                  desc: "Instantly turn transcripts into viral Twitter threads and LinkedIn posts.",
                  icon: Share2,
                  color: "text-cyan-500",
                  bg: "bg-cyan-500/10",
                },
              ].map((feature, i) => (
                <Card
                  key={i}
                  className="border-border/50 bg-background/50 hover:border-primary/50 transition-all hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div
                      className={`${feature.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-6`}
                    >
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32">
          <div className="container px-6">
            <div className="glass rounded-[3rem] p-12 md:p-24 text-center overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold mb-8">
                  Ready to supercharge <br /> your YouTube experience?
                </h2>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-16 px-12 rounded-full text-xl font-bold shadow-xl shadow-primary/20"
                  >
                    Get Started for Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-background">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">uToob AI</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2026 uToob AI. All rights reserved. Built for creators by
              creators.
            </p>
            <div className="flex gap-6 text-sm font-medium text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Twitter
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
