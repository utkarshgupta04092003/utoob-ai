import { AppShell } from "@/components/layout/app-shell";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
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
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-10">
        {children}
      </div>
    </AppShell>
  );
}
