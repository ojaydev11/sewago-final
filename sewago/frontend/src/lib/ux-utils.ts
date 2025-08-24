// Utility functions for UX features

import { performanceOptimizer, uxAssetLoader } from './performance-ux';

// Haptic pattern utilities
export interface HapticPattern {
  name: string;
  pattern: number[];
  intensity: number;
  duration: number;
  culturalContext?: 'nepali' | 'general';
}

export class HapticPatternGenerator {
  static createPattern(
    type: 'success' | 'error' | 'warning' | 'selection' | 'notification' | 'cultural',
    options: {
      intensity?: number;
      duration?: number;
      culturalTheme?: boolean;
    } = {}
  ): HapticPattern {
    const { intensity = 50, culturalTheme = false } = options;
    
    const basePatterns = {
      success: [100, 50, 100],
      error: [200, 100, 200, 100, 200],
      warning: [150, 75, 150, 75, 150],
      selection: [50],
      notification: [100],
      cultural: culturalTheme ? [100, 50, 100, 50, 100, 50, 200] : [100]
    };

    const pattern = basePatterns[type];
    const totalDuration = pattern.reduce((sum, duration) => sum + duration, 0);

    return {
      name: `${type}${culturalTheme ? '_nepali' : ''}`,
      pattern: pattern.map(duration => Math.round(duration * (intensity / 100))),
      intensity,
      duration: Math.round(totalDuration * (intensity / 100)),
      culturalContext: culturalTheme ? 'nepali' : 'general'
    };
  }

  static createCustomPattern(
    intervals: number[],
    intensity: number = 50,
    culturalContext?: 'nepali' | 'general'
  ): HapticPattern {
    const scaledPattern = intervals.map(interval => Math.round(interval * (intensity / 100)));
    const duration = scaledPattern.reduce((sum, interval) => sum + interval, 0);

    return {
      name: `custom_${Date.now()}`,
      pattern: scaledPattern,
      intensity,
      duration,
      culturalContext
    };
  }

  static createNepaliCulturalPatterns(): HapticPattern[] {
    return [
      {
        name: 'dashain_drums',
        pattern: [120, 80, 120, 40, 80, 40, 160],
        intensity: 70,
        duration: 640,
        culturalContext: 'nepali'
      },
      {
        name: 'tihar_bells',
        pattern: [40, 60, 40, 60, 40, 60, 80],
        intensity: 55,
        duration: 380,
        culturalContext: 'nepali'
      },
      {
        name: 'prayer_rhythm',
        pattern: [80, 40, 80, 40, 80, 40, 120],
        intensity: 50,
        duration: 480,
        culturalContext: 'nepali'
      },
      {
        name: 'mountain_echo',
        pattern: [60, 120, 60, 120, 60, 120, 180],
        intensity: 45,
        duration: 720,
        culturalContext: 'nepali'
      }
    ];
  }
}

// Sound management utilities
export interface SoundEffect {
  name: string;
  url: string;
  volume: number;
  category: 'ui' | 'notification' | 'success' | 'error' | 'ambient' | 'cultural';
  culturalContext?: 'nepali' | 'general';
}

export class SoundManager {
  private static loadedSounds: Map<string, AudioBuffer> = new Map();
  private static audioContext: AudioContext | null = null;

