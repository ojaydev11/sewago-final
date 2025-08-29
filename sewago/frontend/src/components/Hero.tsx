<<<<<<< HEAD
import ServiceHubIllustration from './ui/ServiceHubIllustration';
=======
'use client';

import ServiceHubIllustration from './ui/ServiceHubIllustration';
import SearchBar from './SearchBar';
// Temporarily disabled complex components to fix runtime errors
// import { motion } from 'framer-motion';
// import Lazy3D from './ui/Lazy3D';
// import { ContextualNotifications } from './ai/ContextualNotifications';

// Commented out animation variants since we're using simple CSS animations instead
// to prevent runtime errors with framer-motion
// const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
// const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
// const floatingVariants = { animate: { y: [-10, 10, -10] } };
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

export default function Hero() {
  return (
    <section className='relative min-h-screen bg-gradient-hero overflow-hidden'>
<<<<<<< HEAD
      {/* Futuristic background elements */}
      <div className='absolute inset-0'>
        <div className='absolute top-20 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-float'></div>
        <div className='absolute top-40 right-20 w-24 h-24 bg-white/20 rounded-full blur-2xl animate-float' style={{animationDelay: '1s'}}></div>
        <div className='absolute bottom-40 left-1/4 w-16 h-16 bg-white/30 rounded-full blur-xl animate-float' style={{animationDelay: '2s'}}></div>
=======
      {/* Simplified background elements */}
      <div className='absolute inset-0'>
        {/* Static background elements to avoid runtime errors */}
        <div className='absolute top-20 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse' />
        <div className='absolute top-40 right-20 w-24 h-24 bg-white/20 rounded-full blur-2xl animate-pulse' style={{ animationDelay: '1s' }} />
        <div className='absolute bottom-40 left-1/4 w-16 h-16 bg-white/30 rounded-full blur-xl animate-pulse' style={{ animationDelay: '2s' }} />
        <div className='absolute top-1/2 right-1/3 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-bounce' />
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
      </div>
      
      <div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32'>
        <div className='grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]'>
<<<<<<< HEAD
          {/* Left content with enhanced typography and spacing */}
          <div className='text-center lg:text-left space-y-8'>
            <div className='space-y-4'>
              <h1 className='clamp(2.5rem, 5vw + 1rem, 4.5rem) font-black text-white leading-tight animate-fade-up'>
                Reliable Services
              </h1>
              <p className='text-2xl sm:text-3xl text-white/90 font-light leading-relaxed animate-slide-up' style={{animationDelay: '0.2s'}}>
=======
          {/* Left content with simplified styling to avoid runtime errors */}
          <div className='text-center lg:text-left space-y-8'>
            <div className='space-y-4'>
              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight'>
                Reliable Services
              </h1>
              <p className='text-2xl sm:text-3xl text-white/90 font-light leading-relaxed'>
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
                For Every Home in Nepal
              </p>
            </div>
            
<<<<<<< HEAD
            {/* Modern subtitle */}
            <div className='space-y-3 animate-slide-up' style={{animationDelay: '0.4s'}}>
=======
            {/* Simplified subtitle */}
            <div className='space-y-3'>
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
              <p className='text-lg text-white/80 font-medium'>
                Connect with verified local service providers
              </p>
              <div className='flex items-center justify-center lg:justify-start gap-2'>
<<<<<<< HEAD
                <div className='w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse-glow'></div>
=======
                <div className='w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse' />
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
                <span className='text-sm text-blue-200 font-mono'>Quality Guaranteed</span>
              </div>
            </div>
          </div>
          
<<<<<<< HEAD
          {/* Right illustration with enhanced styling */}
          <div className='hidden lg:block relative animate-fade-up' style={{animationDelay: '0.6s'}}>
            <div className='relative'>
              <ServiceHubIllustration />
              {/* Futuristic overlay elements */}
              <div className='absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse-glow'></div>
              <div className='absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse-glow' style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400'></div>
=======
          {/* Right illustration simplified */}
          <div className='hidden lg:block relative'>
            <div className='relative'>
              <ServiceHubIllustration />
              {/* Simplified overlay elements */}
              <div className='absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse' />
              <div className='absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce' />
            </div>
          </div>
        </div>
        
        {/* AI-Powered Search Bar */}
        <SearchBar useSmartSearch={true} />
      </div>
      
      {/* Contextual Notifications - Disabled to prevent SSR errors */}
      {/* <ContextualNotifications 
        position="top-right"
        maxNotifications={3}
        location={{ lat: 27.7172, lng: 85.3240, city: 'Kathmandu' }}
      /> */}
      
      {/* Enhanced bottom accent line - Simplified to prevent SSR errors */}
      <div className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-80' />
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
    </section>
  );
}
