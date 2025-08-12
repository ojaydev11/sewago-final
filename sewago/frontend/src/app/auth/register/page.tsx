"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import type { AxiosError } from "axios";
import { Suspense } from "react";

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = (params.get("role") as "user" | "provider") ?? "user";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "provider">(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/register", { name, email, phone, password, role });
      localStorage.setItem("sewago_access", res.data.accessToken);
      router.push("/services");
    } catch (err) {
      const ax = err as AxiosError<{ message?: string } | undefined>;
      const msg = ax.response?.data?.message ?? "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleRegister} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-sm"><input type="radio" checked={role==='user'} onChange={() => setRole('user')} /> User</label>
          <label className="flex items-center gap-1 text-sm"><input type="radio" checked={role==='provider'} onChange={() => setRole('provider')} /> Provider</label>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="bg-blue-700 text-white px-4 py-2 rounded w-full">{loading ? "Loading..." : "Create Account"}</button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterInner />
    </Suspense>
  );
}


