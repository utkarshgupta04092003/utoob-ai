import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-background to-muted/20">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-sm lg:flex flex-col text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary pb-4">
          Turn YouTube Videos <br /> into Viral Content
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
          Generate detailed summaries, structured notes, interactive quizzes,
          and ready-to-post social media threads using the power of AI.
        </p>
        <div className="flex gap-4 items-center justify-center">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="rounded-full font-semibold text-base px-8 h-12 shadow-lg shadow-primary/25"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
