<<<<<<< HEAD
import { type ReactNode } from 'react'
=======
'use client';

import { type ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

interface ServiceCardProps {
  icon: React.ReactNode;
  label: string;
  gradientClass?: string;
}

<<<<<<< HEAD
export default function ServiceCard({ icon, label, gradientClass = 'from-blue-600 to-purple-600' }: ServiceCardProps) {
  return (
    <div className='group relative'>
      {/* Background glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
      
      {/* Main card container with glassmorphism */}
      <div className='relative glass-card p-8 text-center transition-all duration-500 hover:scale-105 hover:bg-white/15 group-hover:border-white/40'>
        {/* Icon container with gradient background */}
        <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${gradientClass} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <div className='text-white text-3xl'>
            {icon}
          </div>
        </div>
        
        {/* Label with enhanced typography */}
        <h3 className='text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors duration-300'>
          {label}
        </h3>
        
        {/* Subtle description */}
        <p className='text-white/70 text-sm font-medium'>
          Professional {label.toLowerCase()} services
        </p>
        
        {/* Hover indicator */}
        <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
          <div className='w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full'></div>
        </div>
        
        {/* Corner accent */}
        <div className='absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150'></div>
      </div>
    </div>
  );
}
=======
const cardVariants = {
  hover: {
    scale: 1.05,
    rotateY: 5,
    z: 50,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20
    }
  },
  tap: { scale: 0.95 }
};

const iconVariants = {
  hover: {
    scale: 1.1,
    rotate: [0, -5, 5, 0],
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 15
    }
  }
};

export default function ServiceCard({ icon, label, gradientClass = 'from-blue-600 to-purple-600' }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className='group relative'
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transformStyle: "preserve-3d",
        transformOrigin: "center center"
      }}
    >
      {/* Enhanced background glow effect */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} rounded-2xl blur-xl`}
        animate={{
          opacity: isHovered ? 0.5 : 0.2,
          scale: isHovered ? 1.1 : 1
        }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Enhanced main card container */}
      <motion.div
        className='relative glass-card p-8 text-center'
        animate={{
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
          borderColor: isHovered ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Enhanced icon container */}
        <motion.div
          className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${gradientClass} rounded-2xl mb-6`}
          variants={iconVariants}
          animate={{
            boxShadow: isHovered 
              ? '0 10px 30px rgba(59, 130, 246, 0.4)'
              : '0 4px 15px rgba(59, 130, 246, 0.2)'
          }}
        >
          <div className='text-white text-3xl'>
            {icon}
          </div>
        </motion.div>
        
        {/* Enhanced label with motion */}
        <motion.h3
          className='text-xl font-bold text-white mb-3'
          animate={{
            color: isHovered ? '#93C5FD' : '#FFFFFF'
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.h3>
        
        {/* Enhanced description */}
        <motion.p
          className='text-white/70 text-sm font-medium'
          animate={{
            opacity: isHovered ? 1 : 0.7
          }}
          transition={{ duration: 0.2 }}
        >
          Professional {label.toLowerCase()} services
        </motion.p>
        
        {/* Enhanced hover indicator */}
        <motion.div
          className='absolute bottom-4 left-1/2 transform -translate-x-1/2'
          initial={{ opacity: 0, width: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            width: isHovered ? '2rem' : 0
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className='h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full'></div>
        </motion.div>
        
        {/* Enhanced corner accent */}
        <motion.div
          className='absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full'
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1.5 : 0
          }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        />
      </motion.div>
    </motion.div>
  );
}
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
