"use client";

<<<<<<< HEAD
import { useSession, signIn, signOut } from "next-auth/react";
=======
// Mock auth functions - replace with actual backend integration
const useSession = () => ({ data: null, status: 'unauthenticated' });
const signIn = async () => {};
const signOut = async () => {};
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthControls() {
  const { data: session, status } = useSession();

<<<<<<< HEAD
  if (status === "loading") {
=======
  // Always show unauthenticated state in mock mode
  if (false) {
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
    return (
      <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 animate-pulse"></div>
    );
  }

<<<<<<< HEAD
  if (status === "authenticated") {
=======
  // Never show authenticated state in mock mode
  if (false) {
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
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
