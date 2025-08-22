'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

// Performance metrics collection hook
function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Web Vitals measurement
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'first-input':
            setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({ 
                ...prev, 
                cls: (prev.cls || 0) + (entry as any).value 
              }));
            }
            break;
        }
      }
    });

    // Observe Web Vitals
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

    // Navigation Timing API for additional metrics
    if (typeof window !== 'undefined' && window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const navigationStart = timing.navigationStart;
      
      // Calculate metrics
      const fcp = window.performance.getEntriesByType('paint')
        .find(entry => entry.name === 'first-contentful-paint')?.startTime;
      
      const ttfb = timing.responseStart - navigationStart;

      setMetrics(prev => ({
        ...prev,
        fcp: fcp || undefined,
        ttfb: ttfb || undefined
      }));
    }

    // Set loading to false after initial metrics collection
    setTimeout(() => setIsLoading(false), 2000);

    return () => observer.disconnect();
  }, []);

  return { metrics, isLoading };
}

// Performance status indicator
function PerformanceIndicator({ 
  label, 
  value, 
  threshold, 
  unit = 'ms' 
}: { 
  label: string; 
  value?: number; 
  threshold: { good: number; fair: number }; 
  unit?: string;
}) {
  if (value === undefined) return null;

  const getStatus = () => {
    if (value <= threshold.good) return 'good';
    if (value <= threshold.fair) return 'fair';
    return 'poor';
  };

  const status = getStatus();
  const colors = {
    good: 'from-green-400 to-emerald-400',
    fair: 'from-yellow-400 to-orange-400',
    poor: 'from-red-400 to-pink-400'
  };

  return (
    <motion.div
      className="flex items-center justify-between p-3 glass-card rounded-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-sm">
        <div className="text-white/80 font-medium">{label}</div>
        <div className="text-white text-lg font-bold">
          {value.toFixed(unit === 'ms' ? 0 : 3)}{unit}
        </div>
      </div>
      <motion.div
        className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[status]}`}
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
    </motion.div>
  );
}

// Main performance monitor component
export default function PerformanceMonitor({ 
  showOnProduction = false,
  className = '' 
}: { 
  showOnProduction?: boolean;
  className?: string;
}) {
  const { metrics, isLoading } = usePerformanceMetrics();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development or if explicitly enabled for production
  const shouldShow = process.env.NODE_ENV === 'development' || showOnProduction;

  useEffect(() => {
    // Show after a delay to avoid interfering with initial page load
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldShow || !isVisible) return null;

  const thresholds = {
    lcp: { good: 2500, fair: 4000 }, // Largest Contentful Paint
    fid: { good: 100, fair: 300 }, // First Input Delay
    cls: { good: 0.1, fair: 0.25 }, // Cumulative Layout Shift
    fcp: { good: 1800, fair: 3000 }, // First Contentful Paint
    ttfb: { good: 800, fair: 1800 } // Time to First Byte
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed bottom-4 right-4 z-50 w-80 ${className}`}
        initial={{ opacity: 0, x: 100, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.8 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
      >
        {/* Header */}
        <motion.div
          className="glass-card rounded-t-xl p-4 border-b border-white/10"
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <motion.div
                className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
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
              Performance
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/60 hover:text-white transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Metrics */}
        <div className="glass-card rounded-b-xl p-4 space-y-3">
          {isLoading ? (
            <motion.div
              className="flex items-center justify-center py-8"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-6 h-6 border-2 border-white/20 border-t-blue-400 rounded-full" />
            </motion.div>
          ) : (
            <>
              <PerformanceIndicator
                label="Largest Contentful Paint"
                value={metrics.lcp}
                threshold={thresholds.lcp}
              />
              <PerformanceIndicator
                label="First Input Delay"
                value={metrics.fid}
                threshold={thresholds.fid}
              />
              <PerformanceIndicator
                label="Cumulative Layout Shift"
                value={metrics.cls}
                threshold={thresholds.cls}
                unit=""
              />
              <PerformanceIndicator
                label="First Contentful Paint"
                value={metrics.fcp}
                threshold={thresholds.fcp}
              />
              <PerformanceIndicator
                label="Time to First Byte"
                value={metrics.ttfb}
                threshold={thresholds.ttfb}
              />
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}