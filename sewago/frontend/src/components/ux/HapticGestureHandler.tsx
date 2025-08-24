'use client';

import React, { useRef, useEffect, ReactNode, useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useHapticFeedback } from '@/contexts/HapticFeedbackContext';

interface GestureEvent {
  type: 'swipe' | 'longPress' | 'pinch' | 'rotate' | 'pull' | 'shake';
  direction?: 'left' | 'right' | 'up' | 'down';
  intensity?: number;
  duration?: number;
  velocity?: number;
  scale?: number;
  rotation?: number;
}

interface HapticGestureHandlerProps {
  children: ReactNode;
  onGesture?: (event: GestureEvent) => void | Promise<void>;
  enableSwipe?: boolean;
  enableLongPress?: boolean;
  enablePinch?: boolean;
  enableRotate?: boolean;
  enablePullToRefresh?: boolean;
  enableShakeToUndo?: boolean;
  swipeThreshold?: number;
  longPressThreshold?: number;
  pinchThreshold?: number;
  rotateThreshold?: number;
  culturalGestures?: boolean;
  className?: string;
  disabled?: boolean;
}

const HapticGestureHandler: React.FC<HapticGestureHandlerProps> = ({
  children,
  onGesture,
  enableSwipe = true,
  enableLongPress = true,
  enablePinch = false,
  enableRotate = false,
  enablePullToRefresh = false,
  enableShakeToUndo = false,
  swipeThreshold = 50,
  longPressThreshold = 500,
  pinchThreshold = 0.1,
  rotateThreshold = 15,
  culturalGestures = false,
  className,
  disabled = false
}) => {
  const { triggerHaptic, preferences } = useHapticFeedback();
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Motion values for gestures
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const rotate = useMotionValue(0);
  
  // Transform values for visual feedback
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
  const backgroundColor = useTransform(
    x,
    [-100, -50, 0, 50, 100],
    ['#ef4444', '#f97316', '#ffffff', '#22c55e', '#3b82f6']
  );

  // State for gesture tracking
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [initialTouchDistance, setInitialTouchDistance] = useState(0);
  const [initialRotation, setInitialRotation] = useState(0);
  const [lastShakeTime, setLastShakeTime] = useState(0);

  // Device motion for shake gesture
  useEffect(() => {
    if (!enableShakeToUndo || disabled) return;

    let acceleration = { x: 0, y: 0, z: 0 };
    let lastAcceleration = { x: 0, y: 0, z: 0 };

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const current = event.accelerationIncludingGravity;
      acceleration = {
        x: current.x || 0,
        y: current.y || 0,
        z: current.z || 0
      };

      // Calculate shake intensity
      const deltaX = Math.abs(acceleration.x - lastAcceleration.x);
      const deltaY = Math.abs(acceleration.y - lastAcceleration.y);
      const deltaZ = Math.abs(acceleration.z - lastAcceleration.z);
      const shakeIntensity = deltaX + deltaY + deltaZ;

      // Detect shake gesture
      if (shakeIntensity > 15 && Date.now() - lastShakeTime > 1000) {
        handleGesture({
          type: 'shake',
          intensity: shakeIntensity,
          duration: 200
        });
        setLastShakeTime(Date.now());
      }

      lastAcceleration = acceleration;
    };

    // Request permission for iOS 13+
    if (typeof DeviceMotionEvent !== 'undefined' && 'requestPermission' in DeviceMotionEvent) {
      // @ts-ignore
      DeviceMotionEvent.requestPermission().then(response => {
        if (response === 'granted') {
          window.addEventListener('devicemotion', handleMotion);
        }
      });
    } else {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [enableShakeToUndo, disabled, lastShakeTime]);

  const handleGesture = async (gestureEvent: GestureEvent) => {
    if (disabled) return;

    // Trigger appropriate haptic feedback
    let hapticPattern = 'selection';
    let intensity = 50;

    switch (gestureEvent.type) {
      case 'swipe':
        hapticPattern = culturalGestures ? 'nepali_blessing' : 'selection';
        intensity = Math.min(80, (gestureEvent.velocity || 0) * 20);
        break;
      case 'longPress':
        hapticPattern = culturalGestures ? 'nepali_celebration' : 'notification';
        intensity = 70;
        break;
      case 'pinch':
        hapticPattern = 'warning';
        intensity = Math.min(90, (gestureEvent.scale || 1) * 50);
        break;
      case 'rotate':
        hapticPattern = 'error';
        intensity = Math.min(80, Math.abs(gestureEvent.rotation || 0) * 2);
        break;
      case 'pull':
        hapticPattern = 'success';
        intensity = 60;
        break;
      case 'shake':
        hapticPattern = culturalGestures ? 'nepali_celebration' : 'warning';
        intensity = Math.min(100, (gestureEvent.intensity || 0) * 5);
        break;
    }

    if (preferences?.hapticEnabled) {
      await triggerHaptic(hapticPattern, { 
        intensity, 
        culturalContext: culturalGestures 
      });
    }

    // Call the gesture handler
    await onGesture?.(gestureEvent);

    // Log gesture analytics
    await logGestureAnalytics(gestureEvent, hapticPattern, intensity);
  };

  const logGestureAnalytics = async (
    gestureEvent: GestureEvent, 
    hapticPattern: string, 
    intensity: number
  ) => {
    try {
      await fetch('/api/ux/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactionType: `gesture_${gestureEvent.type}`,
          elementId: `haptic_gesture_${gestureEvent.type}`,
          duration: gestureEvent.duration || 0,
          context: {
            gestureType: gestureEvent.type,
            direction: gestureEvent.direction,
            intensity: gestureEvent.intensity,
            velocity: gestureEvent.velocity,
            scale: gestureEvent.scale,
            rotation: gestureEvent.rotation,
            hapticPattern,
            hapticIntensity: intensity,
            culturalGestures,
            timestamp: new Date().toISOString()
          },
          deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
          screenSize: `${screen.width}x${screen.height}`
        })
      });
    } catch (error) {
      console.error('Error logging gesture analytics:', error);
    }
  };

  // Touch event handlers
  const handleTouchStart = (event: React.TouchEvent) => {
    if (disabled) return;

    const touches = event.touches;
    
    // Long press detection
    if (enableLongPress && touches.length === 1) {
      const timer = setTimeout(() => {
        setIsLongPressing(true);
        handleGesture({
          type: 'longPress',
          duration: longPressThreshold
        });
      }, longPressThreshold);
      setLongPressTimer(timer);
    }

    // Multi-touch gestures
    if (touches.length === 2) {
      // Calculate initial distance for pinch
      if (enablePinch) {
        const distance = Math.sqrt(
          Math.pow(touches[0].pageX - touches[1].pageX, 2) +
          Math.pow(touches[0].pageY - touches[1].pageY, 2)
        );
        setInitialTouchDistance(distance);
      }

      // Calculate initial rotation
      if (enableRotate) {
        const angle = Math.atan2(
          touches[1].pageY - touches[0].pageY,
          touches[1].pageX - touches[0].pageX
        ) * 180 / Math.PI;
        setInitialRotation(angle);
      }
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (disabled) return;

    const touches = event.touches;

    // Multi-touch gestures
    if (touches.length === 2) {
      // Pinch gesture
      if (enablePinch && initialTouchDistance > 0) {
        const currentDistance = Math.sqrt(
          Math.pow(touches[0].pageX - touches[1].pageX, 2) +
          Math.pow(touches[0].pageY - touches[1].pageY, 2)
        );
        const scaleChange = currentDistance / initialTouchDistance;
        scale.set(scaleChange);

        if (Math.abs(scaleChange - 1) > pinchThreshold) {
          handleGesture({
            type: 'pinch',
            scale: scaleChange,
            intensity: Math.abs(scaleChange - 1) * 100
          });
        }
      }

      // Rotate gesture
      if (enableRotate && initialRotation !== 0) {
        const currentAngle = Math.atan2(
          touches[1].pageY - touches[0].pageY,
          touches[1].pageX - touches[0].pageX
        ) * 180 / Math.PI;
        const rotationChange = currentAngle - initialRotation;
        rotate.set(rotationChange);

        if (Math.abs(rotationChange) > rotateThreshold) {
          handleGesture({
            type: 'rotate',
            rotation: rotationChange,
            intensity: Math.abs(rotationChange) / 3.6
          });
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(false);
    setInitialTouchDistance(0);
    setInitialRotation(0);
  };

  // Pan gesture handlers
  const handlePanStart = () => {
    if (disabled) return;
    // Reset transform values
    x.set(0);
    y.set(0);
  };

  const handlePan = (event: any, info: PanInfo) => {
    if (disabled || !enableSwipe) return;
    
    x.set(info.offset.x);
    y.set(info.offset.y);
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    if (disabled || !enableSwipe) return;

    const { offset, velocity } = info;
    const absOffsetX = Math.abs(offset.x);
    const absOffsetY = Math.abs(offset.y);

    // Determine swipe direction and trigger haptic
    if (absOffsetX > swipeThreshold || absOffsetY > swipeThreshold) {
      let direction: 'left' | 'right' | 'up' | 'down';
      
      if (absOffsetX > absOffsetY) {
        direction = offset.x > 0 ? 'right' : 'left';
      } else {
        direction = offset.y > 0 ? 'down' : 'up';
      }

      handleGesture({
        type: 'swipe',
        direction,
        velocity: Math.sqrt(velocity.x ** 2 + velocity.y ** 2),
        duration: 200
      });
    }

    // Pull to refresh gesture
    if (enablePullToRefresh && offset.y > 100 && velocity.y > 0) {
      handleGesture({
        type: 'pull',
        direction: 'down',
        intensity: offset.y,
        duration: 300
      });
    }

    // Reset position with spring animation
    x.set(0);
    y.set(0);
    scale.set(1);
    rotate.set(0);
  };

  return (
    <motion.div
      ref={elementRef}
      className={className}
      style={{ 
        x, 
        y, 
        scale, 
        rotate,
        opacity: preferences?.animationsEnabled ? opacity : 1
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPanStart={handlePanStart}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      drag={enableSwipe && !disabled}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      animate={{
        scale: isLongPressing ? 1.05 : 1,
        backgroundColor: preferences?.animationsEnabled ? backgroundColor : undefined
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        duration: preferences?.reducedMotion ? 0 : undefined
      }}
    >
      {children}
      
      {/* Visual feedback for gestures */}
      {preferences?.animationsEnabled && !preferences?.reducedMotion && (
        <>
          {/* Long press indicator */}
          {isLongPressing && (
            <motion.div
              className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}

          {/* Cultural gesture indicator */}
          {culturalGestures && preferences?.culturalSounds && (
            <motion.div
              className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full pointer-events-none"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )}
        </>
      )}
    </motion.div>
  );
};

export default HapticGestureHandler;