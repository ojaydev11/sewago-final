<<<<<<< HEAD
import Link from 'next/link';
import ServiceCard from './ServiceCard';
import { Wrench, ShowerHead, Sparkles, GraduationCap } from 'lucide-react';
=======
'use client';

import Link from 'next/link';
import ServiceCard from './ServiceCard';
import { Wrench, ShowerHead, Sparkles, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

const items = [
  { label: 'Electrician', slug: 'electrician', icon: <Wrench/>, color: 'from-blue-600 to-purple-600' },
  { label: 'Plumber', slug: 'plumber', icon: <ShowerHead/>, color: 'from-green-600 to-blue-600' },
  { label: 'Cleaner', slug: 'cleaner', icon: <Sparkles/>, color: 'from-purple-600 to-pink-600' },
  { label: 'Tutor', slug: 'tutor', icon: <GraduationCap/>, color: 'from-orange-600 to-red-600' }
];

<<<<<<< HEAD
export default function ServicesGrid() {
  return (
    <section className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 space-y-16'>
      {/* Enhanced section header */}
      <div className='text-center space-y-6 animate-fade-up'>
        <h2 className='text-4xl sm:text-5xl font-black text-white leading-tight'>
          Browse Services
        </h2>
        <p className='text-xl text-white/80 font-light max-w-2xl mx-auto leading-relaxed'>
          Discover our comprehensive range of professional services designed for the modern world
        </p>
        
        {/* Futuristic accent line */}
        <div className='flex justify-center'>
          <div className='w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full'></div>
        </div>
      </div>
      
      {/* Enhanced grid layout with improved spacing */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12'>
        {items.map((item, index) => (
          <Link 
            key={item.slug} 
            href={`/services/${item.slug}/book`} 
            className='block group animate-slide-up'
            style={{animationDelay: `${0.2 * index}s`}}
          >
            <ServiceCard 
              icon={item.icon} 
              label={item.label}
              gradientClass={item.color}
            />
          </Link>
        ))}
      </div>
      
      {/* Bottom accent section */}
      <div className='text-center pt-8'>
        <div className='inline-flex items-center gap-3 text-white/60 text-sm font-mono'>
          <div className='w-2 h-2 bg-blue-400 rounded-full animate-pulse'></div>
          <span>More services coming soon</span>
          <div className='w-2 h-2 bg-purple-400 rounded-full animate-pulse' style={{animationDelay: '0.5s'}}></div>
        </div>
      </div>
    </section>
=======
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8
    }
  }
};

export default function ServicesGrid() {
  return (
    <motion.section
      className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 space-y-16'
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Enhanced section header with motion */}
      <motion.div className='text-center space-y-6' variants={headerVariants}>
        <motion.h2
          className='text-4xl sm:text-5xl font-black text-white leading-tight'
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Browse Services
        </motion.h2>
        <motion.p
          className='text-xl text-white/80 font-light max-w-2xl mx-auto leading-relaxed'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Discover our comprehensive range of professional services designed for the modern world
        </motion.p>
        
        {/* Enhanced futuristic accent line */}
        <div className='flex justify-center'>
          <motion.div
            className='h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full'
            initial={{ width: 0 }}
            animate={{ width: '6rem' }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </motion.div>
      
      {/* Enhanced grid layout with motion */}
      <motion.div
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12'
        variants={containerVariants}
      >
        {items.map((item, index) => (
          <motion.div key={item.slug} variants={itemVariants}>
            <Link
              href={`/services/${item.slug}/book`}
              className='block group'
            >
              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  z: 50
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "center center"
                }}
              >
                <ServiceCard
                  icon={item.icon}
                  label={item.label}
                  gradientClass={item.color}
                />
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Enhanced bottom accent section */}
      <motion.div
        className='text-center pt-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <div className='inline-flex items-center gap-3 text-white/60 text-sm font-mono'>
          <motion.div
            className='w-2 h-2 bg-blue-400 rounded-full'
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            More services coming soon
          </motion.span>
          <motion.div
            className='w-2 h-2 bg-purple-400 rounded-full'
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6]
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
    </motion.section>
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
  );
}