  static async initializeAudioContext(): Promise<AudioContext | null> {
    if (this.audioContext) return this.audioContext;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      return this.audioContext;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return null;
    }
  }

  static async loadSound(soundEffect: SoundEffect): Promise<AudioBuffer | null> {
    if (this.loadedSounds.has(soundEffect.name)) {
      return this.loadedSounds.get(soundEffect.name)!;
    }

    const audioContext = await this.initializeAudioContext();
    if (!audioContext) return null;

    try {
      const response = await fetch(soundEffect.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      this.loadedSounds.set(soundEffect.name, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load sound ${soundEffect.name}:`, error);
      return null;
    }
  }

  static async playSound(
    soundEffect: SoundEffect, 
    options: {
      volume?: number;
      loop?: boolean;
      fadeIn?: number;
      fadeOut?: number;
      delay?: number;
    } = {}
  ): Promise<void> {
    const audioContext = await this.initializeAudioContext();
    if (!audioContext) return;

    const audioBuffer = await this.loadSound(soundEffect);
    if (!audioBuffer) return;

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = audioBuffer;
    source.loop = options.loop || false;
    
    const volume = (options.volume ?? soundEffect.volume) / 100;
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    
    // Fade in
    if (options.fadeIn) {
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + options.fadeIn / 1000);
    }
    
    // Fade out
    if (options.fadeOut && !options.loop) {
      const fadeStartTime = audioBuffer.duration - (options.fadeOut / 1000);
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime + fadeStartTime);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + audioBuffer.duration);
    }
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const startTime = audioContext.currentTime + (options.delay || 0) / 1000;
    source.start(startTime);
    
    if (!options.loop) {
      source.stop(startTime + audioBuffer.duration);
    }
  }

  static createNepaliSoundEffects(): SoundEffect[] {
    return [
      {
        name: 'nepali_bell',
        url: '/sounds/cultural/nepali_bell.mp3',
        volume: 65,
        category: 'cultural',
        culturalContext: 'nepali'
      },
      {
        name: 'singing_bowl',
        url: '/sounds/cultural/singing_bowl.mp3',
        volume: 55,
        category: 'cultural',
        culturalContext: 'nepali'
      },
      {
        name: 'himalayan_wind',
        url: '/sounds/ambient/himalayan_wind.mp3',
        volume: 40,
        category: 'ambient',
        culturalContext: 'nepali'
      },
      {
        name: 'prayer_chant',
        url: '/sounds/cultural/prayer_chant.mp3',
        volume: 50,
        category: 'cultural',
        culturalContext: 'nepali'
      }
    ];
  }

  static clearCache(): void {
    this.loadedSounds.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Context analysis utilities
export interface ContextData {
  time: {
    hour: number;
    isWorkingHours: boolean;
    isWeekend: boolean;
    nepaliDate: { year: number; month: number; day: number };
  };
  location: {
    city?: string;
    district?: string;
    isUrban: boolean;
    coordinates?: { lat: number; lng: number };
  };
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    battery?: { level: number; charging: boolean };
    connection: 'fast' | 'slow' | 'offline';
    orientation: 'portrait' | 'landscape';
  };
  user: {
    sessionDuration: number;
    interactionPatterns: string[];
    preferredLanguage: 'en' | 'ne';
    culturalPreferences: boolean;
  };
}

export class ContextAnalyzer {
  static analyzeTime(): ContextData['time'] {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    return {
      hour,
      isWorkingHours: hour >= 9 && hour <= 18 && dayOfWeek >= 1 && dayOfWeek <= 5,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      nepaliDate: this.convertToNepaliDate(now)
    };
  }

  static analyzeDevice(): ContextData['device'] {
    const screenWidth = window.innerWidth;
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    
    if (screenWidth <= 768) deviceType = 'mobile';
    else if (screenWidth <= 1024) deviceType = 'tablet';

    return {
      type: deviceType,
      connection: this.analyzeConnection(),
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    };
  }

  static analyzeLocation(
    latitude?: number, 
    longitude?: number
  ): ContextData['location'] {
    if (!latitude || !longitude) {
      return { isUrban: true };
    }

    const nepaliLocation = this.identifyNepaliLocation(latitude, longitude);
    
    return {
      city: nepaliLocation.city,
      district: nepaliLocation.district,
      isUrban: nepaliLocation.isUrban,
      coordinates: { lat: latitude, lng: longitude }
    };
  }

  static generateUIRecommendations(context: ContextData): {
    theme: 'light' | 'dark' | 'auto';
    animations: 'full' | 'reduced' | 'disabled';
    layout: 'compact' | 'comfortable' | 'spacious';
    priority: 'performance' | 'features' | 'accessibility';
    culturalElements: boolean;
  } {
    const recommendations = {
      theme: 'auto' as const,
      animations: 'full' as const,
      layout: 'comfortable' as const,
      priority: 'features' as const,
      culturalElements: context.user.culturalPreferences
    };

    // Time-based recommendations
    if (context.time.hour >= 20 || context.time.hour <= 6) {
      recommendations.theme = 'dark';
    }

    // Device-based recommendations
    if (context.device.type === 'mobile') {
      recommendations.layout = 'compact';
      if (context.device.battery && context.device.battery.level < 20) {
        recommendations.animations = 'reduced';
        recommendations.priority = 'performance';
      }
    }

    // Connection-based recommendations
    if (context.device.connection === 'slow') {
      recommendations.animations = 'reduced';
      recommendations.priority = 'performance';
    }

    // Location-based recommendations
    if (!context.location.isUrban) {
      recommendations.layout = 'spacious';
    }

    // Cultural context
    if (this.isFestivalSeason()) {
      recommendations.culturalElements = true;
    }

    return recommendations;
  }

  private static convertToNepaliDate(date: Date): { year: number; month: number; day: number } {
    // Simplified BS date conversion (in a real implementation, use proper BS calendar library)
    return {
      year: date.getFullYear() + 57,
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  private static analyzeConnection(): 'fast' | 'slow' | 'offline' {
    if (!navigator.onLine) return 'offline';
    
    // @ts-ignore - Connection API types
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      if (connection.effectiveType === '4g' || connection.downlink >= 1.5) {
        return 'fast';
      }
    }
    
    return 'slow';
  }

  private static identifyNepaliLocation(lat: number, lng: number): {
    city: string;
    district: string;
    isUrban: boolean;
  } {
    // Major Nepali cities (simplified coordinates)
    const cities = [
      { name: 'Kathmandu', district: 'Kathmandu', lat: 27.7172, lng: 85.3240, isUrban: true },
      { name: 'Pokhara', district: 'Kaski', lat: 28.2096, lng: 83.9856, isUrban: true },
      { name: 'Lalitpur', district: 'Lalitpur', lat: 27.6588, lng: 85.3247, isUrban: true },
      { name: 'Biratnagar', district: 'Morang', lat: 26.4525, lng: 87.2718, isUrban: true },
      { name: 'Birgunj', district: 'Parsa', lat: 27.0135, lng: 84.8563, isUrban: true }
    ];

    // Find closest city
    let closestCity = cities[0];
    let minDistance = this.calculateDistance(lat, lng, cities[0].lat, cities[0].lng);

    for (const city of cities.slice(1)) {
      const distance = this.calculateDistance(lat, lng, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    // If too far from major cities, assume rural
    if (minDistance > 50) { // 50km threshold
      return {
        city: 'Rural Area',
        district: 'Unknown',
        isUrban: false
      };
    }

    return {
      city: closestCity.name,
      district: closestCity.district,
      isUrban: closestCity.isUrban
    };
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private static isFestivalSeason(): boolean {
    const month = new Date().getMonth();
    // Festival months in Nepal (September-November approximately)
    return month >= 8 && month <= 10;
  }
}

// Animation controller utilities
export class AnimationController {
  private static activeAnimations: Map<string, number> = new Map();
  private static animationQueue: Array<() => Promise<void>> = [];
  private static isProcessing = false;

  static async queueAnimation(id: string, animationFn: () => Promise<void>): Promise<void> {
    if (this.activeAnimations.has(id)) {
      // Cancel existing animation with same ID
      const existingId = this.activeAnimations.get(id)!;
      cancelAnimationFrame(existingId);
    }

    return new Promise((resolve, reject) => {
      this.animationQueue.push(async () => {
        try {
          await animationFn();
          this.activeAnimations.delete(id);
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private static async processQueue(): Promise<void> {
    if (this.isProcessing || this.animationQueue.length === 0) return;

    this.isProcessing = true;
    
    while (this.animationQueue.length > 0) {
      const animationFn = this.animationQueue.shift()!;
      
      try {
        await animationFn();
      } catch (error) {
        console.error('Animation error:', error);
      }

      // Yield to the main thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    this.isProcessing = false;
  }

  static createSpringAnimation(
    element: HTMLElement,
    from: Partial<CSSStyleDeclaration>,
    to: Partial<CSSStyleDeclaration>,
    options: {
      duration?: number;
      stiffness?: number;
      damping?: number;
      onComplete?: () => void;
    } = {}
  ): Promise<void> {
    const { duration = 300, stiffness = 300, damping = 20, onComplete } = options;

    return new Promise((resolve) => {
      const startTime = performance.now();
      const startValues: Record<string, number> = {};
      const endValues: Record<string, number> = {};

      // Parse numeric values
      Object.entries(from).forEach(([key, value]) => {
        if (typeof value === 'string') {
          startValues[key] = parseFloat(value);
        }
      });

      Object.entries(to).forEach(([key, value]) => {
        if (typeof value === 'string') {
          endValues[key] = parseFloat(value);
        }
      });

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Spring physics calculation
        const springProgress = this.easeOutBack(progress);

        Object.keys(endValues).forEach(property => {
          const start = startValues[property] || 0;
          const end = endValues[property];
          const current = start + (end - start) * springProgress;
          
          if (property === 'opacity') {
            element.style.opacity = current.toString();
          } else if (property === 'scale') {
            element.style.transform = `scale(${current})`;
          } else {
            (element.style as any)[property] = `${current}px`;
          }
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onComplete?.();
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  private static easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  static clearActiveAnimations(): void {
    this.activeAnimations.forEach(id => cancelAnimationFrame(id));
    this.activeAnimations.clear();
    this.animationQueue.length = 0;
    this.isProcessing = false;
  }
}

// Accessibility utilities
export class AccessibilityUtils {
  static validateColorContrast(foreground: string, background: string): {
    ratio: number;
    level: 'AAA' | 'AA' | 'fail';
  } {
    const ratio = this.calculateContrastRatio(foreground, background);
    
    let level: 'AAA' | 'AA' | 'fail' = 'fail';
    if (ratio >= 7) level = 'AAA';
    else if (ratio >= 4.5) level = 'AA';

    return { ratio, level };
  }

  private static calculateContrastRatio(hex1: string, hex2: string): number {
    const getLuminance = (hex: string): number => {
      const rgb = parseInt(hex.replace('#', ''), 16);
      const r = (rgb >> 16) & 255;
      const g = (rgb >> 8) & 255;
      const b = rgb & 255;

      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);

    return lum1 > lum2 ? (lum1 + 0.05) / (lum2 + 0.05) : (lum2 + 0.05) / (lum1 + 0.05);
  }

  static announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
}

// Export all utilities
export {
  HapticPatternGenerator,
  SoundManager,
  ContextAnalyzer,
  AnimationController,
  AccessibilityUtils
};