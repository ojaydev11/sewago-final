'use client';
import 'client-only';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface ContextualData {
  id: string;
  userId: string;
  contextType: 'time' | 'location' | 'device' | 'behavior' | 'weather' | 'cultural';
  contextValue: any;
  uiAdaptations: UIAdaptation[];
  effectiveness?: number;
  timestamp: Date;
}

interface UIAdaptation {
  type: 'theme' | 'layout' | 'content' | 'performance' | 'accessibility' | 'cultural';
  target: string; // CSS selector or component name
  changes: any;
  priority: number;
  conditions: string[];
}

interface ContextualIntelligenceState {
  currentContext: {
    time: TimeContext;
    location: LocationContext;
    device: DeviceContext;
    behavior: BehaviorContext;
    weather?: WeatherContext;
    cultural: CulturalContext;
  };
  activeAdaptations: UIAdaptation[];
  isProcessing: boolean;
}

interface TimeContext {
  hour: number;
  dayOfWeek: number;
  isWorkingHours: boolean;
  isWeekend: boolean;
  timeZone: string;
  nepaliDate: NepaliDate;
}

interface LocationContext {
  latitude?: number;
  longitude?: number;
  city?: string;
  district?: string;
  country: string;
  accuracy?: number;
  isUrban: boolean;
}

interface DeviceContext {
  type: 'mobile' | 'tablet' | 'desktop';
  screenSize: { width: number; height: number };
  orientation: 'portrait' | 'landscape';
  connection: 'slow' | 'fast' | 'offline';
  battery?: BatteryContext;
  capabilities: DeviceCapabilities;
}

interface BehaviorContext {
  sessionDuration: number;
  interactionPatterns: string[];
  preferredFeatures: string[];
  usageFrequency: 'new' | 'occasional' | 'regular' | 'power';
  lastActions: string[];
  errorPatterns: string[];
}

interface WeatherContext {
  condition: string;
  temperature: number;
  humidity: number;
  visibility: number;
  isOutdoorFriendly: boolean;
  nepaliSeason: 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter';
}

interface CulturalContext {
  currentFestival?: string;
  upcomingFestivals: FestivalInfo[];
  culturalPreferences: boolean;
  language: 'en' | 'ne';
  traditionalEvents: string[];
}

interface FestivalInfo {
  name: string;
  nameNe: string;
  date: Date;
  type: 'religious' | 'cultural' | 'national';
  relevantServices: string[];
}

interface BatteryContext {
  level: number;
  charging: boolean;
  optimizationNeeded: boolean;
}

interface DeviceCapabilities {
  hasGPS: boolean;
  hasCamera: boolean;
  hasNotifications: boolean;
  hasVibration: boolean;
  maxConcurrentRequests: number;
}

interface NepaliDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}

interface ContextualIntelligenceContextType {
  state: ContextualIntelligenceState;
  analyzeContext: () => Promise<void>;
  applyAdaptations: (adaptations: UIAdaptation[]) => void;
  registerBehavior: (action: string, context: any) => Promise<void>;
  getRecommendations: () => UIAdaptation[];
  isContextualAIEnabled: boolean;
  updateContextualPreference: (enabled: boolean) => void;
}

const ContextualIntelligenceContext = createContext<ContextualIntelligenceContextType | undefined>(undefined);

interface ContextualIntelligenceProviderProps {
  children: ReactNode;
}

