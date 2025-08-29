<<<<<<< HEAD
"use client";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
=======
'use client';
import 'client-only';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

type Lang = "en" | "ne";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const stored = localStorage.getItem("sewago_lang") as Lang | null;
    if (stored) setLangState(stored);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("sewago_lang", l);
  };
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}


