'use client';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const r = useRouter();
  
  return (
    <form 
      role='search' 
      className='mx-auto w-full max-w-4xl -mt-20 relative z-20 animate-fade-in' 
      style={{animationDelay: '0.8s'}}
      onSubmit={(e) => {
        e.preventDefault(); 
        const q = new FormData(e.currentTarget).get('q') || ''; 
        r.push(`/services?query=${encodeURIComponent(String(q))}`);
      }}
    >
      <label className='sr-only' htmlFor='q'>Search for services</label>
      
      {/* Enhanced search container with futuristic styling */}
      <div className='relative group'>
        <div className='absolute inset-0 bg-gradient-accent rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300'></div>
        
        <div className='relative flex items-center gap-4 bg-sg-primary/95 backdrop-blur-xl border border-sg-accent1/20 rounded-3xl px-6 py-5 shadow-futuristic hover:shadow-glow transition-all duration-300 group-hover:scale-[1.02]'>
          {/* Search icon with glow effect */}
          <div className='relative'>
            <Search className='text-sg-accent1 w-6 h-6' />
            <div className='absolute inset-0 w-6 h-6 bg-sg-accent1/20 rounded-full blur-md'></div>
          </div>
          
          {/* Enhanced input field */}
          <input 
            id='q' 
            name='q' 
            placeholder='Search for services...' 
            className='w-full bg-transparent outline-none text-lg text-sg-secondary placeholder:text-sg-secondary/50 font-medium'
            autoComplete='off'
          />
          
          {/* Futuristic accent elements */}
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-sg-accent2 rounded-full animate-pulse'></div>
            <div className='w-2 h-2 bg-sg-accent1 rounded-full animate-pulse' style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
        
        {/* Bottom glow line */}
        <div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-accent rounded-full opacity-60 blur-sm'></div>
      </div>
    </form>
  );
}
