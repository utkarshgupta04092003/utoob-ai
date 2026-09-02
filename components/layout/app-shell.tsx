import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Wordmark } from "@/components/layout/wordmark";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import * as React from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-3 lg:h-screen lg:w-[220px] lg:shrink-0 lg:flex-col lg:items-stretch lg:justify-start lg:border-b-0 lg:border-r lg:px-3 lg:py-5">
        <Wordmark />

        <div className="hidden flex-1 lg:mt-8 lg:block">
          <SidebarNav />
        </div>

        <div className="flex items-center gap-1 lg:flex-col lg:items-stretch lg:gap-2">
          <div className="lg:hidden">
            <SidebarNav />
          </div>
          <div className="flex items-center justify-between lg:border-t lg:border-border lg:pt-3">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="font-display text-h1 text-foreground">{title}</h1>
        {description && (
          <p className="text-body text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
