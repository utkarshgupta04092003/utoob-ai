import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { authOptions } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/config";
import { Settings } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="font-bold text-xl tracking-tight text-primary"
          >
            {APP_CONFIG.appName}
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-primary/5"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Settings</span>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
