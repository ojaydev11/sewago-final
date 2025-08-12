"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

function isEnabled() {
  return process.env.NEXT_PUBLIC_SEWAAI_ENABLED === "true";
}

type Message = { role: "user" | "assistant"; content: string };

export function SewaAIWidget() {
  const enabled = isEnabled();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [intent, setIntent] = useState("Find a service");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm SewaAI. Ask me about services, quotes, or booking." },
  ]);
  const intents = useMemo(() => [
    "Find a service",
    "Get quote",
    "Book now",
    "Estimate cost",
    "Switch language",
  ], []);
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  if (!enabled) return null;

  async function send() {
    if (!input.trim()) return;
    const user = { role: "user" as const, content: input };
    setMessages((m) => [...m, user]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q: input, intent }) });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: String(data?.answer ?? "") }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, failed to respond." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <button
          aria-label="Open SewaAI assistant"
          onClick={() => setOpen(true)}
          className="rounded-full bg-red-600 text-white px-4 py-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >SewaAI</button>
      )}
      {open && (
        <div className="w-80 h-96 bg-white border rounded shadow-lg flex flex-col">
          <div className="px-3 py-2 border-b flex items-center justify-between">
            <span className="font-semibold">SewaAI</span>
            <button aria-label="Close" onClick={() => setOpen(false)} className="text-sm">✕</button>
          </div>
          <div className="p-3 border-b flex gap-2">
            <select value={intent} onChange={(e) => setIntent(e.target.value)} className="border rounded px-2 py-1 text-sm">
              {intents.map((i) => (<option key={i} value={i}>{i}</option>))}
            </select>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "assistant" ? "text-sm bg-slate-100 rounded p-2" : "text-sm bg-red-50 rounded p-2 ml-6"}>
                {m.content}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="p-3 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              className="border rounded px-2 py-1 text-sm flex-1"
              placeholder="Type your question..."
              aria-label="Message"
            />
            <button onClick={send} disabled={loading} className="bg-red-600 text-white text-sm px-3 py-1 rounded disabled:opacity-50">Send</button>
          </div>
        </div>
      )}
    </div>
  );
}


