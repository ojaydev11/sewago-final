
'use client';

import Link from 'next/link';
import { Menu, Crown } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { TierBadge } from './subscriptions/TierBadge';

const navVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const logoVariants = {
  hover: {
    scale: 1.05,
    rotate: [0, -2, 2, 0],
    transition: {
      duration: 0.4,
      type: "spring",
      stiffness: 300
    }
  },
  tap: { scale: 0.95 }
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: { scale: 0.95 }
};

export default function Navbar() {
  const [isMenuHover, setIsMenuHover] = useState(false);
  
  // Mock user subscription data - in real app, this would come from auth context
  const userTier = 'PLUS'; // This would be fetched from user's subscription
  const isAuthenticated = true; // This would come from auth context
  
  return (
    <motion.header
      className='w-full relative z-50'
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced background with glassmorphism */}
      <motion.div
        className='absolute inset-0 glass-card border-b border-white/20'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      />
      
      <nav className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between'>
        {/* Enhanced logo with Framer Motion */}
        <Link href='/' className='flex items-center gap-4 group'>
          <motion.div
            className='relative'
            variants={logoVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Image
              src="/branding/sewago-logo.svg"
              alt="sewaGo"
              width={120}
              height={36}
              className='relative z-10'
            />
            {/* Enhanced glow effect */}
            <motion.div
              className='absolute inset-0 h-12 w-12 rounded-2xl bg-gradient-to-r from-orange-400 to-orange-600 blur-md'
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{
                opacity: 0.4,
                scale: 1.2,
                transition: { duration: 0.3 }
              }}
            />
          </motion.div>
        </Link>
        
        {/* Enhanced navigation items */}
        <motion.div
          className='flex items-center gap-8'
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Subscription Tier Badge for authenticated users */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Link href='/dashboard/subscription' className='block'>
                <TierBadge tier={userTier as any} animated />
              </Link>
            </motion.div>
          )}
          
          {/* Subscription upgrade link for FREE users */}
          {isAuthenticated && userTier === 'FREE' && (
            <Link href='/dashboard/subscription' className='relative group'>
              <motion.div
                className='px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full min-h-[44px] min-w-[44px] flex items-center gap-2'
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Crown className="h-4 w-4" />
                <span className='text-sm'>Upgrade</span>
              </motion.div>
            </Link>
          )}
          
          {/* Enhanced sign in link with motion */}
          {!isAuthenticated && (
            <Link href='/auth/login' className='relative group'>
              <motion.div
                className='px-6 py-3 text-white font-medium min-h-[44px] min-w-[44px] flex items-center'
                whileHover={{
                  color: "#93C5FD",
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className='relative z-10'>Sign in</span>
                {/* Enhanced hover underline effect */}
                <motion.div
                  className='absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400'
                  initial={{ width: 0 }}
                  whileHover={{
                    width: "100%",
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                />
              </motion.div>
            </Link>
          )}
          
          {/* Enhanced menu button with motion */}
          <motion.button
            aria-label='Menu'
            className='relative p-3 rounded-2xl glass-card min-h-[44px] min-w-[44px] flex items-center justify-center'
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onMouseEnter={() => setIsMenuHover(true)}
            onMouseLeave={() => setIsMenuHover(false)}
          >
            <motion.div
              animate={{
                rotate: isMenuHover ? 180 : 0
              }}
              transition={{ duration: 0.3 }}
            >
              <Menu
                size={24}
                className='text-white relative z-10'
              />
            </motion.div>
            
            {/* Enhanced hover glow effect */}
            <motion.div
              className='absolute inset-0 rounded-2xl bg-white/20 blur-md'
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isMenuHover ? 1 : 0,
                scale: isMenuHover ? 1.1 : 0.8
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </motion.div>
      </nav>
      
      {/* Enhanced bottom accent line */}
      <motion.div
        className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-blue-400 to-purple-400'
        initial={{ scaleX: 0, opacity: 0.6 }}
        animate={{ scaleX: 1, opacity: 0.6 }}
        transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
        style={{ transformOrigin: "left" }}
      />
    </motion.header>
  );
}
