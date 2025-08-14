
'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <header className='w-full relative z-50'>
      {/* Background with glassmorphism */}
      <div className='absolute inset-0 glass-card border-b border-white/20'></div>
      
      <nav className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between'>
        {/* Logo with enhanced styling */}
        <Link href='/' className='flex items-center gap-4 group'>
          <div className='relative'>
            <div className='h-12 w-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-0.5 group-hover:scale-110 transition-transform duration-300'>
              <div className='h-full w-full rounded-2xl bg-white flex items-center justify-center'>
                <span className='text-gray-900 font-black text-xl'>S</span>
              </div>
            </div>
            {/* Glow effect */}
            <div className='absolute inset-0 h-12 w-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300'></div>
          </div>
          
          <div className='flex flex-col'>
            <span className='text-2xl font-black text-white tracking-wider group-hover:text-blue-200 transition-colors duration-300'>
              SEWAGO
            </span>
            <span className='text-xs text-white/60 font-mono tracking-widest'>
              FUTURE OF SERVICES
            </span>
          </div>
        </Link>
        
        {/* Navigation items */}
        <div className='flex items-center gap-8'>
          {/* Sign in link with enhanced styling */}
          <Link 
            href='/auth/login' 
            className='relative px-6 py-3 text-white font-medium hover:text-blue-200 transition-colors duration-300 group min-h-[44px] min-w-[44px] flex items-center'
          >
            <span className='relative z-10'>Sign in</span>
            {/* Hover underline effect */}
            <div className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300'></div>
          </Link>
          
          {/* Menu button with modern styling */}
          <button 
            aria-label='Menu' 
            className='relative p-3 rounded-2xl glass-card hover:bg-white/20 hover:border-white/40 transition-all duration-300 group min-h-[44px] min-w-[44px] flex items-center justify-center'
          >
            <Menu size={24} className='text-white group-hover:text-blue-200 transition-colors duration-300' />
            
            {/* Hover glow effect */}
            <div className='absolute inset-0 rounded-2xl bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
          </button>
        </div>
      </nav>
      
      {/* Bottom accent line */}
      <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-blue-400 to-purple-400 opacity-60'></div>
    </header>
  );
}
