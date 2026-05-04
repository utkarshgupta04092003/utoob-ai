import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";
export const dynamic = "force-dynamic";

export async function GET(req: any, res: any) {
  return await NextAuth(req, res, authOptions);
}

export async function POST(req: any, res: any) {
  return await NextAuth(req, res, authOptions);
}
