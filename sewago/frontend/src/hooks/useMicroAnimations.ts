'use client';

import { useState, useCallback, useRef } from 'react';
import { performanceOptimizer } from '@/lib/performance-ux';
import { useHapticFeedback } from './useHapticFeedback';
import { useAudioFeedback } from './useSoundDesign';

interface AnimationOptions {
  duration?: number;
  delay?: number;
  hapticPattern?: string;
  soundEffect?: string;
  onComplete?: () => void;
}

interface MicroAnimationState {
  isAnimating: boolean;
  animationCount: number;
  queueLength: number;
}

export function useMicroAnimations() {
  const [state, setState] = useState<MicroAnimationState>({
    isAnimating: false,
    animationCount: 0,
    queueLength: 0
  });

  const { triggerHaptic, preferences: hapticPrefs } = useHapticFeedback();
  const { playSound, preferences: audioPrefs } = useAudioFeedback();
  const animationIdRef = useRef<number>(0);

  const createAnimation = useCallback(
    (animationFn: () => Promise<void>, options: AnimationOptions = {}): Promise<void> => {
      return performanceOptimizer.queueAnimation(async () => {
        const animationId = ++animationIdRef.current;
        
        setState(prev => ({
          ...prev,
          isAnimating: true,
          animationCount: prev.animationCount + 1
        }));

        try {
          // Trigger feedback before animation if specified
          if (options.hapticPattern && hapticPrefs?.hapticEnabled) {
            await triggerHaptic(options.hapticPattern);
          }

          if (options.soundEffect && audioPrefs?.soundEnabled) {
            await playSound(options.soundEffect, { volume: 30 });
          }

          // Apply delay if specified
          if (options.delay) {
            await new Promise(resolve => setTimeout(resolve, options.delay));
          }

          // Execute the animation
          await animationFn();

          // Call completion callback
          options.onComplete?.();

        } finally {
          setState(prev => ({
            ...prev,
            isAnimating: prev.animationCount <= 1 ? false : prev.isAnimating,
            animationCount: Math.max(0, prev.animationCount - 1)
          }));
        }
      });
    },
    [triggerHaptic, playSound, hapticPrefs, audioPrefs]
  );

  const createButtonRipple = useCallback(
    (element: HTMLElement, event: React.MouseEvent, options: AnimationOptions = {}) => {
      return createAnimation(async () => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const size = Math.max(rect.width, rect.height) * 2;

        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.left = `${x - size / 2}px`;
        ripple.style.top = `${y - size / 2}px`;
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.borderRadius = '50%';
        ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        ripple.style.transform = 'scale(0)';
        ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '1000';

        element.appendChild(ripple);

        // Trigger the ripple animation
        await new Promise<void>(resolve => {
          requestAnimationFrame(() => {
            ripple.style.transform = 'scale(1)';
            ripple.style.opacity = '0';
            
            setTimeout(() => {
              if (element.contains(ripple)) {
                element.removeChild(ripple);
              }
              resolve();
            }, 600);
          });
        });
      }, options);
    },
    [createAnimation]
  );

  const createLoadingAnimation = useCallback(
    (element: HTMLElement, variant: 'pulse' | 'spinner' | 'dots' = 'pulse', options: AnimationOptions = {}) => {
      return createAnimation(async () => {
        const originalContent = element.innerHTML;
        
        // Create loading indicator based on variant
        let loadingHTML = '';
        switch (variant) {
          case 'pulse':
            loadingHTML = '<div class="animate-pulse w-full h-4 bg-gray-200 rounded"></div>';
            break;
          case 'spinner':
            loadingHTML = '<div class="animate-spin w-4 h-4 border-2 border-gray-200 border-t-blue-600 rounded-full"></div>';
            break;
          case 'dots':
            loadingHTML = `
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            `;
            break;
        }

        element.innerHTML = loadingHTML;

        // Return a function to stop the loading animation
        return () => {
          element.innerHTML = originalContent;
        };
      }, options);
    },
    [createAnimation]
  );

  const createSuccessAnimation = useCallback(
    (element: HTMLElement, options: AnimationOptions = {}) => {
      return createAnimation(async () => {
        const originalContent = element.innerHTML;
        const checkmark = `
          <div class="flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        `;
        
        element.innerHTML = checkmark;
        element.style.transform = 'scale(0)';
        element.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

        await new Promise<void>(resolve => {
          requestAnimationFrame(() => {
            element.style.transform = 'scale(1)';
            setTimeout(() => {
              element.innerHTML = originalContent;
              element.style.transform = '';
              element.style.transition = '';
              resolve();
            }, 1500);
          });
        });
      }, {
        hapticPattern: 'success',
        soundEffect: 'success',
        ...options
      });
    },
    [createAnimation]
  );

  const createErrorAnimation = useCallback(
    (element: HTMLElement, options: AnimationOptions = {}) => {
      return createAnimation(async () => {
        const originalBackground = element.style.backgroundColor;
        
        // Shake animation
        element.style.animation = 'shake 0.5s ease-in-out';
        element.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';

        await new Promise<void>(resolve => {
          setTimeout(() => {
            element.style.animation = '';
            element.style.backgroundColor = originalBackground;
            resolve();
          }, 500);
        });
      }, {
        hapticPattern: 'error',
        soundEffect: 'error',
        ...options
      });
    },
    [createAnimation]
  );

  const createHoverAnimation = useCallback(
    (element: HTMLElement, options: AnimationOptions = {}) => {
      return createAnimation(async () => {
        element.style.transition = 'transform 0.2s ease-out';
        element.style.transform = 'scale(1.05)';

        const cleanup = () => {
          element.style.transform = 'scale(1)';
        };

        // Return cleanup function
        return cleanup;
      }, {
        hapticPattern: 'selection',
        soundEffect: 'ui_hover',
        ...options
      });
    },
    [createAnimation]
  );

  const createCulturalAnimation = useCallback(
    (element: HTMLElement, pattern: 'mandala' | 'lotus' | 'prayer_flags', options: AnimationOptions = {}) => {
      return createAnimation(async () => {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '10';
        overlay.style.opacity = '0';

        // Add cultural pattern based on type
        switch (pattern) {
          case 'mandala':
            overlay.innerHTML = `
              <svg viewBox="0 0 100 100" class="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(220, 38, 38, 0.3)" stroke-width="1"/>
                <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(245, 158, 11, 0.3)" stroke-width="1"/>
                <circle cx="50" cy="50" r="15" fill="rgba(5, 150, 105, 0.3)"/>
              </svg>
            `;
            break;
          case 'lotus':
            overlay.innerHTML = `
              <svg viewBox="0 0 100 100" class="w-full h-full">
                <g transform="translate(50,50)">
                  <path d="M0,-30 Q-10,-20 -20,-10 Q-10,0 0,0 Q10,0 20,-10 Q10,-20 0,-30" fill="rgba(220, 38, 38, 0.3)"/>
                  <path d="M0,-30 Q-10,-20 -20,-10 Q-10,0 0,0 Q10,0 20,-10 Q10,-20 0,-30" fill="rgba(245, 158, 11, 0.3)" transform="rotate(45)"/>
                  <path d="M0,-30 Q-10,-20 -20,-10 Q-10,0 0,0 Q10,0 20,-10 Q10,-20 0,-30" fill="rgba(5, 150, 105, 0.3)" transform="rotate(90)"/>
                </g>
              </svg>
            `;
            break;
          case 'prayer_flags':
            overlay.innerHTML = `
              <div class="flex justify-center items-center h-full">
                <div class="flex space-x-1">
                  <div class="w-2 h-3 bg-red-500 opacity-30"></div>
                  <div class="w-2 h-3 bg-yellow-500 opacity-30"></div>
                  <div class="w-2 h-3 bg-green-500 opacity-30"></div>
                  <div class="w-2 h-3 bg-blue-500 opacity-30"></div>
                  <div class="w-2 h-3 bg-purple-500 opacity-30"></div>
                </div>
              </div>
            `;
            break;
        }

        const parent = element.parentElement;
        if (parent) {
          parent.style.position = 'relative';
          parent.appendChild(overlay);

          overlay.style.transition = 'opacity 0.5s ease-in-out';
          overlay.style.opacity = '1';

          await new Promise<void>(resolve => {
            setTimeout(() => {
              overlay.style.opacity = '0';
              setTimeout(() => {
                if (parent.contains(overlay)) {
                  parent.removeChild(overlay);
                }
                resolve();
              }, 500);
            }, 2000);
          });
        }
      }, {
        hapticPattern: 'nepali_celebration',
        soundEffect: 'nepali_bell',
        ...options
      });
    },
    [createAnimation]
  );

  // Add CSS for shake animation
  if (typeof document !== 'undefined' && !document.querySelector('#micro-animations-styles')) {
    const style = document.createElement('style');
    style.id = 'micro-animations-styles';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
        20%, 40%, 60%, 80% { transform: translateX(2px); }
      }
    `;
    document.head.appendChild(style);
  }

  return {
    state,
    createAnimation,
    createButtonRipple,
    createLoadingAnimation,
    createSuccessAnimation,
    createErrorAnimation,
    createHoverAnimation,
    createCulturalAnimation,
    isAnimating: state.isAnimating,
    animationCount: state.animationCount,
    queueLength: state.queueLength
  };
}