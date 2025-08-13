import React from 'react'
import { cn } from '../../lib/utils'

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  children, 
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  
  const variants = {
    default: "bg-[#0F62FE] text-white hover:bg-[#0052CC] focus:ring-[#0F62FE] shadow-lg hover:shadow-xl",
    secondary: "bg-[#F4AF1B] text-[#0B1220] hover:bg-[#E69A0D] focus:ring-[#F4AF1B] shadow-lg hover:shadow-xl",
    outline: "border border-gray-300 bg-white text-[#0B1220] hover:bg-gray-50 focus:ring-[#0F62FE]",
    ghost: "text-[#0B1220] hover:bg-gray-100 focus:ring-[#0F62FE]",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
  }
  
  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 px-3 py-1 text-xs",
    lg: "h-11 px-5 py-2.5 text-base",
    xl: "h-12 px-6 py-3 text-lg"
  }

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export { Button }
