'use client';

import React, { forwardRef, useState } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { useHapticFeedback } from '@/contexts/HapticFeedbackContext';
import { cn } from '@/lib/utils';

interface HapticButtonProps extends Omit<ButtonProps, 'onClick'> {
  hapticPattern?: string;
  hapticIntensity?: number;
  enableRipple?: boolean;
  enableSpring?: boolean;
  culturalContext?: boolean;
  accessibilityLabel?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onHapticTrigger?: (patternName: string) => void;
}

const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({
    children,
    className,
    hapticPattern = 'selection',
    hapticIntensity,
    enableRipple = true,
    enableSpring = true,
    culturalContext = false,
    accessibilityLabel,
    onClick,
    onHapticTrigger,
    disabled,
    variant = 'default',
    size = 'default',
    ...props
  }, ref) => {
    const { triggerHaptic, preferences, isHapticSupported } = useHapticFeedback();
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      const startTime = Date.now();
      
      // Trigger haptic feedback
      if (isHapticSupported && preferences?.hapticEnabled) {
        await triggerHaptic(hapticPattern, {
          intensity: hapticIntensity,
          culturalContext
        });
        onHapticTrigger?.(hapticPattern);
      }

      // Create ripple effect
      if (enableRipple && preferences?.animationsEnabled && !preferences?.reducedMotion) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const rippleX = event.clientX - rect.left;
        const rippleY = event.clientY - rect.top;
        
        const newRipple = {
          id: Date.now(),
          x: rippleX,
          y: rippleY
        };
        
        setRipples(prev => [...prev, newRipple]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
        }, 600);
      }

      // Execute click handler
      try {
        await onClick?.(event);
      } finally {
        // Log interaction analytics
        const duration = Date.now() - startTime;
        logButtonInteraction(duration, hapticPattern, culturalContext);
      }
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsPressed(false);

    const logButtonInteraction = async (duration: number, pattern: string, cultural: boolean) => {
      try {
        await fetch('/api/ux/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interactionType: 'click',
            elementId: `haptic_button_${pattern}`,
            duration,
            context: {
              hapticPattern: pattern,
              culturalContext: cultural,
              buttonVariant: variant,
              buttonSize: size,
              hapticSupported: isHapticSupported,
              timestamp: new Date().toISOString()
            },
            deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
            screenSize: `${screen.width}x${screen.height}`
          })
        });
      } catch (error) {
        console.error('Error logging button interaction:', error);
      }
    };

    // Animation variants
    const springVariants = {
      initial: { scale: 1 },
      pressed: { scale: 0.95 },
      hover: { scale: 1.02 },
      tap: { scale: 0.98 }
    };

    const buttonContent = (
      <motion.div
        className="relative overflow-hidden w-full h-full flex items-center justify-center"
        variants={enableSpring ? springVariants : {}}
        initial="initial"
        animate={isPressed ? 'pressed' : 'initial'}
        whileHover={!disabled ? 'hover' : 'initial'}
        whileTap={!disabled ? 'tap' : 'initial'}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {children}
        
        {/* Ripple effects */}
        {enableRipple && ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full bg-white/20"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20
            }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}

        {/* Accessibility indicator */}
        {preferences?.highContrast && (
          <div 
            className="absolute inset-0 border-2 border-yellow-400 rounded-md pointer-events-none"
            aria-hidden="true"
          />
        )}
      </motion.div>
    );

    return (
      <Button
        ref={ref}
        className={cn(
          'relative overflow-hidden transition-all duration-200',
          // Cultural theme enhancements
          culturalContext && preferences?.culturalSounds && [
            'bg-gradient-to-r from-red-600 to-red-700',
            'hover:from-red-700 hover:to-red-800',
            'border-b-2 border-yellow-400'
          ],
          // High contrast mode
          preferences?.highContrast && [
            'border-2 border-gray-900',
            'text-gray-900 font-bold'
          ],
          // Reduced motion
          preferences?.reducedMotion && 'transition-none',
          className
        )}
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        aria-label={accessibilityLabel}
        role="button"
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {buttonContent}
      </Button>
    );
  }
);

HapticButton.displayName = 'HapticButton';

export default HapticButton;