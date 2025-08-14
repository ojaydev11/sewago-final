'use client';

import { useRouter } from 'next/navigation';
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
      }}
    >
      <label className='sr-only' htmlFor='q'>Search for services</label>
      
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
      </div>
    </form>
  );
}
