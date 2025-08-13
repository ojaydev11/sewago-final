"use client";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/providers/language";
import { useLite } from "@/providers/lite";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { 
  UserIcon, 
  BriefcaseIcon, 
  CogIcon, 
  LogoutIcon,
  ChevronDownIcon 
} from "@heroicons/react/24/outline";

export function Navbar() {
  const { lang, setLang } = useLanguage();
  const { lite, toggleLite } = useLite();
  const { data: session, status } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAuthenticated = status === "authenticated";
  const isProvider = session?.user?.role === "PROVIDER";

  return (
    <nav className="w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="SewaGo" width={28} height={28} />
          <span className="text-lg font-semibold">SewaGo</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/services" className="text-sm hover:text-blue-600 transition-colors">
            Services
          </Link>
          
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-sm hover:text-blue-600 transition-colors"
              >
                <UserIcon className="h-4 w-4" />
                <span>{session.user?.name}</span>
                <ChevronDownIcon className="h-3 w-3" />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  
                  {isProvider && (
                    <Link
                      href="/provider/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Provider Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      signOut();
                      setIsUserMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/account/login" className="text-sm hover:text-blue-600 transition-colors">
                Login
              </Link>
              <Link href="/account/register" className="text-sm hover:text-blue-600 transition-colors">
                Register
              </Link>
              <Link 
                href="/provider/register" 
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Become a Provider
              </Link>
            </>
          )}
          
          <button 
            className={`px-2 py-1 rounded ${lite ? 'bg-amber-600 text-white' : 'bg-gray-100'}`} 
            onClick={toggleLite}
          >
            Lite
          </button>
          
          <div className="flex items-center gap-1">
            <button 
              className={`px-2 py-1 rounded ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} 
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <button 
              className={`px-2 py-1 rounded ${lang === 'ne' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} 
              onClick={() => setLang('ne')}
            >
              ने
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}


