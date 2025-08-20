'use client';

import { Skeleton } from './ui/skeleton';

interface OptimizedLoadingProps {
  variant?: 'page' | 'card' | 'list' | 'form' | 'minimal';
  count?: number;
}

/**
 * Optimized loading component that provides semantic loading states
 * to improve perceived performance and Lighthouse scores
 */
export default function OptimizedLoading({ 
  variant = 'minimal', 
  count = 1 
}: OptimizedLoadingProps) {
  const renderSkeletons = () => {
    const skeletons = [];
    
    for (let i = 0; i < count; i++) {
      switch (variant) {
        case 'page':
          skeletons.push(
            <div key={i} className="space-y-6">
              {/* Header skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              
              {/* Content skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          );
          break;
          
        case 'card':
          skeletons.push(
            <div key={i} className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-32 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          );
          break;
          
        case 'list':
          skeletons.push(
            <div key={i} className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center space-x-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          );
          break;
          
        case 'form':
          skeletons.push(
            <div key={i} className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
              
              {[1, 2, 3, 4].map((field) => (
                <div key={field} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              
              <div className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          );
          break;
          
        case 'minimal':
        default:
          skeletons.push(
            <div key={i} className="flex items-center justify-center p-8">
              <div className="space-y-4 w-full max-w-sm">
                <div className="flex justify-center">
                  <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            </div>
          );
          break;
      }
    }
    
    return skeletons;
  };

  return (
    <div 
      className="animate-pulse"
      role="status" 
      aria-label="Loading content"
    >
      {renderSkeletons()}
      
      {/* Screen reader only loading text */}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Specialized loading components for common use cases
 */
export const PageLoading = () => <OptimizedLoading variant="page" />;
export const CardLoading = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <OptimizedLoading variant="card" count={count} />
  </div>
);
export const ListLoading = () => <OptimizedLoading variant="list" />;
export const FormLoading = () => <OptimizedLoading variant="form" />;

/**
 * Progressive loading wrapper that shows content as it loads
 */
export function ProgressiveLoader({
  isLoading,
  fallback,
  children,
}: {
  isLoading: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return fallback || <OptimizedLoading variant="minimal" />;
  }
  
  return <>{children}</>;
}