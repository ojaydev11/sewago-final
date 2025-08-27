'use client';

import React, { forwardRef, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, ButtonProps, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends ButtonProps {
  // UX Enhancement Props
  hapticPattern?: string;
  hapticIntensity?: number;
  soundEffect?: string;
  voiceDescription?: string;
  culturalTheme?: boolean;
  enableRipple?: boolean;
  animationType?: 'spring' | 'bounce' | 'cultural' | 'none';
  loadingState?: 'idle' | 'loading' | 'success' | 'error';
  tooltip?: string;
  
  // Accessibility Props
  accessibilityLabel?: string;
  describedBy?: string;
  expandedState?: boolean;
  
  // Cultural Props
  festivalMode?: boolean;
  nepaliText?: string;
  
  // Performance Props
  priority?: 'low' | 'medium' | 'high';
  batterySafe?: boolean;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(({
  children,
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
  onClick,
  
  // UX Enhancement Props
  hapticPattern = 'selection',
  hapticIntensity,
  soundEffect = 'ui_click',
  voiceDescription,
  culturalTheme = false,
  enableRipple = true,
  animationType = 'spring',
  loadingState = 'idle',
  tooltip,
  
  // Accessibility Props
  accessibilityLabel,
  describedBy,
  expandedState,
  
  // Cultural Props
  festivalMode = false,
  nepaliText,
  
  // Performance Props
  priority = 'medium',
  batterySafe = false,
  
  ...props
}, ref) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // UX Hooks - Mock implementations for development
  const { triggerHaptic, preferences: hapticPrefs, isHapticSupported, batteryOptimized } = {
    triggerHaptic: async (pattern: string, options?: any) => console.log('Haptic feedback:', pattern, options),
    preferences: { hapticEnabled: true, hapticIntensity: 70 },
    isHapticSupported: true,
    batteryOptimized: false
  };
  const { playSound, preferences: audioPrefs } = {
    playSound: async (sound: string, options?: any) => console.log('Audio feedback:', sound, options),
    preferences: { soundEnabled: true, soundVolume: 50 }
  };
  const voiceGuidance = {
    isEnabled: false,
    announceAction: (action: string) => console.log('Voice guidance:', action)
  };
  const { 
    reducedMotion, 
    highContrast, 
    fontSize, 
    announceToScreenReader,
    focusVisible 
  } = {
    reducedMotion: false,
    highContrast: false,
    fontSize: 16,
    announceToScreenReader: (message: string) => console.log('Screen reader:', message),
    focusVisible: false
  };
  const { createButtonRipple, createSuccessAnimation, createErrorAnimation } = {
    createButtonRipple: async (element: HTMLElement, event: any) => console.log('Ripple effect'),
    createSuccessAnimation: () => console.log('Success animation'),
    createErrorAnimation: () => console.log('Error animation')
  };

  // Determine if optimizations should be applied
  const shouldOptimize = batterySafe && (batteryOptimized || reducedMotion);
  const effectiveAnimationType = shouldOptimize ? 'none' : animationType;
  const effectiveEnableRipple = shouldOptimize ? false : enableRipple;

  // Cultural theme adjustments
  const getCulturalVariant = () => {
    if (culturalTheme || festivalMode) {
      return variant === 'default' ? 'nepali' : variant;
    }
    return variant;
  };

  // Handle button click with all UX enhancements
  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loadingState === 'loading') return;

    const startTime = Date.now();
    setIsPressed(true);

    try {
      // Haptic feedback
      if (isHapticSupported && hapticPrefs?.hapticEnabled && !shouldOptimize) {
        const pattern = culturalTheme ? 'nepali_blessing' : hapticPattern;
        await triggerHaptic(pattern, {
          intensity: hapticIntensity,
          culturalContext: culturalTheme
        });
      }

      // Audio feedback
      if (audioPrefs?.soundEnabled && !shouldOptimize) {
        const sound = culturalTheme ? 'nepali_chime' : soundEffect;
        await playSound(sound, { 
          volume: priority === 'low' ? 20 : 40,
          culturalContext: culturalTheme
        });
      }

      // Ripple effect
      if (effectiveEnableRipple && buttonRef.current) {
        await createButtonRipple(buttonRef.current, event);
      }

      // Voice guidance
      if (voiceGuidance.isEnabled && voiceDescription) {
        voiceGuidance.announceAction(voiceDescription);
      }

      // Screen reader announcement
      if (accessibilityLabel) {
        announceToScreenReader(`${accessibilityLabel} activated`);
      }

      // Execute original click handler
      await onClick?.(event);

    } finally {
      const duration = Date.now() - startTime;
      setIsPressed(false);

      // Log UX analytics
      logButtonInteraction(duration);
    }
  };

  const logButtonInteraction = async (duration: number) => {
    try {
      await fetch('/api/ux/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactionType: 'enhanced_button_click',
          elementId: `enhanced_button_${hapticPattern}_${variant}`,
          duration,
          context: {
            variant,
            size,
            culturalTheme,
            festivalMode,
            loadingState,
            hapticPattern,
            soundEffect,
            priority,
            batterySafe,
            optimized: shouldOptimize,
            timestamp: new Date().toISOString()
          },
          satisfaction: loadingState === 'success' ? 5 : loadingState === 'error' ? 2 : undefined,
          deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
          screenSize: `${screen.width}x${screen.height}`
        })
      });
    } catch (error) {
      console.error('Error logging button interaction:', error);
    }
  };

  // Animation variants based on type
  const getAnimationVariants = () => {
    if (effectiveAnimationType === 'none' || reducedMotion) {
      return {};
    }

    const baseVariants = {
      spring: {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { type: 'spring', stiffness: 400, damping: 17 } },
        tap: { scale: 0.95, transition: { type: 'spring', stiffness: 400, damping: 17 } }
      },
      bounce: {
        initial: { scale: 1 },
        hover: { scale: 1.1, transition: { type: 'spring', stiffness: 600, damping: 10 } },
        tap: { scale: 0.9, transition: { type: 'spring', stiffness: 600, damping: 10 } }
      },
      cultural: {
        initial: { scale: 1, rotate: 0 },
        hover: { 
          scale: 1.05, 
          rotate: 2,
          transition: { type: 'spring', stiffness: 300, damping: 15 } 
        },
        tap: { 
          scale: 0.95, 
          rotate: -1,
          transition: { type: 'spring', stiffness: 400, damping: 20 } 
        }
      }
    };

    return baseVariants[effectiveAnimationType] || baseVariants.spring;
  };

  const variants = getAnimationVariants();

  // Loading state content
  const getLoadingContent = () => {
    switch (loadingState) {
      case 'loading':
        return (
          <div className="flex items-center space-x-2">
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span>Loading...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center space-x-2">
            <motion.svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </motion.svg>
            <span>Success!</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2">
            <motion.svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              />
            </motion.svg>
            <span>Error</span>
          </div>
        );
      default:
        return children;
    }
  };

  return (
    <div className="relative inline-block">
      <motion.button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          buttonVariants({ variant: getCulturalVariant(), size }),
          // Cultural theme enhancements
          culturalTheme && [
            'border-b-2 border-yellow-400/50',
            'bg-gradient-to-br from-red-600 via-red-700 to-red-800',
            'hover:from-red-700 hover:via-red-800 hover:to-red-900',
            'shadow-lg hover:shadow-red-500/25'
          ],
          // Festival mode enhancements
          festivalMode && [
            'relative overflow-visible',
            'before:absolute before:inset-0 before:rounded-xl',
            'before:bg-gradient-to-r before:from-yellow-400/20 before:to-red-500/20',
            'before:animate-pulse before:duration-2000'
          ],
          // High contrast mode
          highContrast && [
            'border-2 border-gray-900',
            'text-gray-900 font-bold',
            'bg-white hover:bg-gray-100'
          ],
          // Focus visible enhancements
          focusVisible && [
            'focus-visible:ring-4 focus-visible:ring-blue-500/50',
            'focus-visible:ring-offset-4'
          ],
          className
        )}
        variants={variants}
        initial="initial"
        animate={isPressed ? 'tap' : 'initial'}
        whileHover={!disabled && loadingState === 'idle' ? 'hover' : 'initial'}
        whileTap={!disabled && loadingState === 'idle' ? 'tap' : 'initial'}
        onClick={handleClick}
        disabled={disabled || loadingState === 'loading'}
        aria-label={accessibilityLabel}
        aria-describedby={describedBy}
        aria-expanded={expandedState}
        title={tooltip}
        // Only pass compatible button props to motion.button
        type={props.type}
        name={props.name}
        value={props.value}
        form={props.form}
        tabIndex={props.tabIndex}
        autoFocus={props.autoFocus}
      >
        {/* Cultural background pattern */}
        {culturalTheme && !shouldOptimize && (
          <div className="absolute inset-0 opacity-10 rounded-xl overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.3" />
              <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.1" />
            </svg>
          </div>
        )}

        {/* Main content */}
        <span className="relative z-10 flex items-center justify-center space-x-2">
          {getLoadingContent()}
        </span>

        {/* Nepali text overlay */}
        {nepaliText && (
          <motion.div
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 devanagari-font"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {nepaliText}
          </motion.div>
        )}

        {/* Festival mode effects */}
        <AnimatePresence>
          {festivalMode && !shouldOptimize && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              exit={{ scale: 0 }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )}
        </AnimatePresence>

        {/* High contrast focus indicator */}
        {highContrast && (
          <div className="absolute inset-0 border-4 border-yellow-400 rounded-xl opacity-0 focus-within:opacity-100 transition-opacity" />
        )}
      </motion.button>

      {/* Tooltip */}
      {tooltip && !disabled && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
});

EnhancedButton.displayName = 'EnhancedButton';

export default EnhancedButton;