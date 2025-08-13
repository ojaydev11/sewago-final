'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
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

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-primary rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-lg lg:text-xl">🇳🇵</span>
            </div>
            <div className="flex flex-col">
              <span className={`text-xl lg:text-2xl font-bold transition-colors duration-300 ${
                isScrolled ? 'text-gray-800' : 'text-white'
              }`}>
                SewaGo
              </span>
              <span className={`text-xs lg:text-sm transition-colors duration-300 ${
                isScrolled ? 'text-gray-600' : 'text-white/80'
              }`}>
                Nepal's Service Hub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`nav-link ${isScrolled ? 'text-gray-700 hover:text-red-600' : 'text-white hover:text-red-200'}`}
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Home
            </Link>
            <Link 
              href="/services" 
              className={`nav-link ${isScrolled ? 'text-gray-700 hover:text-red-600' : 'text-white hover:text-red-200'}`}
            >
              <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
              Services
            </Link>
            <Link 
              href="/about" 
              className={`nav-link ${isScrolled ? 'text-gray-700 hover:text-red-600' : 'text-white hover:text-red-200'}`}
            >
              <UserGroupIcon className="w-5 h-5 mr-2" />
              About
            </Link>
            <Link 
              href="/contact" 
              className={`nav-link ${isScrolled ? 'text-gray-700 hover:text-red-600' : 'text-white hover:text-red-200'}`}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Contact
            </Link>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {session ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white hover:bg-white/30 transition-all duration-300">
                  <UserCircleIcon className="w-6 h-6" />
                  <span className="font-medium">{session.user?.name || 'User'}</span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="py-2">
                    <Link 
                      href="/dashboard/user" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <UserCircleIcon className="w-5 h-5 mr-3" />
                      Dashboard
                    </Link>
                    <Link 
                      href="/account" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Cog6ToothIcon className="w-5 h-5 mr-3" />
                      Account
                    </Link>
                    <hr className="my-2" />
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-red-600' 
                      : 'text-white hover:text-red-200'
                  }`}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register" 
                  className="btn-primary px-6 py-2 text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
              isScrolled 
                ? 'text-gray-700 hover:bg-gray-100' 
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
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-2">
            <Link 
              href="/" 
              className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              <HomeIcon className="w-5 h-5 inline mr-3" />
              Home
            </Link>
            <Link 
              href="/services" 
              className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              <WrenchScrewdriverIcon className="w-5 h-5 inline mr-3" />
              Services
            </Link>
            <Link 
              href="/about" 
              className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              <UserGroupIcon className="w-5 h-5 inline mr-3" />
              About
            </Link>
            <Link 
              href="/contact" 
              className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 inline mr-3" />
              Contact
            </Link>
            
            <hr className="my-2" />
            
            {session ? (
              <div className="space-y-2">
                <Link 
                  href="/dashboard/user" 
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <UserCircleIcon className="w-5 h-5 inline mr-3" />
                  Dashboard
                </Link>
                <Link 
                  href="/account" 
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <Cog6ToothIcon className="w-5 h-5 inline mr-3" />
                  Account
                </Link>
                <button 
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 inline mr-3" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link 
                  href="/auth/login" 
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register" 
                  className="block px-4 py-3 bg-gradient-primary text-white rounded-lg text-center font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


