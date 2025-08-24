'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { useHapticFeedback } from '@/contexts/HapticFeedbackContext';
import { cn } from '@/lib/utils';

interface HapticSwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  hapticPatternOn?: string;
  hapticPatternOff?: string;
  hapticIntensity?: number;
  culturalContext?: boolean;
  label?: string;
  description?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'cultural' | 'accessibility';
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const HapticSwitch: React.FC<HapticSwitchProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  hapticPatternOn = 'success',
  hapticPatternOff = 'selection',
  hapticIntensity,
  culturalContext = false,
  label,
  description,
  size = 'default',
  variant = 'default',
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}) => {
  const { triggerHaptic, preferences, isHapticSupported } = useHapticFeedback();
  const [isToggling, setIsToggling] = useState(false);
  const [localChecked, setLocalChecked] = useState(checked);

  useEffect(() => {
    setLocalChecked(checked);
  }, [checked]);

  const handleCheckedChange = async (newChecked: boolean) => {
    if (disabled) return;

    setIsToggling(true);
    setLocalChecked(newChecked);

    // Trigger haptic feedback
    if (isHapticSupported && preferences?.hapticEnabled) {
      const pattern = newChecked ? hapticPatternOn : hapticPatternOff;
      await triggerHaptic(pattern, {
        intensity: hapticIntensity,
        culturalContext
      });
    }

    // Call the onChange handler
    onCheckedChange?.(newChecked);

    // Log interaction
    await logSwitchInteraction(newChecked, pattern);

    setIsToggling(false);
  };

  const logSwitchInteraction = async (newState: boolean, hapticPattern: string) => {
    try {
      await fetch('/api/ux/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactionType: 'switch_toggle',
          elementId: `haptic_switch_${hapticPattern}`,
          duration: 150,
          context: {
            newState,
            hapticPattern,
            culturalContext,
            switchSize: size,
            switchVariant: variant,
            timestamp: new Date().toISOString()
          },
          deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
          screenSize: `${screen.width}x${screen.height}`
        })
      });
    } catch (error) {
      console.error('Error logging switch interaction:', error);
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      root: 'h-5 w-9',
      thumb: 'h-4 w-4 data-[state=checked]:translate-x-4',
      label: 'text-sm',
      description: 'text-xs'
    },
    default: {
      root: 'h-6 w-11',
      thumb: 'h-5 w-5 data-[state=checked]:translate-x-5',
      label: 'text-base',
      description: 'text-sm'
    },
    lg: {
      root: 'h-8 w-14',
      thumb: 'h-7 w-7 data-[state=checked]:translate-x-6',
      label: 'text-lg',
      description: 'text-base'
    }
  };

  // Variant configurations
  const variantConfig = {
    default: {
      root: 'bg-gray-200 data-[state=checked]:bg-blue-600',
      thumb: 'bg-white',
      focus: 'focus-visible:ring-blue-500'
    },
    cultural: {
      root: 'bg-gray-200 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-600 data-[state=checked]:to-red-700',
      thumb: 'bg-white data-[state=checked]:bg-yellow-100',
      focus: 'focus-visible:ring-red-500'
    },
    accessibility: {
      root: 'bg-gray-200 data-[state=checked]:bg-gray-900 border-2 border-gray-900',
      thumb: 'bg-white border border-gray-900',
      focus: 'focus-visible:ring-yellow-500'
    }
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  // Animation variants
  const thumbVariants = {
    unchecked: { 
      x: 0,
      scale: 1,
      backgroundColor: currentVariant.thumb.includes('bg-white') ? '#ffffff' : '#f3f4f6'
    },
    checked: { 
      x: size === 'sm' ? 16 : size === 'lg' ? 24 : 20,
      scale: 1.1,
      backgroundColor: culturalContext && preferences?.culturalSounds 
        ? '#fef3c7' 
        : currentVariant.thumb.includes('bg-white') ? '#ffffff' : '#f3f4f6'
    },
    toggling: {
      scale: 0.9
    }
  };

  const rootVariants = {
    unchecked: { 
      backgroundColor: '#e5e7eb'
    },
    checked: {
      backgroundColor: culturalContext && preferences?.culturalSounds
        ? '#dc2626'
        : variant === 'accessibility' ? '#111827' : '#2563eb'
    }
  };

  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      {(label || description) && (
        <div className="space-y-1">
          {label && (
            <label 
              className={cn(
                'font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                currentSize.label,
                preferences?.highContrast && 'text-gray-900 font-bold'
              )}
              htmlFor={`switch-${label}`}
            >
              {label}
            </label>
          )}
          {description && (
            <p 
              className={cn(
                'text-gray-600',
                currentSize.description,
                preferences?.highContrast && 'text-gray-800 font-medium'
              )}
              id={ariaDescribedBy}
            >
              {description}
            </p>
          )}
        </div>
      )}

      <SwitchPrimitives.Root
        id={`switch-${label}`}
        className={cn(
          'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          'disabled:cursor-not-allowed disabled:opacity-50',
          currentSize.root,
          currentVariant.focus,
          preferences?.reducedMotion && 'transition-none'
        )}
        checked={localChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        style={{
          backgroundColor: localChecked 
            ? (culturalContext && preferences?.culturalSounds ? '#dc2626' : '#2563eb')
            : '#e5e7eb'
        }}
      >
        <SwitchPrimitives.Thumb asChild>
          <motion.div
            className={cn(
              'pointer-events-none block rounded-full shadow-lg ring-0 transition-transform',
              currentSize.thumb,
              currentVariant.thumb
            )}
            variants={preferences?.animationsEnabled && !preferences?.reducedMotion ? thumbVariants : {}}
            animate={
              isToggling 
                ? 'toggling' 
                : localChecked 
                  ? 'checked' 
                  : 'unchecked'
            }
            transition={{ 
              type: 'spring', 
              stiffness: 500, 
              damping: 30,
              duration: preferences?.reducedMotion ? 0 : undefined
            }}
          >
            {/* Cultural pattern indicator */}
            <AnimatePresence>
              {culturalContext && preferences?.culturalSounds && localChecked && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 opacity-30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.3, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>

            {/* Accessibility indicator */}
            {preferences?.highContrast && (
              <div 
                className="absolute inset-0 border border-yellow-400 rounded-full"
                aria-hidden="true"
              />
            )}
          </motion.div>
        </SwitchPrimitives.Thumb>

        {/* Visual feedback ring */}
        <AnimatePresence>
          {isToggling && preferences?.animationsEnabled && !preferences?.reducedMotion && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-60"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.2, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
      </SwitchPrimitives.Root>

      {/* Screen reader feedback */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {localChecked ? 'Switch is on' : 'Switch is off'}
        {culturalContext && preferences?.culturalSounds && localChecked && ', Cultural mode enabled'}
      </div>
    </div>
  );
};

export default HapticSwitch;