export function ContextualIntelligenceProvider({ children }: ContextualIntelligenceProviderProps) {
  const [state, setState] = useState<ContextualIntelligenceState>({
    currentContext: {
      time: getTimeContext(),
      location: { country: 'Nepal', isUrban: true },
      device: getDeviceContext(),
      behavior: getInitialBehaviorContext(),
      cultural: getCulturalContext()
    },
    activeAdaptations: [],
    isProcessing: false
  });

  const [isContextualAIEnabled, setIsContextualAIEnabled] = useState(true);

  useEffect(() => {
    loadUserPreferences();
    initializeContextTracking();
    
    // Update context periodically
    const intervalId = setInterval(analyzeContext, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, []);

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/ux/preferences');
      if (response.ok) {
        const preferences = await response.json();
        setIsContextualAIEnabled(preferences.contextualAI ?? true);
      }
    } catch (error) {
      console.error('Error loading contextual AI preferences:', error);
    }
  };

  const initializeContextTracking = () => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }
    
    // Track location if available (with proper permissions handling)
    if (navigator.geolocation && typeof navigator.permissions !== 'undefined') {
      // Check geolocation permission first
      navigator.permissions.query({ name: 'geolocation' })
        .then((permissionStatus) => {
          if (permissionStatus.state === 'granted') {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                updateLocationContext(position);
              },
              (error) => {
                console.warn('Geolocation error:', error.message);
              },
              {
                timeout: 10000,
                maximumAge: 60000,
                enableHighAccuracy: false
              }
            );
          } else {
            console.info('Geolocation permission not granted');
          }
        })
        .catch(() => {
          console.info('Permissions API not supported');
        });
    } else if (navigator.geolocation) {
      // Fallback for browsers without permissions API
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocationContext(position);
        },
        (error) => {
          // Silently handle geolocation errors to prevent console spam
          if (error.code !== error.PERMISSION_DENIED) {
            console.warn('Geolocation error:', error.message);
          }
        },
        {
          timeout: 10000,
          maximumAge: 60000,
          enableHighAccuracy: false
        }
      );
    }

    // Track battery status if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        updateBatteryContext(battery);
        
        battery.addEventListener('levelchange', () => updateBatteryContext(battery));
        battery.addEventListener('chargingchange', () => updateBatteryContext(battery));
      });
    }

    // Track network status
    updateNetworkContext();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', updateNetworkContext);
      window.addEventListener('offline', updateNetworkContext);

      // Track screen orientation changes
      window.addEventListener('orientationchange', () => {
        setTimeout(() => updateDeviceContext(), 100);
      });

      // Track window resize
      window.addEventListener('resize', updateDeviceContext);
    }
  };

  const updateLocationContext = (position: GeolocationPosition) => {
    setState(prev => ({
      ...prev,
      currentContext: {
        ...prev.currentContext,
        location: {
          ...prev.currentContext.location,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
      }
    }));

    // Reverse geocoding to get city/district
    reverseGeocode(position.coords.latitude, position.coords.longitude);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // This would use a geocoding service like OpenStreetMap or Google Maps
      // For now, we'll simulate with Nepal-specific logic
      const nepaliLocation = determineNepaliLocation(lat, lng);
      
      setState(prev => ({
        ...prev,
        currentContext: {
          ...prev.currentContext,
          location: {
            ...prev.currentContext.location,
            city: nepaliLocation.city,
            district: nepaliLocation.district,
            isUrban: nepaliLocation.isUrban
          }
        }
      }));
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const determineNepaliLocation = (lat: number, lng: number) => {
    // Simplified Nepal location detection
    if (lat >= 27.6 && lat <= 27.8 && lng >= 85.2 && lng <= 85.4) {
      return { city: 'Kathmandu', district: 'Kathmandu', isUrban: true };
    } else if (lat >= 27.8 && lat <= 28.0 && lng >= 83.9 && lng <= 84.1) {
      return { city: 'Pokhara', district: 'Kaski', isUrban: true };
    } else if (lat >= 26.4 && lat <= 26.6 && lng >= 87.2 && lng <= 87.4) {
      return { city: 'Biratnagar', district: 'Morang', isUrban: true };
    } else {
      return { city: 'Rural Nepal', district: 'Unknown', isUrban: false };
    }
  };

  const updateBatteryContext = (battery: any) => {
    setState(prev => ({
      ...prev,
      currentContext: {
        ...prev.currentContext,
        device: {
          ...prev.currentContext.device,
          battery: {
            level: Math.round(battery.level * 100),
            charging: battery.charging,
            optimizationNeeded: battery.level < 0.2 && !battery.charging
          }
        }
      }
    }));
  };

  const updateNetworkContext = () => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }
    
    // @ts-expect-error - Navigator connection types
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let connectionSpeed: 'slow' | 'fast' | 'offline' = 'fast';

    if (!navigator.onLine) {
      connectionSpeed = 'offline';
    } else if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        connectionSpeed = 'slow';
      } else if (effectiveType === '3g') {
        connectionSpeed = 'fast';
      } else {
        connectionSpeed = 'fast';
      }
    }

    setState(prev => ({
      ...prev,
      currentContext: {
        ...prev.currentContext,
        device: {
          ...prev.currentContext.device,
          connection: connectionSpeed
        }
      }
    }));
  };

  const updateDeviceContext = () => {
    if (typeof window === 'undefined') {
      return;
    }
    
    setState(prev => ({
      ...prev,
      currentContext: {
        ...prev.currentContext,
        device: {
          ...prev.currentContext.device,
          screenSize: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
        }
      }
    }));
  };

  const analyzeContext = useCallback(async () => {
    if (!isContextualAIEnabled) return;

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Update time context
      const timeContext = getTimeContext();
      
      // Fetch weather data if location is available
      let weatherContext;
      if (state.currentContext.location.latitude && state.currentContext.location.longitude) {
        weatherContext = await fetchWeatherContext(
          state.currentContext.location.latitude,
          state.currentContext.location.longitude
        );
      }

      // Update cultural context
      const culturalContext = getCulturalContext();

      // Generate UI adaptations based on context
      const recommendations = await generateContextualAdaptations({
        time: timeContext,
        location: state.currentContext.location,
        device: state.currentContext.device,
        behavior: state.currentContext.behavior,
        weather: weatherContext,
        cultural: culturalContext
      });

      setState(prev => ({
        ...prev,
        currentContext: {
          ...prev.currentContext,
          time: timeContext,
          weather: weatherContext,
          cultural: culturalContext
        },
        activeAdaptations: recommendations,
        isProcessing: false
      }));

      // Apply the adaptations
      applyAdaptations(recommendations);

    } catch (error) {
      console.error('Error analyzing context:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [isContextualAIEnabled, state.currentContext]);

  const generateContextualAdaptations = async (context: any): Promise<UIAdaptation[]> => {
    const adaptations: UIAdaptation[] = [];

    // Time-based adaptations
    if (context.time.hour >= 20 || context.time.hour <= 6) {
      adaptations.push({
        type: 'theme',
        target: 'body',
        changes: { colorScheme: 'dark' },
        priority: 3,
        conditions: ['nightTime']
      });
    }

    // Device-based adaptations
    if (context.device.battery?.optimizationNeeded) {
      adaptations.push({
        type: 'performance',
        target: '.animations',
        changes: { animationsEnabled: false, reducedMotion: true },
        priority: 5,
        conditions: ['lowBattery']
      });
    }

    if (context.device.connection === 'slow') {
      adaptations.push({
        type: 'performance',
        target: '.heavy-content',
        changes: { lazyLoad: true, imageCompression: 'high' },
        priority: 4,
        conditions: ['slowConnection']
      });
    }

    // Location-based adaptations
    if (!context.location.isUrban) {
      adaptations.push({
        type: 'content',
        target: '.service-grid',
        changes: { 
          prioritizeServices: ['agriculture', 'maintenance', 'repair'],
          showRuralSpecific: true 
        },
        priority: 3,
        conditions: ['ruralLocation']
      });
    }

    // Weather-based adaptations
    if (context.weather) {
      if (!context.weather.isOutdoorFriendly) {
        adaptations.push({
          type: 'content',
          target: '.services',
          changes: { 
            prioritizeIndoorServices: true,
            showWeatherAlert: true 
          },
          priority: 2,
          conditions: ['badWeather']
        });
      }

      // Monsoon season adaptations
      if (context.weather.nepaliSeason === 'monsoon') {
        adaptations.push({
          type: 'content',
          target: '.service-recommendations',
          changes: { 
            promoteMonsoonServices: ['waterproofing', 'drainage', 'roofing'],
            showSeasonalTips: true 
          },
          priority: 3,
          conditions: ['monsoonSeason']
        });
      }
    }

    // Cultural adaptations
    if (context.cultural.currentFestival) {
      adaptations.push({
        type: 'cultural',
        target: '.hero, .navbar',
        changes: {
          festivalTheme: context.cultural.currentFestival,
          showFestivalGreeting: true,
          promoteFestivalServices: true
        },
        priority: 4,
        conditions: ['festival']
      });
    }

    // Behavior-based adaptations
    if (context.behavior.usageFrequency === 'new') {
      adaptations.push({
        type: 'content',
        target: '.onboarding',
        changes: {
          showTutorial: true,
          simplifyInterface: true,
          highlightKeyFeatures: true
        },
        priority: 3,
        conditions: ['newUser']
      });
    }

    return adaptations;
  };

  const applyAdaptations = (adaptations: UIAdaptation[]) => {
    adaptations.sort((a, b) => b.priority - a.priority);

    adaptations.forEach(adaptation => {
      try {
        applyUIAdaptation(adaptation);
      } catch (error) {
        console.error('Error applying adaptation:', error);
      }
    });
  };

  const applyUIAdaptation = (adaptation: UIAdaptation) => {
    switch (adaptation.type) {
      case 'theme':
        applyThemeAdaptation(adaptation);
        break;
      case 'performance':
        applyPerformanceAdaptation(adaptation);
        break;
      case 'content':
        applyContentAdaptation(adaptation);
        break;
      case 'cultural':
        applyCulturalAdaptation(adaptation);
        break;
      case 'accessibility':
        applyAccessibilityAdaptation(adaptation);
        break;
    }
  };

  const applyThemeAdaptation = (adaptation: UIAdaptation) => {
    if (typeof document !== 'undefined' && adaptation.changes.colorScheme) {
      document.documentElement.setAttribute('data-theme', adaptation.changes.colorScheme);
    }
  };

  const applyPerformanceAdaptation = (adaptation: UIAdaptation) => {
    if (typeof document !== 'undefined' && adaptation.changes.animationsEnabled === false) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.classList.add('reduced-motion');
    }
  };

  const applyContentAdaptation = (adaptation: UIAdaptation) => {
    // This would typically update a global store or context
    // that components can subscribe to for content changes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('contextualContentUpdate', {
        detail: {
          target: adaptation.target,
          changes: adaptation.changes
        }
      }));
    }
  };

  const applyCulturalAdaptation = (adaptation: UIAdaptation) => {
    if (typeof document !== 'undefined' && adaptation.changes.festivalTheme) {
      document.documentElement.setAttribute('data-festival', adaptation.changes.festivalTheme);
    }
  };

  const applyAccessibilityAdaptation = (adaptation: UIAdaptation) => {
    if (typeof document !== 'undefined' && adaptation.changes.highContrast) {
      document.documentElement.classList.add('high-contrast');
    }
  };

  const registerBehavior = async (action: string, context: any) => {
    if (!isContextualAIEnabled) return;

    try {
      await fetch('/api/ux/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactionType: 'behavior',
          elementId: action,
          duration: context.duration || 0,
          context: {
            ...context,
            currentContext: state.currentContext,
            timestamp: new Date().toISOString()
          },
          deviceType: state.currentContext.device.type,
          screenSize: `${state.currentContext.device.screenSize.width}x${state.currentContext.device.screenSize.height}`
        })
      });

      // Update behavior context
      setState(prev => ({
        ...prev,
        currentContext: {
          ...prev.currentContext,
          behavior: {
            ...prev.currentContext.behavior,
            lastActions: [action, ...prev.currentContext.behavior.lastActions].slice(0, 10)
          }
        }
      }));

    } catch (error) {
      console.error('Error registering behavior:', error);
    }
  };

  const getRecommendations = (): UIAdaptation[] => {
    return state.activeAdaptations;
  };

  const updateContextualPreference = async (enabled: boolean) => {
    setIsContextualAIEnabled(enabled);
    
    try {
      await fetch('/api/ux/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextualAI: enabled })
      });
    } catch (error) {
      console.error('Error updating contextual AI preference:', error);
    }
  };

  const fetchWeatherContext = async (lat: number, lng: number): Promise<WeatherContext | undefined> => {
    try {
      // This would integrate with a weather API
      // For now, we'll simulate weather data
      const mockWeather: WeatherContext = {
        condition: 'partly_cloudy',
        temperature: 25,
        humidity: 70,
        visibility: 10,
        isOutdoorFriendly: true,
        nepaliSeason: getNepaliSeason()
      };
      
      return mockWeather;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return undefined;
    }
  };

  const contextValue: ContextualIntelligenceContextType = {
    state,
    analyzeContext,
    applyAdaptations,
    registerBehavior,
    getRecommendations,
    isContextualAIEnabled,
    updateContextualPreference
  };

  return (
    <ContextualIntelligenceContext.Provider value={contextValue}>
      {children}
    </ContextualIntelligenceContext.Provider>
  );
}

