// Performance optimization utilities for UX features

interface PerformanceConfig {
  maxConcurrentAnimations: number;
  lowBatteryThreshold: number;
  slowConnectionThreshold: number;
  memoryThreshold: number;
  renderBudget: number; // ms per frame
}

interface DeviceCapabilities {
  battery?: {
    level: number;
    charging: boolean;
  };
  memory?: {
    jsHeapSizeLimit: number;
    usedJSHeapSize: number;
  };
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  cores: number;
  ram: number;
}

class PerformanceUXOptimizer {
  private config: PerformanceConfig;
  private deviceCapabilities: DeviceCapabilities;
  private animationQueue: Array<() => Promise<void>>;
  private isProcessing: boolean;
  private frameId: number | null;
  private lastFrameTime: number;

  constructor(config?: Partial<PerformanceConfig>) {
    this.config = {
      maxConcurrentAnimations: 3,
      lowBatteryThreshold: 20,
      slowConnectionThreshold: 500, // kbps
      memoryThreshold: 0.8, // 80% of available memory
      renderBudget: 16.67, // 60fps = ~16.67ms per frame
      ...config
    };

    this.animationQueue = [];
    this.isProcessing = false;
    this.frameId = null;
    this.lastFrameTime = performance.now();
    this.deviceCapabilities = this.detectDeviceCapabilities();

    this.initializeMonitoring();
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const capabilities: DeviceCapabilities = {
      cores: navigator.hardwareConcurrency || 4,
      ram: (performance as any).memory?.jsHeapSizeLimit ? 
        Math.round((performance as any).memory.jsHeapSizeLimit / (1024 * 1024 * 1024)) : 4
    };

    // Battery API
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery: any) => {
        capabilities.battery = {
          level: Math.round(battery.level * 100),
          charging: battery.charging
        };
      });
    }

    // Memory API
    if ((performance as any).memory) {
      capabilities.memory = {
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize
      };
    }

    // Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      capabilities.connection = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      };
    }

    return capabilities;
  }

  private initializeMonitoring(): void {
    // Monitor frame rate
    this.monitorFrameRate();

    // Monitor memory usage
    setInterval(() => {
      this.updateMemoryInfo();
    }, 5000);

    // Monitor battery status
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery: any) => {
        const updateBattery = () => {
          if (this.deviceCapabilities.battery) {
            this.deviceCapabilities.battery.level = Math.round(battery.level * 100);
            this.deviceCapabilities.battery.charging = battery.charging;
          }
        };

        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      });
    }
  }

  private monitorFrameRate(): void {
    const measureFrame = (currentTime: number) => {
      const frameDuration = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;

      // If frame took too long, adjust animation quality
      if (frameDuration > this.config.renderBudget * 2) {
        this.adjustAnimationQuality('reduce');
      } else if (frameDuration < this.config.renderBudget * 0.8) {
        this.adjustAnimationQuality('restore');
      }

      this.frameId = requestAnimationFrame(measureFrame);
    };

    this.frameId = requestAnimationFrame(measureFrame);
  }

  private updateMemoryInfo(): void {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      this.deviceCapabilities.memory = {
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usedJSHeapSize: memory.usedJSHeapSize
      };

      // Check if memory usage is high
      const memoryUsageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      if (memoryUsageRatio > this.config.memoryThreshold) {
        this.optimizeMemoryUsage();
      }
    }
  }

  private adjustAnimationQuality(direction: 'reduce' | 'restore'): void {
    const root = document.documentElement;
    
    if (direction === 'reduce') {
      root.style.setProperty('--animation-duration-scale', '0.5');
      root.style.setProperty('--animation-quality', 'low');
      root.classList.add('reduced-animations');
    } else {
      root.style.setProperty('--animation-duration-scale', '1');
      root.style.setProperty('--animation-quality', 'high');
      root.classList.remove('reduced-animations');
    }
  }

  private optimizeMemoryUsage(): void {
    // Clear cached audio buffers that haven't been used recently
    this.clearUnusedAudioBuffers();
    
    // Reduce haptic pattern cache
    this.clearHapticPatternCache();
    
    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }

  private clearUnusedAudioBuffers(): void {
    // This would integrate with the AudioFeedbackContext to clear cached sounds
    window.dispatchEvent(new CustomEvent('clearUnusedAudioCache'));
  }

  private clearHapticPatternCache(): void {
    // This would integrate with the HapticFeedbackContext to clear cached patterns
    window.dispatchEvent(new CustomEvent('clearHapticPatternCache'));
  }

  public shouldOptimizeForBattery(): boolean {
    return this.deviceCapabilities.battery ? 
      this.deviceCapabilities.battery.level < this.config.lowBatteryThreshold && 
      !this.deviceCapabilities.battery.charging : false;
  }

  public shouldOptimizeForConnection(): boolean {
    return this.deviceCapabilities.connection ?
      this.deviceCapabilities.connection.downlink < (this.config.slowConnectionThreshold / 1000) : false;
  }

  public shouldOptimizeForMemory(): boolean {
    if (!this.deviceCapabilities.memory) return false;
    
    const usageRatio = this.deviceCapabilities.memory.usedJSHeapSize / 
                      this.deviceCapabilities.memory.jsHeapSizeLimit;
    return usageRatio > this.config.memoryThreshold;
  }

  public shouldOptimizeForCPU(): boolean {
    return this.deviceCapabilities.cores < 4;
  }

  public getOptimizationRecommendations(): {
    animations: 'disable' | 'reduce' | 'normal';
    hapticIntensity: number;
    audioQuality: 'low' | 'medium' | 'high';
    contextualAI: boolean;
  } {
    const recommendations = {
      animations: 'normal' as const,
      hapticIntensity: 100,
      audioQuality: 'high' as const,
      contextualAI: true
    };

    // Battery optimizations
    if (this.shouldOptimizeForBattery()) {
      recommendations.animations = 'reduce';
      recommendations.hapticIntensity = 50;
      recommendations.audioQuality = 'medium';
    }

    // Connection optimizations
    if (this.shouldOptimizeForConnection()) {
      recommendations.audioQuality = 'low';
      recommendations.contextualAI = false;
    }

    // Memory optimizations
    if (this.shouldOptimizeForMemory()) {
      recommendations.animations = 'reduce';
      recommendations.contextualAI = false;
    }

    // CPU optimizations
    if (this.shouldOptimizeForCPU()) {
      recommendations.animations = 'disable';
      recommendations.hapticIntensity = 30;
      recommendations.contextualAI = false;
    }

    return recommendations;
  }

  public queueAnimation(animationFn: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.animationQueue.push(async () => {
        try {
          await animationFn();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      if (!this.isProcessing) {
        this.processAnimationQueue();
      }
    });
  }

  private async processAnimationQueue(): Promise<void> {
    if (this.isProcessing || this.animationQueue.length === 0) return;

    this.isProcessing = true;
    
    const maxConcurrent = this.shouldOptimizeForCPU() ? 1 : this.config.maxConcurrentAnimations;
    
    while (this.animationQueue.length > 0) {
      const batch = this.animationQueue.splice(0, maxConcurrent);
      
      try {
        await Promise.all(batch.map(fn => fn()));
      } catch (error) {
        console.error('Animation batch error:', error);
      }

      // Yield to the main thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    this.isProcessing = false;
  }

  public getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  public updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public destroy(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }
}

// Lazy loading utilities for UX assets
export class UXAssetLoader {
  private static instance: UXAssetLoader;
  private loadedAssets: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  static getInstance(): UXAssetLoader {
    if (!UXAssetLoader.instance) {
      UXAssetLoader.instance = new UXAssetLoader();
    }
    return UXAssetLoader.instance;
  }

  async loadHapticPattern(patternName: string): Promise<any> {
    if (this.loadedAssets.has(patternName)) {
      return this.loadedAssets.get(patternName);
    }

    if (this.loadingPromises.has(patternName)) {
      return this.loadingPromises.get(patternName);
    }

    const loadPromise = this.fetchHapticPattern(patternName);
    this.loadingPromises.set(patternName, loadPromise);

    try {
      const pattern = await loadPromise;
      this.loadedAssets.set(patternName, pattern);
      return pattern;
    } finally {
      this.loadingPromises.delete(patternName);
    }
  }

  async loadSoundAsset(soundName: string, priority: 'low' | 'high' = 'low'): Promise<AudioBuffer | null> {
    if (this.loadedAssets.has(soundName)) {
      return this.loadedAssets.get(soundName);
    }

    if (this.loadingPromises.has(soundName)) {
      return this.loadingPromises.get(soundName);
    }

    const loadPromise = this.fetchSoundAsset(soundName, priority);
    this.loadingPromises.set(soundName, loadPromise);

    try {
      const audioBuffer = await loadPromise;
      this.loadedAssets.set(soundName, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load sound asset ${soundName}:`, error);
      return null;
    } finally {
      this.loadingPromises.delete(soundName);
    }
  }

  private async fetchHapticPattern(patternName: string): Promise<any> {
    const response = await fetch(`/api/ux/haptic-patterns?name=${patternName}`);
    if (!response.ok) {
      throw new Error(`Failed to load haptic pattern: ${patternName}`);
    }
    return response.json();
  }

  private async fetchSoundAsset(soundName: string, priority: 'low' | 'high'): Promise<AudioBuffer | null> {
    const optimizer = PerformanceUXOptimizer.getInstance();
    
    // Skip loading if optimizing for connection and it's low priority
    if (optimizer.shouldOptimizeForConnection() && priority === 'low') {
      return null;
    }

    try {
      const response = await fetch(`/api/ux/sound-library?name=${soundName}`);
      if (!response.ok) {
        throw new Error(`Failed to load sound asset: ${soundName}`);
      }

      const soundData = await response.json();
      const audioResponse = await fetch(soundData.fileUrl);
      const arrayBuffer = await audioResponse.arrayBuffer();

      // Create AudioContext if available
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        return null;
      }

      const audioContext = new AudioContext();
      return await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error(`Error loading sound asset ${soundName}:`, error);
      return null;
    }
  }

  preloadCriticalAssets(): Promise<void[]> {
    const criticalSounds = ['ui_click', 'ui_hover', 'success', 'error'];
    const criticalPatterns = ['selection', 'success', 'error'];

    const soundPromises = criticalSounds.map(sound => 
      this.loadSoundAsset(sound, 'high').catch(() => null)
    );
    
    const patternPromises = criticalPatterns.map(pattern => 
      this.loadHapticPattern(pattern).catch(() => null)
    );

    return Promise.all([...soundPromises, ...patternPromises]);
  }

  clearUnusedAssets(lastUsedThreshold: number = 300000): void { // 5 minutes
    const now = Date.now();
    const assetsToRemove: string[] = [];

    for (const [key, asset] of this.loadedAssets) {
      if (asset.lastUsed && now - asset.lastUsed > lastUsedThreshold) {
        assetsToRemove.push(key);
      }
    }

    assetsToRemove.forEach(key => {
      this.loadedAssets.delete(key);
    });
  }

  getLoadedAssets(): string[] {
    return Array.from(this.loadedAssets.keys());
  }
}

// Battery-aware feature controller
export class BatteryAwareController {
  private batteryStatus: { level: number; charging: boolean } | null = null;
  private listeners: Array<(optimized: boolean) => void> = [];

  constructor() {
    this.initializeBatteryMonitoring();
  }

  private async initializeBatteryMonitoring(): Promise<void> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        this.batteryStatus = {
          level: Math.round(battery.level * 100),
          charging: battery.charging
        };

        battery.addEventListener('levelchange', () => {
          this.batteryStatus!.level = Math.round(battery.level * 100);
          this.notifyListeners();
        });

        battery.addEventListener('chargingchange', () => {
          this.batteryStatus!.charging = battery.charging;
          this.notifyListeners();
        });

        this.notifyListeners();
      } catch (error) {
        console.warn('Battery API not available:', error);
      }
    }
  }

  private notifyListeners(): void {
    const shouldOptimize = this.shouldOptimizeForBattery();
    this.listeners.forEach(listener => listener(shouldOptimize));
  }

  public shouldOptimizeForBattery(): boolean {
    if (!this.batteryStatus) return false;
    return this.batteryStatus.level < 20 && !this.batteryStatus.charging;
  }

  public onBatteryStatusChange(callback: (optimized: boolean) => void): () => void {
    this.listeners.push(callback);
    
    // Call immediately with current status
    if (this.batteryStatus) {
      callback(this.shouldOptimizeForBattery());
    }

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getBatteryStatus(): { level: number; charging: boolean } | null {
    return this.batteryStatus ? { ...this.batteryStatus } : null;
  }
}

// Singleton instances
export const performanceOptimizer = new PerformanceUXOptimizer();
export const uxAssetLoader = UXAssetLoader.getInstance();
export const batteryController = new BatteryAwareController();

// React hooks for performance optimization
export function usePerformanceOptimization() {
  return {
    optimizer: performanceOptimizer,
    assetLoader: uxAssetLoader,
    batteryController,
    recommendations: performanceOptimizer.getOptimizationRecommendations()
  };
}