'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Base skeleton component with shimmer effect
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-white/10 via-white/20 to-white/10 bg-[length:400%_100%]",
        className
      )}
      animate={{
        backgroundPosition: ['0%', '100%', '0%']
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }}
      {...(Object.fromEntries(
        Object.entries(props).filter(([key]) => 
          !['onDrag', 'onDragStart', 'onDragEnd', 'onDragEnter', 'onDragLeave', 'onDragOver', 'onDrop'].includes(key)
        )
      ) as any)}
    />
  );
}

// Service card skeleton
function ServiceCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="space-y-4 glass-card p-8 rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Icon skeleton */}
      <div className="flex justify-center">
        <Skeleton className="w-20 h-20 rounded-2xl" />
      </div>
      
      {/* Title skeleton */}
      <Skeleton className="h-6 w-3/4 mx-auto rounded-lg" />
      
      {/* Description skeleton */}
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-2/3 mx-auto rounded-lg" />
    </motion.div>
  );
}

// Hero section skeleton
function HeroSkeleton() {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Main title skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-16 w-full max-w-2xl mx-auto rounded-xl" />
          <Skeleton className="h-12 w-3/4 mx-auto rounded-xl" />
        </div>
        
        {/* Subtitle skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-2/3 mx-auto rounded-lg" />
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
        </div>
        
        {/* Search bar skeleton */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Skeleton className="h-16 w-full max-w-2xl mx-auto rounded-2xl" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Services grid skeleton
function ServicesGridSkeleton() {
  return (
    <motion.section
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Section header skeleton */}
      <div className="text-center space-y-6 mb-16">
        <Skeleton className="h-12 w-80 mx-auto rounded-xl" />
        <Skeleton className="h-6 w-96 mx-auto rounded-lg" />
        <div className="flex justify-center">
          <Skeleton className="h-1 w-24 rounded-full" />
        </div>
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <ServiceCardSkeleton key={i} delay={i * 0.1} />
        ))}
      </div>
      
      {/* Bottom accent skeleton */}
      <motion.div
        className="text-center pt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-3">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="h-4 w-48 rounded-lg" />
          <Skeleton className="w-2 h-2 rounded-full" />
        </div>
      </motion.div>
    </motion.section>
  );
}

// Review card skeleton
function ReviewCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="glass-card p-6 rounded-2xl space-y-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32 rounded-lg" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-4 h-4 rounded" />
            ))}
          </div>
        </div>
      </div>
      
      {/* Review text */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-5/6 rounded-lg" />
        <Skeleton className="h-4 w-3/4 rounded-lg" />
      </div>
    </motion.div>
  );
}

// Reviews section skeleton
function ReviewsSkeleton() {
  return (
    <motion.section
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Section header skeleton */}
      <div className="text-center space-y-6 mb-16">
        <Skeleton className="h-12 w-72 mx-auto rounded-xl" />
        <Skeleton className="h-6 w-80 mx-auto rounded-lg" />
      </div>
      
      {/* Reviews grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ReviewCardSkeleton key={i} delay={i * 0.1} />
        ))}
      </div>
    </motion.section>
  );
}

// Export all skeleton components
export {
  Skeleton,
  ServiceCardSkeleton,
  HeroSkeleton,
  ServicesGridSkeleton,
  ReviewCardSkeleton,
  ReviewsSkeleton
};

// Main skeleton provider component
export default function EnhancedSkeleton({ 
  type, 
  count = 1,
  className = '' 
}: { 
  type: 'hero' | 'services-grid' | 'service-card' | 'reviews' | 'review-card';
  count?: number;
  className?: string;
}) {
  const skeletonMap = {
    'hero': HeroSkeleton,
    'services-grid': ServicesGridSkeleton,
    'service-card': ServiceCardSkeleton,
    'reviews': ReviewsSkeleton,
    'review-card': ReviewCardSkeleton,
  };

  const SkeletonComponent = skeletonMap[type];

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} delay={i * 0.1} />
      ))}
    </div>
  );
}