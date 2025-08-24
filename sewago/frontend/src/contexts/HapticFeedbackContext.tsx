'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HapticPattern {
  id: string;
  name: string;
  description: string;
  pattern: number[]; // Vibration pattern [vibrate, pause, vibrate, pause...]
  category: 'success' | 'error' | 'notification' | 'selection' | 'warning' | 'cultural';
  intensity: number; // 0-100
  duration: number;
  culturalContext?: 'nepali' | 'general';
  accessibility: boolean;
}

interface UserUXPreferences {
  hapticEnabled: boolean;
  hapticIntensity: number;
  soundEnabled: boolean;
  soundVolume: number;
  voiceGuidance: boolean;
  animationsEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  colorTheme: 'auto' | 'light' | 'dark';
  contextualAI: boolean;
  culturalSounds: boolean;
  customPatterns: HapticPattern[];
}

interface HapticFeedbackContextType {
  preferences: UserUXPreferences | null;
  updatePreferences: (preferences: Partial<UserUXPreferences>) => Promise<void>;
  triggerHaptic: (patternName: string, options?: { intensity?: number; culturalContext?: boolean }) => Promise<void>;
  registerCustomPattern: (pattern: HapticPattern) => Promise<void>;
  isHapticSupported: boolean;
  batteryOptimized: boolean;
  deviceCapabilities: DeviceCapabilities;
}

interface DeviceCapabilities {
  hasVibration: boolean;
  hasGamepadHaptics: boolean;
  maxIntensity: number;
  supportedPatterns: string[];
  batteryLevel?: number;
}

const HapticFeedbackContext = createContext<HapticFeedbackContextType | undefined>(undefined);

// Default haptic patterns with Nepali cultural elements
const DEFAULT_PATTERNS: HapticPattern[] = [
  {
    id: 'success',
    name: 'Success',
    description: 'Success feedback pattern',
    pattern: [50, 50, 100],
    category: 'success',
    intensity: 70,
    duration: 200,
    accessibility: true
  },
  {
    id: 'error',
    name: 'Error',
    description: 'Error feedback pattern',
    pattern: [200, 100, 200],
    category: 'error',
    intensity: 80,
    duration: 500,
    accessibility: true
  },
  {
    id: 'notification',
    name: 'Notification',
    description: 'General notification pattern',
    pattern: [100],
    category: 'notification',
    intensity: 50,
    duration: 100,
    accessibility: true
  },
  {
    id: 'selection',
    name: 'Selection',
    description: 'Item selection feedback',
    pattern: [25],
    category: 'selection',
    intensity: 30,
    duration: 25,
    accessibility: true
  },
  {
    id: 'warning',
    name: 'Warning',
    description: 'Warning feedback pattern',
    pattern: [150, 75, 150, 75, 150],
    category: 'warning',
    intensity: 75,
    duration: 600,
    accessibility: true
  },
  {
    id: 'nepali_celebration',
    name: 'Nepali Celebration',
    description: 'Cultural celebration pattern for festivals',
    pattern: [100, 50, 100, 50, 100, 50, 200],
    category: 'cultural',
    intensity: 60,
    duration: 650,
    culturalContext: 'nepali',
    accessibility: false
  },
  {
    id: 'nepali_blessing',
    name: 'Nepali Blessing',
    description: 'Gentle blessing pattern for booking confirmations',
    pattern: [75, 100, 75, 100, 75],
    category: 'cultural',
    intensity: 50,
    duration: 425,
    culturalContext: 'nepali',
    accessibility: false
  }
];

interface HapticFeedbackProviderProps {
  children: ReactNode;
}

