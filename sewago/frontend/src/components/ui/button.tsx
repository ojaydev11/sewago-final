"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] min-w-[44px] relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-accent text-white hover:from-primary-light hover:to-accent-light shadow-lg hover:shadow-xl hover:shadow-primary/25",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-md hover:shadow-lg",
        secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md hover:shadow-lg",
        ghost: "hover:bg-white/10 hover:text-white text-white/80 hover:shadow-sm",
        link: "text-white underline-offset-4 hover:underline",
        nepali: "bg-gradient-to-r from-primary to-accent text-white hover:from-primary-light hover:to-accent-light border-2 border-accent/30 hover:shadow-xl",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        xl: "h-16 px-10 py-5 text-xl",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Motion variants for enhanced animations
const motionVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 17
    }
  },
  tap: { 
    scale: 0.95,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 17
    }
  }
};

// Ripple effect component
function RippleEffect({ color = "rgba(255, 255, 255, 0.6)" }: { color?: string }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-xl"
      initial={{ scale: 0, opacity: 0.5 }}
      whileHover={{
        scale: 1,
        opacity: 0.1,
        transition: { duration: 0.3 }
      }}
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`
      }}
    />
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  withRipple?: boolean
  rippleColor?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    withRipple = true, 
    rippleColor,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : motion.button;
    const MotionComp = asChild ? Comp : motion.button;
    
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }
    
    return (
      <MotionComp
        className={cn(buttonVariants({ variant, size, className }))}
        variants={motionVariants}
        initial="rest"
        whileHover={disabled ? "rest" : "hover"}
        whileTap={disabled ? "rest" : "tap"}
        ref={ref}
        disabled={disabled}
        {...(Object.fromEntries(
          Object.entries(props).filter(([key]) => 
            !['onDrag', 'onDragStart', 'onDragEnd', 'onDragEnter', 'onDragLeave', 'onDragOver', 'onDrop'].includes(key)
          )
        ) as any)}
      >
        {/* Ripple effect */}
        {withRipple && !disabled && (
          <RippleEffect color={rippleColor} />
        )}
        
        {/* Content */}
        <span className="relative z-10">
          {children}
        </span>
        
        {/* Focus ring enhancement */}
        <motion.div
          className="absolute inset-0 rounded-xl ring-2 ring-primary/50 ring-offset-2 ring-offset-transparent opacity-0"
          whileFocus={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      </MotionComp>
    );
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
