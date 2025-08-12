"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { emailOrPhone, password });
      localStorage.setItem("sewago_access", res.data.accessToken);
      router.push("/services");
    } catch (err) {
      const ax = err as AxiosError<{ message?: string } | undefined>;
      const msg = ax.response?.data?.message ?? "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Email or Phone" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded w-full">{loading ? "Loading..." : "Login"}</button>
      </form>
    </div>
  );
}


