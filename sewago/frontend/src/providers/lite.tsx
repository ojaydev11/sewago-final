"use client";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";

type LiteContextType = {
  lite: boolean;
  toggleLite: () => void;
};

const LiteContext = createContext<LiteContextType | undefined>(undefined);

export function LiteModeProvider({ children }: { children: ReactNode }) {
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("sewago_lite");
    if (stored) setLite(stored === "1");
  }, []);
  useEffect(() => {
    document.documentElement.dataset.lite = lite ? "1" : "0";
  }, [lite]);
  const toggleLite = () => {
    const next = !lite;
    setLite(next);
    localStorage.setItem("sewago_lite", next ? "1" : "0");
  };
  return <LiteContext.Provider value={{ lite, toggleLite }}>{children}</LiteContext.Provider>;
}

export function useLite() {
  const ctx = useContext(LiteContext);
  if (!ctx) throw new Error("useLite must be used within LiteModeProvider");
  return ctx;
}


