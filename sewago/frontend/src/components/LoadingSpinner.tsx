import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "white";
  className?: string;
  text?: string;
  showText?: boolean;
}

export default function LoadingSpinner({
  size = "default",
  variant = "default",
  className,
  text = "Loading...",
  showText = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const variantClasses = {
    default: "text-gray-600",
    primary: "text-primary",
    secondary: "text-gray-500",
    white: "text-white",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2
        className={cn(
          "animate-spin",
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {showText && (
        <p className={cn("mt-2 text-sm", variantClasses[variant])}>
          {text}
        </p>
      )}
    </div>
  );
}

// Inline loading spinner for buttons and small elements
export function InlineSpinner({ 
  size = "sm", 
  className 
}: { 
  size?: "sm" | "default"; 
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin inline",
        sizeClasses[size],
        className
      )}
    />
  );
}

// Page loading spinner for full-page loading states
export function PageSpinner({ 
  text = "Loading page...",
  className 
}: { 
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center", className)}>
      <LoadingSpinner size="xl" text={text} showText />
    </div>
  );
}

// Content loading spinner for section loading states
export function ContentSpinner({ 
  text = "Loading content...",
  className 
}: { 
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("py-12 flex items-center justify-center", className)}>
      <LoadingSpinner size="lg" text={text} showText />
    </div>
  );
}

// Button loading spinner for form submissions
export function ButtonSpinner({ 
  size = "sm", 
  className 
}: { 
  size?: "sm" | "default"; 
  className?: string;
}) {
  return (
    <InlineSpinner 
      size={size} 
      className={cn("mr-2", className)} 
    />
  );
}
