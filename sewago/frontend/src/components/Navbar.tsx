
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

// Conditional auth component that only renders when auth is enabled
function AuthNavbar({ isScrolled }: { isScrolled: boolean }) {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      {session ? (
        <div className="relative group">
          <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white hover:bg-white/30 transition-all duration-300">
            <UserCircleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{session.user?.name || 'User'}</span>
          </button>
          
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
            <div className="py-2">
              <Link 
                href="/dashboard/user" 
                className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors duration-200"
              >
                <UserCircleIcon className="w-4 h-4 mr-3" />
                Dashboard
              </Link>
              <Link 
                href="/account" 
                className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors duration-200"
              >
                <Cog6ToothIcon className="w-4 h-4 mr-3" />
                Account
              </Link>
              <hr className="my-1" />
              <button 
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Link 
            href="/auth/login" 
            className={`text-sm font-medium transition-colors duration-300 ${
              isScrolled 
                ? 'text-slate-700 hover:text-primary' 
                : 'text-white hover:text-primary-200'
            }`}
          >
            Sign In
          </Link>
          <Link 
            href="/auth/register" 
            className="btn-primary text-sm px-4 py-2"
          >
            Get Started
          </Link>
        </>
      )}
    </>
  );
}

// Mobile auth component
function MobileAuthNavbar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    setIsOpen(false);
  };

  return (
    <>
      {session ? (
        <>
          <hr className="my-2" />
          <Link 
            href="/dashboard/user" 
            className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            <UserCircleIcon className="w-4 h-4 mr-3" />
            Dashboard
          </Link>
          <button 
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </>
      ) : (
        <>
          <hr className="my-2" />
          <Link 
            href="/auth/login" 
            className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            Sign In
          </Link>
          <Link 
            href="/auth/register" 
            className="block px-4 py-2 bg-primary text-white rounded-lg text-center font-medium"
            onClick={() => setIsOpen(false)}
          >
            Get Started
          </Link>
        </>
      )}
    </>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200' 
        : 'bg-transparent'
    }`}>
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className={`text-xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-slate-900' : 'text-white'
            }`}>
              SewaGo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`flex items-center text-sm font-medium transition-colors duration-300 ${
                isScrolled ? 'text-slate-700 hover:text-primary' : 'text-white hover:text-primary-200'
              }`}
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Home
            </Link>
            <Link 
              href="/services" 
              className={`flex items-center text-sm font-medium transition-colors duration-300 ${
                isScrolled ? 'text-slate-700 hover:text-primary' : 'text-white hover:text-primary-200'
              }`}
            >
              <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
              Services
            </Link>
            <Link 
              href="/about" 
              className={`flex items-center text-sm font-medium transition-colors duration-300 ${
                isScrolled ? 'text-slate-700 hover:text-primary' : 'text-white hover:text-primary-200'
              }`}
            >
              <UserGroupIcon className="w-4 h-4 mr-2" />
              About
            </Link>
            <Link 
              href="/contact" 
              className={`flex items-center text-sm font-medium transition-colors duration-300 ${
                isScrolled ? 'text-slate-700 hover:text-primary' : 'text-white hover:text-primary-200'
              }`}
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
              Contact
            </Link>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {FEATURE_FLAGS.AUTH_ENABLED ? (
              <AuthNavbar isScrolled={isScrolled} />
            ) : (
              // Auth disabled - show "coming soon" message
              <span className={`text-sm font-medium transition-colors duration-300 ${
                isScrolled 
                  ? 'text-slate-500' 
                  : 'text-white/70'
              }`}>
                Login (coming soon)
              </span>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
              isScrolled 
                ? 'text-slate-700 hover:bg-slate-100' 
                : 'text-white hover:bg-white/20'
            }`}
          >
            {isOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 py-4">
            <div className="space-y-2">
              <Link 
                href="/" 
                className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                <HomeIcon className="w-4 h-4 mr-3" />
                Home
              </Link>
              <Link 
                href="/services" 
                className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                <WrenchScrewdriverIcon className="w-4 h-4 mr-3" />
                Services
              </Link>
              <Link 
                href="/about" 
                className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                <UserGroupIcon className="w-4 h-4 mr-3" />
                About
              </Link>
              <Link 
                href="/contact" 
                className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-3" />
                Contact
              </Link>
              
              {FEATURE_FLAGS.AUTH_ENABLED ? (
                <MobileAuthNavbar isOpen={isOpen} setIsOpen={setIsOpen} />
              ) : (
                <>
                  <hr className="my-2" />
                  <span className="block px-4 py-2 text-slate-500 text-center">
                    Login (coming soon)
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
