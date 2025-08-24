'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, MotionValue } from 'framer-motion';
import { useHapticFeedback } from '@/contexts/HapticFeedbackContext';
import { useAudioFeedback } from '@/contexts/AudioFeedbackContext';

// Button Ripple Effect Component
interface ButtonRippleEffectProps {
  children: ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  disabled?: boolean;
  rippleColor?: string;
  hapticPattern?: string;
  soundEffect?: string;
}

export const ButtonRippleEffect: React.FC<ButtonRippleEffectProps> = ({
  children,
  className = '',
  onClick,
  disabled = false,
  rippleColor = 'rgba(255, 255, 255, 0.4)',
  hapticPattern = 'selection',
  soundEffect = 'ui_click'
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const { triggerHaptic, preferences: hapticPrefs } = useHapticFeedback();
  const { playSound, preferences: audioPrefs } = useAudioFeedback();
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleClick = async (event: React.MouseEvent) => {
    if (disabled) return;

    const button = buttonRef.current;
    if (!button) return;

    // Calculate ripple position and size
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    // Create ripple
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    };

    setRipples(prev => [...prev, newRipple]);

    // Trigger feedback
    if (hapticPrefs?.hapticEnabled) {
      await triggerHaptic(hapticPattern);
    }
    
    if (audioPrefs?.soundEnabled) {
      await playSound(soundEffect, { volume: 30 });
    }

    // Execute click handler
    onClick?.(event);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return (
    <motion.div
      ref={buttonRef}
      className={`relative overflow-hidden cursor-pointer select-none ${className}`}
      onClick={handleClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
      
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: rippleColor
            }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

// Loading Micro Animations Component
interface LoadingMicroAnimationsProps {
  variant?: 'dots' | 'pulse' | 'wave' | 'nepali_mandala' | 'prayer_wheel';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  culturalTheme?: boolean;
}

export const LoadingMicroAnimations: React.FC<LoadingMicroAnimationsProps> = ({
  variant = 'dots',
  size = 'md',
  color = '#3B82F6',
  culturalTheme = false
}) => {
  const sizeConfig = {
    sm: { container: 'w-6 h-6', dot: 'w-1 h-1', mandala: 'w-8 h-8' },
    md: { container: 'w-8 h-8', dot: 'w-2 h-2', mandala: 'w-12 h-12' },
    lg: { container: 'w-12 h-12', dot: 'w-3 h-3', mandala: 'w-16 h-16' }
  };

  const config = sizeConfig[size];
  const nepaliColor = culturalTheme ? '#DC2626' : color;

  const renderDots = () => (
    <div className={`flex space-x-1 ${config.container} items-center justify-center`}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className={`${config.dot} rounded-full`}
          style={{ backgroundColor: nepaliColor }}
          animate={{
            y: [-4, 4, -4],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`${config.container} relative`}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: nepaliColor }}
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [1, 0.3, 1]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );

  const renderWave = () => (
    <div className={`flex items-end space-x-1 ${config.container}`}>
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          className="w-1 rounded-t"
          style={{ backgroundColor: nepaliColor }}
          animate={{
            height: ['20%', '100%', '20%']
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );

  const renderNepaliMandala = () => (
    <div className={`${config.mandala} relative`}>
      <motion.svg
        viewBox="0 0 50 50"
        className="w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <motion.circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={nepaliColor}
          strokeWidth="2"
          strokeDasharray="31.416"
          animate={{ strokeDashoffset: [31.416, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <motion.circle
          cx="25"
          cy="25"
          r="15"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeDasharray="15 5"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <motion.circle
          cx="25"
          cy="25"
          r="5"
          fill={nepaliColor}
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.svg>
    </div>
  );

  const renderPrayerWheel = () => (
    <div className={`${config.mandala} relative`}>
      <motion.div
        className="w-full h-full rounded-full border-4 border-transparent relative"
        style={{ borderTopColor: nepaliColor, borderRightColor: '#F59E0B' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <div 
          className="absolute inset-2 rounded-full"
          style={{ backgroundColor: `${nepaliColor}20` }}
        >
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold"
            style={{ color: nepaliColor }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            ॐ
          </motion.div>
        </div>
      </motion.div>
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'wave': return renderWave();
      case 'nepali_mandala': return renderNepaliMandala();
      case 'prayer_wheel': return renderPrayerWheel();
      default: return renderDots();
    }
  };

  return (
    <div className="flex items-center justify-center">
      {renderVariant()}
    </div>
  );
};

// Transition Animations Component
interface TransitionAnimationsProps {
  children: ReactNode;
  variant?: 'slide' | 'fade' | 'scale' | 'flip' | 'cultural_fold';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  className?: string;
}

export const TransitionAnimations: React.FC<TransitionAnimationsProps> = ({
  children,
  variant = 'fade',
  direction = 'up',
  duration = 0.3,
  delay = 0,
  className = ''
}) => {
  const variants = {
    slide: {
      initial: {
        x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
        y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
        opacity: 0
      },
      animate: {
        x: 0,
        y: 0,
        opacity: 1
      }
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    },
    scale: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 }
    },
    flip: {
      initial: { rotateY: -90, opacity: 0 },
      animate: { rotateY: 0, opacity: 1 }
    },
    cultural_fold: {
      initial: { 
        rotateX: -90, 
        transformOrigin: 'top',
        opacity: 0,
        scale: 0.9
      },
      animate: { 
        rotateX: 0, 
        opacity: 1,
        scale: 1
      }
    }
  };

  return (
    <motion.div
      className={className}
      initial={variants[variant].initial}
      animate={variants[variant].animate}
      transition={{
        duration,
        delay,
        ease: variant === 'cultural_fold' ? 'easeOut' : 'easeInOut',
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
    >
      {children}
    </motion.div>
  );
};

// Progress Indicator Animations
interface ProgressIndicatorAnimationsProps {
  progress: number;
  variant?: 'linear' | 'circular' | 'nepali_progress' | 'mandala_progress';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showPercentage?: boolean;
  culturalTheme?: boolean;
}

export const ProgressIndicatorAnimations: React.FC<ProgressIndicatorAnimationsProps> = ({
  progress,
  variant = 'linear',
  size = 'md',
  color = '#3B82F6',
  showPercentage = false,
  culturalTheme = false
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const nepaliColor = culturalTheme ? '#DC2626' : color;
  
  const sizeConfig = {
    sm: { height: 'h-2', width: 'w-32', circle: 'w-8 h-8' },
    md: { height: 'h-3', width: 'w-48', circle: 'w-12 h-12' },
    lg: { height: 'h-4', width: 'w-64', circle: 'w-16 h-16' }
  };

  const config = sizeConfig[size];

  const renderLinear = () => (
    <div className="flex items-center space-x-3">
      <div className={`${config.width} ${config.height} bg-gray-200 rounded-full overflow-hidden`}>
        <motion.div
          className={`${config.height} rounded-full`}
          style={{ backgroundColor: nepaliColor }}
          initial={{ width: '0%' }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      </div>
      {showPercentage && (
        <motion.span
          className="text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {Math.round(clampedProgress)}%
        </motion.span>
      )}
    </div>
  );

  const renderCircular = () => {
    const circumference = 2 * Math.PI * 20;
    const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

    return (
      <div className={`${config.circle} relative`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="4"
          />
          <motion.circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={nepaliColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="text-sm font-bold"
              style={{ color: nepaliColor }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {Math.round(clampedProgress)}%
            </motion.span>
          </div>
        )}
      </div>
    );
  };

  const renderNepaliProgress = () => (
    <div className="flex items-center space-x-3">
      <div className={`${config.width} ${config.height} bg-gray-200 rounded-full overflow-hidden relative`}>
        <motion.div
          className={`${config.height} rounded-full bg-gradient-to-r from-red-600 to-red-700 relative`}
          initial={{ width: '0%' }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute top-0 right-0 w-1 h-full bg-yellow-400"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </motion.div>
      </div>
      {showPercentage && (
        <motion.div
          className="flex items-center space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-sm font-medium">{Math.round(clampedProgress)}%</span>
          <span className="text-xs text-red-600">पूरा</span>
        </motion.div>
      )}
    </div>
  );

  const renderMandalaProgress = () => {
    const segments = 8;
    const filledSegments = Math.floor((clampedProgress / 100) * segments);

    return (
      <div className={`${config.circle} relative`}>
        <svg className="w-full h-full" viewBox="0 0 50 50">
          {Array.from({ length: segments }).map((_, i) => {
            const angle = (i / segments) * 360;
            const isFilled = i < filledSegments;
            
            return (
              <motion.path
                key={i}
                d={`M 25 25 L 25 5 A 20 20 0 0 1 ${25 + 20 * Math.sin((angle + 45) * Math.PI / 180)} ${25 - 20 * Math.cos((angle + 45) * Math.PI / 180)} Z`}
                fill={isFilled ? nepaliColor : '#E5E7EB'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                transform={`rotate(${angle} 25 25)`}
              />
            );
          })}
          <circle
            cx="25"
            cy="25"
            r="8"
            fill="white"
            stroke={nepaliColor}
            strokeWidth="2"
          />
          {showPercentage && (
            <text
              x="25"
              y="29"
              textAnchor="middle"
              className="text-xs font-bold"
              fill={nepaliColor}
            >
              {Math.round(clampedProgress)}%
            </text>
          )}
        </svg>
      </div>
    );
  };

  const renderVariant = () => {
    switch (variant) {
      case 'linear': return renderLinear();
      case 'circular': return renderCircular();
      case 'nepali_progress': return renderNepaliProgress();
      case 'mandala_progress': return renderMandalaProgress();
      default: return renderLinear();
    }
  };

  return (
    <div className="flex items-center">
      {renderVariant()}
    </div>
  );
};

// Success/Error State Animations
interface StateAnimationsProps {
  state: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  culturalTheme?: boolean;
  onAnimationComplete?: () => void;
}

export const StateAnimations: React.FC<StateAnimationsProps> = ({
  state,
  message,
  culturalTheme = false,
  onAnimationComplete
}) => {
  const iconColor = culturalTheme
    ? { success: '#059669', error: '#DC2626', loading: '#F59E0B' }
    : { success: '#10B981', error: '#EF4444', loading: '#3B82F6' };

  const renderIcon = () => {
    switch (state) {
      case 'loading':
        return <LoadingMicroAnimations variant={culturalTheme ? 'prayer_wheel' : 'pulse'} size="md" />;
      
      case 'success':
        return (
          <motion.svg
            className="w-8 h-8"
            fill="none"
            stroke={iconColor.success}
            viewBox="0 0 24 24"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            onAnimationComplete={onAnimationComplete}
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
        );
      
      case 'error':
        return (
          <motion.svg
            className="w-8 h-8"
            fill="none"
            stroke={iconColor.error}
            viewBox="0 0 24 24"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            onAnimationComplete={onAnimationComplete}
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
        );
      
      default:
        return null;
    }
  };

  if (state === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div
        className="flex items-center space-x-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {renderIcon()}
        {message && (
          <motion.span
            className={`text-sm font-medium ${
              state === 'success' ? 'text-green-600' :
              state === 'error' ? 'text-red-600' :
              'text-gray-600'
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};