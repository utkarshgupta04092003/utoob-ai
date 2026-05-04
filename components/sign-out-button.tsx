"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-medium hover:underline px-3 py-2 text-red-500 hover:text-red-600 transition-colors"
    >
      Sign out
    </button>
  );
}
