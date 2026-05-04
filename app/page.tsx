import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Brain,
  Layout,
  MessageSquare,
  Share2,
  Sparkles,
  Youtube,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/30">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
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
            <Link href="/dashboard">
              <Button size="sm" className="rounded-full px-5">
                Dashboard
              </Button>
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center justify-center py-20 lg:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>

          <div className="container mx-auto px-6 text-center">
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
            </div>

            {/* Hero Visual */}
            <div className="mt-20 relative max-w-6xl mx-auto animate-in fade-in zoom-in duration-1000 delay-500">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2.5rem] blur opacity-25"></div>
              <div className="relative bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden aspect-[16/10]">
                <Image
                  src="/clean-mockup.png"
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
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
              <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
                Stop spending hours re-watching videos. Let our AI handle the
                hard work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  title: "Interactive AI Chat",
                  desc: "Ask questions and chat directly with any video to extract deep insights instantly.",
                  icon: MessageSquare,
                  color: "text-orange-500",
                  bg: "bg-orange-500/10",
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
                {
                  title: "Lightning Fast",
                  desc: "Analyze hour-long videos in under 30 seconds with our optimized AI pipeline.",
                  icon: Zap,
                  color: "text-yellow-500",
                  bg: "bg-yellow-500/10",
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

        {/* Watch Demo Section */}
        <section className="py-32 bg-background relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
                  <Brain className="h-3 w-3" />
                  <span>Interactive Learning</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Master any topic <br /> with AI-powered Quizzes
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Don&apos;t just watch—learn. uToob AI automatically generates
                  challenging quizzes based on the video content, helping you
                  reinforce your knowledge and track your progress instantly.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Multiple Choice", desc: "Structured testing" },
                    { label: "Instant Feedback", desc: "Learn as you go" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-muted/50 border border-border/50"
                    >
                      <div className="font-bold text-primary">{item.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 relative w-full">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-secondary/30 blur-2xl opacity-50 rounded-[2.5rem]"></div>

                {/* Real App UI Mockup */}
                <div className="relative bg-[#0a0a0a] border border-border/50 rounded-[2rem] shadow-2xl overflow-hidden pb-12">
                  {/* Top Nav Mockup */}
                  <div className="p-6 border-b border-white/5 flex items-center justify-center gap-6 text-xs font-medium text-muted-foreground overflow-x-auto whitespace-nowrap">
                    <span>Summary</span>
                    <span>AI Notes</span>
                    <span className="text-primary border-b-2 border-primary pb-1">
                      Quiz
                    </span>
                    <span>Social Posts</span>
                    <span>Chat with Video</span>
                  </div>

                  {/* Card Mockup mirroring the screenshot */}
                  <div className="p-8">
                    <div className="max-w-xl mx-auto bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 text-center md:text-left">
                          <h3 className="text-2xl font-bold">Study Quiz</h3>
                          <p className="text-sm text-muted-foreground max-w-[280px]">
                            Test your knowledge with multiple choice questions.
                          </p>
                        </div>
                        <Button className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                          Generate
                        </Button>
                      </div>
                      <div className="mt-6 pt-6 border-t border-white/5 text-sm text-muted-foreground italic text-center md:text-left">
                        No quiz generated yet.
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-2 left-6 flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32">
          <div className="container mx-auto px-6">
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
        <div className="container mx-auto px-6">
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
