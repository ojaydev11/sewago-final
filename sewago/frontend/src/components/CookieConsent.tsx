"use client";
import { useEffect, useState } from "react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try {
      const v = localStorage.getItem("cookie_consent_v1");
      if (!v) setVisible(true);
    } catch {}
  }, []);
  if (!visible) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-6xl m-3 rounded-lg border bg-white shadow p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-700">
          We use cookies to improve your experience. By using SewaGo you agree to our
          <a href="/privacy" className="underline ml-1">Privacy Policy</a> and
          <a href="/terms" className="underline ml-1">Terms</a>.
        </p>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 rounded bg-slate-100 text-slate-800 text-sm"
            onClick={() => {
              setVisible(false);
            }}
          >
            Dismiss
          </button>
          <button
            className="px-3 py-1.5 rounded bg-red-600 text-white text-sm"
            onClick={() => {
              try { localStorage.setItem("cookie_consent_v1", "true"); } catch {}
              setVisible(false);
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

