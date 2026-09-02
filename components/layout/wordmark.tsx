import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Wordmark({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2 px-1 transition-opacity hover:opacity-80",
        className,
      )}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-primary text-[13px] font-semibold leading-none text-primary-foreground">
        u
      </span>
      <span className="truncate font-display text-h3 leading-none text-foreground">
        {APP_CONFIG.appName}
      </span>
    </Link>
  );
}
