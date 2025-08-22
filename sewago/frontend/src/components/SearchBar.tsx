'use client';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const searchVariants = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      delay: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const searchHover = {
  scale: 1.02,
  boxShadow: "0 25px 50px rgba(59, 130, 246, 0.3)",
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 20
  }
};

export default function SearchBar() {
  const r = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <motion.form
      role='search'
      className='mx-auto w-full max-w-4xl -mt-20 relative z-20'
      variants={searchVariants}
      initial="initial"
      animate="animate"
      whileHover={searchHover}
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get('q') || '';
        r.push(`/services?query=${encodeURIComponent(String(q))}`);
      }}
    >
      <label className='sr-only' htmlFor='q'>Search for services</label>
      
      {/* Enhanced search container with modern styling */}
      <motion.div
        className='relative group'
        animate={{
          boxShadow: isFocused
            ? '0 0 40px rgba(59, 130, 246, 0.4)'
            : '0 0 20px rgba(59, 130, 246, 0.2)'
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className='absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl'
          animate={{
            opacity: isFocused ? 0.6 : 0.3,
            scale: isFocused ? 1.05 : 1
          }}
          transition={{ duration: 0.3 }}
        />
        
        <motion.div
          className='relative flex items-center gap-4 glass-card px-6 py-5 shadow-xl'
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {/* Search icon with enhanced glow effect */}
          <motion.div
            className='relative'
            animate={{
              rotate: isFocused ? 360 : 0
            }}
            transition={{ duration: 0.5 }}
          >
            <Search className='text-white w-6 h-6 relative z-10' />
            <motion.div
              className='absolute inset-0 w-6 h-6 bg-white/20 rounded-full blur-md'
              animate={{
                scale: isFocused ? 1.3 : 1,
                opacity: isFocused ? 0.8 : 0.4
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          
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
          
          {/* Enhanced accent elements with motion */}
          <div className='flex items-center gap-2'>
            <motion.div
              className='w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full'
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className='w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full'
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </div>
        </motion.div>
        
        {/* Enhanced bottom glow line */}
        <motion.div
          className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm'
          animate={{
            width: isFocused ? '90%' : '75%',
            opacity: isFocused ? 0.9 : 0.6
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.form>
  );
}
