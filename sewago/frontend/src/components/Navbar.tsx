"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/providers/language";
import { useLite } from "@/providers/lite";
import { homeHref } from "@/lib/links";

export function Navbar() {
  const { lang, setLang } = useLanguage();
  const { lite, toggleLite } = useLite();
  return (
    <nav className="w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href={homeHref} className="flex items-center gap-2">
          <Image src="/logo.svg" alt="SewaGo" width={28} height={28} />
          <span className="text-lg font-semibold">SewaGo</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/services" className="text-sm">Services</Link>
          <Link href="/auth/login" className="text-sm">Login</Link>
          <Link href="/auth/register" className="text-sm">Register</Link>
          <button className={`px-2 py-1 rounded ${lite ? 'bg-amber-600 text-white' : 'bg-gray-100'}`} onClick={toggleLite}>Lite</button>
          <div className="flex items-center gap-1">
            <button className={`px-2 py-1 rounded ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => setLang('en')}>EN</button>
            <button className={`px-2 py-1 rounded ${lang === 'ne' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => setLang('ne')}>ने</button>
          </div>
        </div>
      </div>
    </nav>
  );
}


