"use client";

import { cn } from "@/lib/utils";
import { Library, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Library", icon: Library },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 lg:flex-col">
      {ITEMS.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            title={compact ? item.label : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md text-small font-medium transition-colors",
              compact
                ? "h-9 w-9 justify-center sm:h-auto sm:w-auto sm:justify-start sm:px-3 sm:py-2"
                : "px-3 py-2",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className={compact ? "hidden sm:inline" : undefined}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
