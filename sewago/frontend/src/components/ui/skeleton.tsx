import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Additional skeleton variants for common UI patterns
function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/5" />
        <SkeletonText lines={2} />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  )
}

function SkeletonTable({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className={cn(
                "h-4 flex-1",
                colIndex === 0 ? "w-3/4" : "w-full"
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function SkeletonAvatar({ size = "default", className }: { size?: "sm" | "default" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12"
  }
  
  return (
    <Skeleton 
      className={cn(
        "rounded-full",
        sizeClasses[size],
        className
      )} 
    />
  )
}

function SkeletonButton({ size = "default", className }: { size?: "sm" | "default" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-8 px-3",
    default: "h-10 px-4",
    lg: "h-12 px-6"
  }
  
  return (
    <Skeleton 
      className={cn(
        "rounded-md",
        sizeClasses[size],
        className
      )} 
    />
  )
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonAvatar, SkeletonButton }
