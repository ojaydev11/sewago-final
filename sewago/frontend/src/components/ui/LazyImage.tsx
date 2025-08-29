'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

// Intersection Observer hook for lazy loading
function useIntersectionObserver(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible] as const;
}

// Shimmer placeholder component
function ImagePlaceholder({ width, height, className }: { 
  width?: number; 
  height?: number; 
  className?: string; 
}) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-white/10 via-white/20 to-white/10 ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || 'auto',
        aspectRatio: width && height ? width / height : undefined
      }}
      animate={{
        backgroundPosition: ['0%', '100%', '0%']
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  priority = false,
  quality = 75,
  sizes
}: LazyImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [containerRef, isVisible] = useIntersectionObserver();

  const shouldLoad = priority || isVisible;

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.05 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        {/* Show placeholder while loading */}
        {(!shouldLoad || (!imageLoaded && !imageError)) && (
          <motion.div
            key="placeholder"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0"
          >
            {placeholder ? (
              <Image
                src={placeholder}
                alt={`${alt} placeholder`}
                fill
                className="object-cover blur-sm"
                priority
              />
            ) : (
              <ImagePlaceholder 
                width={width} 
                height={height} 
                className="w-full h-full" 
              />
            )}
          </motion.div>
        )}

        {/* Show actual image when loaded */}
        {shouldLoad && !imageError && (
          <motion.div
            key="image"
            variants={imageVariants}
            initial="hidden"
            animate={imageLoaded ? "visible" : "hidden"}
            className="relative"
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className={className}
              quality={quality}
              sizes={sizes}
              priority={priority}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </motion.div>
        )}

        {/* Show error state */}
        {imageError && (
          <motion.div
            key="error"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-sm"
          >
            <div className="text-center text-white/60">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Image unavailable</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}