'use client';

import ServiceHubIllustration from './ui/ServiceHubIllustration';
import { motion } from 'framer-motion';
import Lazy3D from './ui/Lazy3D';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Hero() {
  return (
    <section className='relative min-h-screen bg-gradient-hero overflow-hidden'>
      {/* Enhanced floating background with 3D elements */}
      <div className='absolute inset-0'>
        {/* 3D Particle Field Background */}
        <Lazy3D 
          component="particles" 
          className="absolute inset-0 opacity-40"
          showWireframe={false}
          fallback={
            // Fallback animated elements for devices without 3D support
            <>
              <motion.div
                className='absolute top-20 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl'
                variants={floatingVariants}
                animate="animate"
              />
              <motion.div
                className='absolute top-40 right-20 w-24 h-24 bg-white/20 rounded-full blur-2xl'
                variants={floatingVariants}
                animate="animate"
                style={{ animationDelay: '1s' }}
              />
              <motion.div
                className='absolute bottom-40 left-1/4 w-16 h-16 bg-white/30 rounded-full blur-xl'
                variants={floatingVariants}
                animate="animate"
                style={{ animationDelay: '2s' }}
              />
            </>
          }
        />
        
        {/* Additional ambient elements */}
        <motion.div
          className='absolute top-1/2 right-1/3 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl'
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32'>
        <motion.div
          className='grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]'
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left content with enhanced typography and spacing */}
          <motion.div className='text-center lg:text-left space-y-8' variants={itemVariants}>
            <motion.div className='space-y-4' variants={itemVariants}>
              <motion.h1
                className='clamp(2.5rem, 5vw + 1rem, 4.5rem) font-black text-white leading-tight'
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Reliable Services
              </motion.h1>
              <motion.p
                className='text-2xl sm:text-3xl text-white/90 font-light leading-relaxed'
                variants={itemVariants}
              >
                For Every Home in Nepal
              </motion.p>
            </motion.div>
            
            {/* Modern subtitle with enhanced animations */}
            <motion.div className='space-y-3' variants={itemVariants}>
              <motion.p
                className='text-lg text-white/80 font-medium'
                variants={itemVariants}
              >
                Connect with verified local service providers
              </motion.p>
              <motion.div
                className='flex items-center justify-center lg:justify-start gap-2'
                variants={itemVariants}
              >
                <motion.div
                  className='w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full'
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className='text-sm text-blue-200 font-mono'>Quality Guaranteed</span>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Right illustration with enhanced styling and animations */}
          <motion.div className='hidden lg:block relative' variants={itemVariants}>
            <motion.div
              className='relative'
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ServiceHubIllustration />
              {/* Enhanced overlay elements with better animations */}
              <motion.div
                className='absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full'
                animate={{
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    '0 0 0 rgba(59, 130, 246, 0.5)',
                    '0 0 20px rgba(59, 130, 246, 0.8)',
                    '0 0 0 rgba(59, 130, 246, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className='absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full'
                animate={{
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    '0 0 0 rgba(168, 85, 247, 0.5)',
                    '0 0 15px rgba(168, 85, 247, 0.8)',
                    '0 0 0 rgba(168, 85, 247, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Enhanced bottom accent line */}
      <motion.div
        className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400'
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
      />
    </section>
  );
}