export function HapticFeedbackProvider({ children }: HapticFeedbackProviderProps) {
  const [preferences, setPreferences] = useState<UserUXPreferences | null>(null);
  const [patterns, setPatterns] = useState<HapticPattern[]>(DEFAULT_PATTERNS);
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    hasVibration: false,
    hasGamepadHaptics: false,
    maxIntensity: 100,
    supportedPatterns: []
  });
  const [isHapticSupported, setIsHapticSupported] = useState(false);
  const [batteryOptimized, setBatteryOptimized] = useState(false);

  // Initialize device capabilities and preferences
  useEffect(() => {
    initializeCapabilities();
    loadUserPreferences();
    monitorBattery();
  }, []);

  const initializeCapabilities = async () => {
    const capabilities: DeviceCapabilities = {
      hasVibration: 'vibrate' in navigator,
      hasGamepadHaptics: 'getGamepads' in navigator,
      maxIntensity: 100,
      supportedPatterns: []
    };

    // Check for Vibration API support (without triggering vibration)
    if (capabilities.hasVibration) {
      try {
        // Check if the API exists but don't call it yet (requires user interaction)
        if (typeof navigator.vibrate === 'function') {
          capabilities.supportedPatterns.push('basic', 'pattern', 'intensity');
          setIsHapticSupported(true);
        } else {
          capabilities.hasVibration = false;
        }
      } catch (error) {
        console.warn('Vibration API not supported:', error);
        capabilities.hasVibration = false;
      }
    }

    // Check for Gamepad Haptic Actuators API
    if (capabilities.hasGamepadHaptics) {
      const gamepads = navigator.getGamepads();
      const supportedGamepads = gamepads.filter(gamepad => 
        gamepad && gamepad.hapticActuators && gamepad.hapticActuators.length > 0
      );
      if (supportedGamepads.length > 0) {
        capabilities.supportedPatterns.push('gamepad_dual_rumble', 'gamepad_trigger');
      }
    }

    setDeviceCapabilities(capabilities);
  };

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/ux/preferences');
      if (response.ok) {
        const userPrefs = await response.json();
        setPreferences(userPrefs);
        
        // Load custom patterns
        if (userPrefs.customPatterns && userPrefs.customPatterns.length > 0) {
          setPatterns(prev => [...prev, ...userPrefs.customPatterns]);
        }
      } else {
        // Set default preferences
        const defaultPrefs: UserUXPreferences = {
          hapticEnabled: true,
          hapticIntensity: 50,
          soundEnabled: true,
          soundVolume: 70,
          voiceGuidance: false,
          animationsEnabled: true,
          reducedMotion: false,
          highContrast: false,
          colorTheme: 'auto',
          contextualAI: true,
          culturalSounds: true,
          customPatterns: []
        };
        setPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const monitorBattery = async () => {
    if ('getBattery' in navigator) {
      try {
        // @ts-ignore - Battery API types not fully supported
        const battery = await navigator.getBattery();
        const updateBatteryOptimization = () => {
          const batteryLevel = battery.level * 100;
          setBatteryOptimized(batteryLevel < 20 || !battery.charging);
          setDeviceCapabilities(prev => ({ ...prev, batteryLevel }));
        };

        updateBatteryOptimization();
        battery.addEventListener('levelchange', updateBatteryOptimization);
        battery.addEventListener('chargingchange', updateBatteryOptimization);
      } catch (error) {
        console.warn('Battery API not supported:', error);
      }
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserUXPreferences>) => {
    if (!preferences) return;

    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);

    try {
      await fetch('/api/ux/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const triggerHaptic = async (
    patternName: string, 
    options: { intensity?: number; culturalContext?: boolean } = {}
  ) => {
    if (!preferences?.hapticEnabled || !isHapticSupported) return;
    if (batteryOptimized && preferences.hapticIntensity > 30) return;

    const pattern = patterns.find(p => p.name.toLowerCase() === patternName.toLowerCase());
    if (!pattern) {
      console.warn(`Haptic pattern '${patternName}' not found`);
      return;
    }

    // Check cultural context preferences
    if (pattern.culturalContext === 'nepali' && !preferences.culturalSounds) {
      // Use general alternative
      await triggerHaptic('selection', options);
      return;
    }

    // Calculate intensity based on user preferences and options
    const baseIntensity = options.intensity ?? pattern.intensity;
    const userMultiplier = preferences.hapticIntensity / 100;
    const batteryMultiplier = batteryOptimized ? 0.5 : 1;
    const finalIntensity = Math.min(100, baseIntensity * userMultiplier * batteryMultiplier);

    try {
      // Use Vibration API (only after user interaction)
      if (deviceCapabilities.hasVibration && typeof navigator.vibrate === 'function') {
        try {
          const scaledPattern = pattern.pattern.map(duration => 
            Math.round(duration * (finalIntensity / 100))
          );
          await navigator.vibrate(scaledPattern);
        } catch (vibrateError) {
          console.warn('Vibration requires user interaction first:', vibrateError);
          // Silently fail - this is expected behavior
        }
      }

      // Use Gamepad Haptic Actuators if available
      if (deviceCapabilities.hasGamepadHaptics) {
        const gamepads = navigator.getGamepads();
        for (const gamepad of gamepads) {
          if (gamepad && gamepad.hapticActuators) {
            for (const actuator of gamepad.hapticActuators) {
              if (actuator.type === 'dual-rumble') {
                await actuator.playEffect('dual-rumble', {
                  duration: pattern.duration,
                  strongMagnitude: finalIntensity / 100,
                  weakMagnitude: (finalIntensity / 100) * 0.7
                });
              }
            }
          }
        }
      }

      // Log analytics
      await logUXAnalytics('haptic_feedback', `haptic_${patternName}`, pattern.duration, {
        pattern: patternName,
        intensity: finalIntensity,
        culturalContext: pattern.culturalContext,
        batteryOptimized
      });

    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  };

  const registerCustomPattern = async (pattern: HapticPattern) => {
    setPatterns(prev => [...prev, pattern]);
    
    if (preferences) {
      const updatedCustomPatterns = [...(preferences.customPatterns || []), pattern];
      await updatePreferences({ customPatterns: updatedCustomPatterns });
    }
  };

  const logUXAnalytics = async (
    interactionType: string,
    elementId: string,
    duration: number,
    context: any
  ) => {
    try {
      await fetch('/api/ux/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactionType,
          elementId,
          duration,
          context: {
            ...context,
            deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
            screenSize: `${screen.width}x${screen.height}`,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (error) {
      console.error('Error logging UX analytics:', error);
    }
  };

  const contextValue: HapticFeedbackContextType = {
    preferences,
    updatePreferences,
    triggerHaptic,
    registerCustomPattern,
    isHapticSupported,
    batteryOptimized,
    deviceCapabilities
  };

  return (
    <HapticFeedbackContext.Provider value={contextValue}>
      {children}
    </HapticFeedbackContext.Provider>
  );
}

export const useHapticFeedback = () => {
  const context = useContext(HapticFeedbackContext);
  if (!context) {
    throw new Error('useHapticFeedback must be used within a HapticFeedbackProvider');
  }
  return context;
};