export const useContextualIntelligence = () => {
  const context = useContext(ContextualIntelligenceContext);
  if (!context) {
    throw new Error('useContextualIntelligence must be used within ContextualIntelligenceProvider');
  }
  return context;
};

// Helper functions

function getTimeContext(): TimeContext {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  
  return {
    hour,
    dayOfWeek,
    isWorkingHours: hour >= 9 && hour <= 18 && dayOfWeek >= 1 && dayOfWeek <= 5,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    nepaliDate: convertToNepaliDate(now)
  };
}

function getDeviceContext(): DeviceContext {
  // Default values for SSR
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
  
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (screenWidth <= 768) deviceType = 'mobile';
  else if (screenWidth <= 1024) deviceType = 'tablet';
  
  return {
    type: deviceType,
    screenSize: { width: screenWidth, height: screenHeight },
    orientation: screenWidth > screenHeight ? 'landscape' : 'portrait',
    connection: 'fast',
    capabilities: {
      hasGPS: 'geolocation' in navigator,
      hasCamera: 'mediaDevices' in navigator,
      hasNotifications: 'Notification' in window,
      hasVibration: 'vibrate' in navigator,
      maxConcurrentRequests: 6
    }
  };
}

function getInitialBehaviorContext(): BehaviorContext {
  return {
    sessionDuration: 0,
    interactionPatterns: [],
    preferredFeatures: [],
    usageFrequency: 'new',
    lastActions: [],
    errorPatterns: []
  };
}

