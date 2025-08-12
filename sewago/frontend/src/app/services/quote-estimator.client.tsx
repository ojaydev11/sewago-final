"use client";
import React, { useMemo, useState } from "react";

export function QuoteEstimator() {
  const enabled = useMemo(() => process.env.NEXT_PUBLIC_QUOTE_ESTIMATOR_ENABLED === "true", []);
  // define hooks unconditionally to satisfy hooks rules
  const [serviceType, setServiceType] = useState("plumbing");
  const [city, setCity] = useState("");
  const [hours, setHours] = useState(2);
  const [extras, setExtras] = useState<string[]>([]);
  const [result, setResult] = useState<{ min: number; max: number; currency: string } | null>(null);
  const [loading, setLoading] = useState(false);
  if (!enabled) return null;

  async function estimate() {
    setLoading(true);
    try {
      const res = await fetch("/api/estimate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ serviceType, city, hours, extras }) });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function toggleExtra(name: string) {
    setExtras((e) => (e.includes(name) ? e.filter((x) => x !== name) : [...e, name]));
  }

  return (
    <div className="border rounded p-4 bg-white mt-6">
      <h2 className="font-semibold mb-3">Instant Quote Estimator</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="border rounded px-3 py-2" aria-label="Service type">
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="cleaning">Cleaning</option>
          <option value="moving">Moving</option>
          <option value="repairs">Repairs</option>
          <option value="gardening">Gardening</option>
        </select>
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="border rounded px-3 py-2" aria-label="City" />
        <input type="number" min={1} max={12} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="border rounded px-3 py-2" aria-label="Hours" />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={extras.includes("materials")} onChange={() => toggleExtra("materials")} /> Materials</label>
          <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={extras.includes("urgent")} onChange={() => toggleExtra("urgent")} /> Urgent</label>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button onClick={estimate} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">{loading ? "Estimating..." : "Get estimate"}</button>
      </div>
      {result && (
        <div className="mt-3 text-sm text-slate-700">Estimated range: <strong>Rs. {result.min} - {result.max}</strong></div>
      )}
    </div>
  );
}


