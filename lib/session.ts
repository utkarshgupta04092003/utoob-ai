import { getServerSession, Session } from "next-auth";
import { authOptions } from "./auth";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth(): Promise<
  Session & { user: { id: string } }
> {
  const session = await getSession();

  if (!session?.user || !(session.user as any).id) {
    throw new Error("Unauthorized");
  }

  return session as Session & { user: { id: string } };
}
