"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Brain, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Panel } from "../panel";

function Question({
  question,
  index,
  selected,
  onSelect,
}: {
  question: any;
  index: number;
  selected: string | null;
  onSelect: (opt: string) => void;
}) {
  const isCorrect = selected === question.correctAnswer;

  return (
    <div className="space-y-5">
      <div className="prose-measure space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-small text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <Badge variant="outline">{question.difficulty}</Badge>
        </div>
        <h4 className="font-display text-h2 leading-snug text-foreground">
          {question.question}
        </h4>
      </div>

      <div className="grid max-w-2xl gap-2">
        {question.options.map((opt: string, j: number) => {
          const isSelected = selected === opt;
          const isAnswer = opt === question.correctAnswer;

          let state = "border-border hover:border-foreground/30 hover:bg-muted";
          if (selected) {
            if (isAnswer) state = "border-success/40 bg-success/5 text-success";
            else if (isSelected)
              state = "border-destructive/40 bg-destructive/5 text-destructive";
            else state = "border-border opacity-55";
          }

          return (
            <button
              key={j}
              disabled={!!selected}
              onClick={() => onSelect(opt)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md border p-3.5 text-left text-body transition-colors",
                state,
                !selected && "cursor-pointer",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border font-mono text-small",
                  isSelected || (selected && isAnswer)
                    ? "border-current"
                    : "border-border text-muted-foreground",
                )}
              >
                {String.fromCharCode(65 + j)}
              </span>
              <span className="text-foreground">{opt}</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="prose-measure animate-fade-in rounded-md border border-border bg-muted/50 p-4">
          <p
            className={cn(
              "mb-1.5 text-body font-medium",
              isCorrect ? "text-success" : "text-destructive",
            )}
          >
            {isCorrect ? "Correct" : "Not quite"}
          </p>
          <p className="text-body leading-relaxed text-muted-foreground">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

export function QuizPanel({
  quiz,
  loading,
  onGenerate,
  quizResults,
  setQuizResults,
}: {
  quiz: any;
  loading: boolean;
  onGenerate: () => void;
  quizResults: Record<number, boolean>;
  setQuizResults: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}) {
  const hasContent = !!(quiz && quiz.length > 0);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    setCurrent(0);
    setAnswers({});
  }, [quiz]);

  const total = hasContent ? quiz.length : 0;
  const answered = Object.keys(answers).length;
  const score = Object.values(quizResults).filter(Boolean).length;
  const finished = hasContent && answered === total;

  const handleSelect = (opt: string) => {
    const q = quiz[current];
    setAnswers((prev) => ({ ...prev, [current]: opt }));
    setQuizResults((prev) => ({
      ...prev,
      [current]: opt === q.correctAnswer,
    }));
  };

  const reset = () => {
    setAnswers({});
    setQuizResults({});
    setCurrent(0);
  };

  return (
    <Panel
      title="Quiz"
      description="Check what actually stuck."
      hasContent={hasContent}
      loading={loading}
      onGenerate={onGenerate}
      emptyIcon={Brain}
      emptyText="No quiz yet"
    >
      {hasContent && (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="flex flex-1 gap-1">
              {quiz.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  aria-label={`Question ${idx + 1}`}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    quizResults[idx] === true
                      ? "bg-success"
                      : quizResults[idx] === false
                        ? "bg-destructive"
                        : idx === current
                          ? "bg-foreground"
                          : "bg-border",
                  )}
                />
              ))}
            </div>
            <span className="shrink-0 font-mono text-small text-muted-foreground">
              {score}/{total}
            </span>
          </div>

          {finished ? (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-8 text-center">
                <p className="font-mono text-small uppercase tracking-wide text-muted-foreground">
                  Score
                </p>
                <p className="mt-2 font-display text-display leading-none text-foreground">
                  {score}
                  <span className="text-muted-foreground">/{total}</span>
                </p>
                <Button
                  variant="outline"
                  onClick={reset}
                  className="mt-6 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try again
                </Button>
              </div>
              <div className="space-y-10 border-t border-border pt-8">
                {quiz.map((q: any, i: number) => (
                  <Question
                    key={i}
                    question={q}
                    index={i}
                    selected={answers[i] ?? null}
                    onSelect={() => {}}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <Question
                key={current}
                question={quiz[current]}
                index={current}
                selected={answers[current] ?? null}
                onSelect={handleSelect}
              />
              <div className="flex items-center justify-between border-t border-border pt-5">
                <Button
                  variant="ghost"
                  disabled={current === 0}
                  onClick={() => setCurrent((c) => c - 1)}
                  className="gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="font-mono text-small text-muted-foreground">
                  {current + 1} / {total}
                </span>
                <Button
                  variant="ghost"
                  disabled={current === total - 1}
                  onClick={() => setCurrent((c) => c + 1)}
                  className="gap-1.5"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Panel>
  );
}