function getCulturalContext(): CulturalContext {
  const now = new Date();
  const festivals = getNepaliFetivals(now);
  
  return {
    currentFestival: getCurrentFestival(festivals),
    upcomingFestivals: getUpcomingFestivals(festivals),
    culturalPreferences: true,
    language: 'en',
    traditionalEvents: []
  };
}

function convertToNepaliDate(date: Date): NepaliDate {
  // Simplified BS date conversion
  const year = date.getFullYear() + 57;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const nepaliMonths = [
    'बैशाख', 'जेष्ठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];
  
  return {
    year,
    month,
    day,
    monthName: nepaliMonths[month - 1] || 'unknown'
  };
}

function getNepaliSeason(): 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter' {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 6) return 'summer';
  if (month >= 7 && month <= 9) return 'monsoon';
  if (month >= 10 && month <= 11) return 'autumn';
  return 'winter';
}

function getNepaliFetivals(date: Date): FestivalInfo[] {
  // Simplified festival calendar
  const festivals: FestivalInfo[] = [
    {
      name: 'Dashain',
      nameNe: 'दशैं',
      date: new Date(date.getFullYear(), 9, 15), // October 15th (approximate)
      type: 'religious',
      relevantServices: ['cleaning', 'decoration', 'catering']
    },
    {
      name: 'Tihar',
      nameNe: 'तिहार',
      date: new Date(date.getFullYear(), 10, 10), // November 10th (approximate)
      type: 'cultural',
      relevantServices: ['decoration', 'lighting', 'cleaning']
    }
  ];
  
  return festivals;
}

function getCurrentFestival(festivals: FestivalInfo[]): string | undefined {
  const now = new Date();
  const today = now.toDateString();
  
  return festivals.find(festival => 
    Math.abs(festival.date.getTime() - now.getTime()) <= 7 * 24 * 60 * 60 * 1000
  )?.name;
}

function getUpcomingFestivals(festivals: FestivalInfo[]): FestivalInfo[] {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  return festivals.filter(festival => 
    festival.date > now && festival.date <= thirtyDaysFromNow
  );
}