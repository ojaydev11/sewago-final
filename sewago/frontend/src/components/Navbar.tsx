
'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="w-full">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-sg-primary text-white grid place-items-center font-bold">S</div>
          <span className="text-xl font-bold text-sg-text tracking-wide">SEWAGO</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/signin" className="text-sg-text/80 hover:text-sg-text font-medium">Sign in</Link>
          <button aria-label="Menu" className="p-2 rounded-lg hover:bg-sg-sky1 text-sg-text">
            <Menu size={22}/>
          </button>
        </div>
      </nav>
    </header>
  );
}
