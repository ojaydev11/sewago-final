import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ServiceGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          {/* Image Skeleton */}
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <Skeleton className="w-full h-full" />
          </div>

          <CardHeader className="pb-4">
            {/* Badge and Price Skeleton */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
            
            {/* Title Skeleton */}
            <Skeleton className="h-6 w-3/4 mb-2" />
            
            {/* Description Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardHeader>

          <CardContent>
            {/* Stats Skeleton */}
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>

            {/* Button Skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
