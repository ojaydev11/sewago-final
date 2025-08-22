'use client';

import { Suspense, lazy, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Lazy load 3D components
const FloatingGeometry = lazy(() => import('./FloatingGeometry'));
const ParticleField = lazy(() => import('./ParticleField'));

// Loading fallback component
function ThreeDLoader() {
  return (
    <motion.div
      className="flex items-center justify-center h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative">
        {/* Animated loading placeholder */}
        <motion.div
          className="w-16 h-16 rounded-full border-2 border-white/20 border-t-blue-400"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-b-purple-400"
          animate={{ rotate: -360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </motion.div>
  );
}

// Error boundary component
function ThreeDErrorFallback() {
  return (
    <motion.div
      className="flex items-center justify-center h-full w-full opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
    >
      <div className="text-center text-white/60">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm">3D content unavailable</p>
      </div>
    </motion.div>
  );
}

// Hook to detect if 3D should be enabled
function useSupports3D() {
  const [supports3D, setSupports3D] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check for mobile device (basic detection)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Enable 3D if WebGL is supported, not on mobile, and user doesn't prefer reduced motion
    const shouldEnable3D = !!gl && !isMobile && !prefersReducedMotion;
    
    setSupports3D(shouldEnable3D);
    setIsLoading(false);
  }, []);

  return { supports3D, isLoading };
}

// Lazy 3D component wrapper
interface Lazy3DProps {
  component: '3d-geometry' | 'particles';
  className?: string;
  fallback?: React.ReactNode;
  showWireframe?: boolean;
}

export default function Lazy3D({ 
  component, 
  className = '', 
  fallback = null,
  showWireframe = true 
}: Lazy3DProps) {
  const { supports3D, isLoading } = useSupports3D();

  // Show loading state
  if (isLoading) {
    return (
      <div className={`${className}`}>
        <ThreeDLoader />
      </div>
    );
  }

  // Show fallback if 3D is not supported
  if (!supports3D) {
    return (
      <div className={`${className}`}>
        {fallback || <ThreeDErrorFallback />}
      </div>
    );
  }

  // Render appropriate 3D component
  const Component3D = component === '3d-geometry' ? FloatingGeometry : ParticleField;

  return (
    <div className={className}>
      <Suspense fallback={<ThreeDLoader />}>
        <Component3D 
          className="w-full h-full" 
          showWireframe={showWireframe}
        />
      </Suspense>
    </div>
  );
}