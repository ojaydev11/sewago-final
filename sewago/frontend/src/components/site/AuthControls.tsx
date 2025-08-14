"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthControls() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 animate-pulse"></div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="btn-outline">Dashboard</Link>
        <button onClick={() => signOut()} className="btn-outline">Logout</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/account/login" className="btn-outline">Login</Link>
      <button onClick={() => signIn()} className="btn">Get Started</button>
    </div>
  );
}
