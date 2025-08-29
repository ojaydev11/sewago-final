'use client';

import { useRouter } from 'next/navigation';
<<<<<<< HEAD
import { Search } from 'lucide-react';

export default function SearchBar() {
  const r = useRouter();
  
  return (
    <form 
      role='search' 
      className='mx-auto w-full max-w-4xl -mt-20 relative z-20 animate-fade-up' 
      style={{animationDelay: '0.8s'}}
      onSubmit={(e) => {
        e.preventDefault(); 
        const q = new FormData(e.currentTarget).get('q') || ''; 
        r.push(`/services?query=${encodeURIComponent(String(q))}`);
=======
import { Search, Mic } from 'lucide-react';
import { useState } from 'react';
// Temporarily disabled complex components to fix SSR issues
// import { motion } from 'framer-motion';
// import { PredictiveSearchEngine } from '@/components/ai/PredictiveSearchEngine';

// Simplified animations using CSS classes instead of framer-motion
// const searchVariants = { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 } };
// const searchHover = { scale: 1.02 };

interface SearchBarProps {
  useSmartSearch?: boolean;
  userId?: string;
}

export default function SearchBar({ useSmartSearch = true, userId }: SearchBarProps) {
  const r = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSearchPerformed = (query: string) => {
    r.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // Simplified version without complex animations to prevent SSR errors
  return (
    <form
      role='search'
      className='mx-auto w-full max-w-4xl -mt-20 relative z-20'
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get('q') || '';
        handleSearchPerformed(String(q));
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
      }}
    >
      <label className='sr-only' htmlFor='q'>Search for services</label>
      
<<<<<<< HEAD
      {/* Enhanced search container with modern styling */}
      <div className='relative group'>
        <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300'></div>
        
        <div className='relative flex items-center gap-4 glass-card px-6 py-5 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]'>
          {/* Search icon with glow effect */}
          <div className='relative'>
            <Search className='text-white w-6 h-6' />
            <div className='absolute inset-0 w-6 h-6 bg-white/20 rounded-full blur-md'></div>
          </div>
          
          {/* Enhanced input field */}
          <input 
            id='q' 
            name='q' 
            placeholder='Search for services...' 
            className='w-full bg-transparent outline-none text-lg text-white placeholder:text-white/50 font-medium min-h-[44px]'
            autoComplete='off'
          />
          
          {/* Modern accent elements */}
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse'></div>
            <div className='w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse' style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
        
        {/* Bottom glow line */}
        <div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 blur-sm'></div>
=======
      {/* Simplified search container */}
      <div className='relative group'>
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl transition-opacity duration-300 ${
          isFocused ? 'opacity-60' : 'opacity-30'
        }`} />
        
        <div className='relative flex items-center gap-4 glass-card px-6 py-5 shadow-xl hover:scale-105 transition-transform duration-200'>
          {/* Search icon with simplified styling */}
          <div className='relative'>
            <Search className='text-white w-6 h-6 relative z-10' />
            <div className={`absolute inset-0 w-6 h-6 bg-white/20 rounded-full blur-md transition-all duration-300 ${
              isFocused ? 'scale-125 opacity-80' : 'scale-100 opacity-40'
            }`} />
          </div>
          
          {/* Enhanced input field with focus animations */}
          <input
            id='q'
            name='q'
            placeholder='Search for services...'
            className='w-full bg-transparent outline-none text-lg text-white placeholder:text-white/50 font-medium min-h-[44px]'
            autoComplete='off'
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          
          {/* Simplified accent elements */}
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse' />
            <div className='w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse' style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
        
        {/* Simplified bottom glow line */}
        <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm transition-all duration-300 ${
          isFocused ? 'w-[90%] opacity-90' : 'w-[75%] opacity-60'
        }`} />
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
      </div>
    </form>
  );
}
