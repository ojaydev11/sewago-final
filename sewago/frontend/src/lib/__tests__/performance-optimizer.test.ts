import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  debounce,
  throttle,
  searchCache,
  voiceCache,
  requestDeduplicator,
  createIntersectionObserver,
  optimizeImageUrl,
  shouldReduceFeatures,
  calculateVisibleRange,
  AIPerformanceMonitor,
} from '../performance-optimizer';

describe('Performance Optimizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('test1');
      debouncedFn('test2');
      debouncedFn('test3');

      expect(fn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('test3');
    });

    it('should reset debounce timer on new calls', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('test1');
      
      await new Promise(resolve => setTimeout(resolve, 50));
      debouncedFn('test2');
      
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(fn).not.toHaveBeenCalled();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('test2');
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn('test1');
      throttledFn('test2');
      throttledFn('test3');

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('test1');

      await new Promise(resolve => setTimeout(resolve, 150));
      
      throttledFn('test4');
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith('test4');
    });
  });

  describe('TTL Cache', () => {
    it('should store and retrieve cached values', () => {
      searchCache.set('key1', { data: 'test' });
      
      const result = searchCache.get('key1');
      expect(result).toEqual({ data: 'test' });
    });

    it('should return null for expired entries', async () => {
      searchCache.set('key2', { data: 'test' }, 50); // 50ms TTL
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = searchCache.get('key2');
      expect(result).toBeNull();
    });

    it('should clear all entries', () => {
      searchCache.set('key1', { data: 'test1' });
      searchCache.set('key2', { data: 'test2' });
      
      searchCache.clear();
      
      expect(searchCache.get('key1')).toBeNull();
      expect(searchCache.get('key2')).toBeNull();
    });

    it('should delete specific entries', () => {
      searchCache.set('key1', { data: 'test1' });
      searchCache.set('key2', { data: 'test2' });
      
      searchCache.delete('key1');
      
      expect(searchCache.get('key1')).toBeNull();
      expect(searchCache.get('key2')).toEqual({ data: 'test2' });
    });
  });

  describe('Request Deduplicator', () => {
    it('should deduplicate concurrent requests', async () => {
      const requestFn = vi.fn().mockResolvedValue('result');
      
      const promise1 = requestDeduplicator.deduplicate('key1', requestFn);
      const promise2 = requestDeduplicator.deduplicate('key1', requestFn);
      
      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      expect(requestFn).toHaveBeenCalledTimes(1);
      expect(result1).toBe('result');
      expect(result2).toBe('result');
    });

    it('should not deduplicate different keys', async () => {
      const requestFn = vi.fn().mockResolvedValue('result');
      
      await Promise.all([
        requestDeduplicator.deduplicate('key1', requestFn),
        requestDeduplicator.deduplicate('key2', requestFn),
      ]);
      
      expect(requestFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Intersection Observer', () => {
    it('should create intersection observer with default options', () => {
      const callback = vi.fn();
      
      // Mock IntersectionObserver
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
      
      global.IntersectionObserver = vi.fn(() => mockObserver);
      
      const observer = createIntersectionObserver(callback);
      
      expect(global.IntersectionObserver).toHaveBeenCalledWith(callback, {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
      });
    });

    it('should merge custom options with defaults', () => {
      const callback = vi.fn();
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
      
      global.IntersectionObserver = vi.fn(() => mockObserver);
      
      const observer = createIntersectionObserver(callback, {
        threshold: 0.5,
        rootMargin: '100px',
      });
      
      expect(global.IntersectionObserver).toHaveBeenCalledWith(callback, {
        root: null,
        rootMargin: '100px',
        threshold: 0.5,
      });
    });
  });

  describe('Image Optimization', () => {
    it('should optimize image URLs with parameters', () => {
      const url = 'https://example.com/image.jpg';
      const optimizedUrl = optimizeImageUrl(url, 400, 300, 85);
      
      expect(optimizedUrl).toContain('w=400');
      expect(optimizedUrl).toContain('h=300');
      expect(optimizedUrl).toContain('q=85');
      expect(optimizedUrl).toContain('f=auto');
    });

    it('should handle URLs with existing query parameters', () => {
      const url = 'https://example.com/image.jpg?version=1';
      const optimizedUrl = optimizeImageUrl(url, 400);
      
      expect(optimizedUrl).toContain('version=1');
      expect(optimizedUrl).toContain('w=400');
      expect(optimizedUrl).toContain('&');
    });

    it('should return empty string for falsy URLs', () => {
      expect(optimizeImageUrl('')).toBe('');
      expect(optimizeImageUrl(null as any)).toBe('');
      expect(optimizeImageUrl(undefined as any)).toBe('');
    });

    it('should use default quality when not specified', () => {
      const url = 'https://example.com/image.jpg';
      const optimizedUrl = optimizeImageUrl(url, 400);
      
      expect(optimizedUrl).toContain('q=80');
    });
  });

  describe('Network-aware features', () => {
    it('should detect when to reduce features', () => {
      // Mock navigator.connection
      const mockConnection = {
        effectiveType: 'slow-2g',
        downlink: 0.5,
        rtt: 400,
        saveData: false,
      };
      
      Object.defineProperty(navigator, 'connection', {
        writable: true,
        value: mockConnection,
      });
      
      expect(shouldReduceFeatures()).toBe(true);
    });

    it('should not reduce features on good connections', () => {
      const mockConnection = {
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: false,
      };
      
      Object.defineProperty(navigator, 'connection', {
        writable: true,
        value: mockConnection,
      });
      
      expect(shouldReduceFeatures()).toBe(false);
    });

    it('should reduce features when save data is enabled', () => {
      const mockConnection = {
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: true,
      };
      
      Object.defineProperty(navigator, 'connection', {
        writable: true,
        value: mockConnection,
      });
      
      expect(shouldReduceFeatures()).toBe(true);
    });

    it('should handle missing connection API', () => {
      Object.defineProperty(navigator, 'connection', {
        writable: true,
        value: undefined,
      });
      
      expect(shouldReduceFeatures()).toBe(false);
    });
  });

  describe('Virtual Scrolling', () => {
    it('should calculate visible range correctly', () => {
      const result = calculateVisibleRange(200, 400, 50, 100, 2);
      
      expect(result).toEqual({
        startIndex: 2, // Math.max(0, Math.floor(200/50) - 2)
        endIndex: 12, // Math.min(99, 2 + Math.ceil(400/50) + 2)
        visibleCount: 8, // Math.ceil(400/50)
      });
    });

    it('should handle edge cases', () => {
      const result = calculateVisibleRange(0, 100, 20, 10, 1);
      
      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBeGreaterThanOrEqual(result.startIndex);
    });

    it('should respect total items limit', () => {
      const result = calculateVisibleRange(1000, 400, 50, 10, 2);
      
      expect(result.endIndex).toBeLessThan(10);
    });
  });

  describe('AI Performance Monitor', () => {
    let monitor: AIPerformanceMonitor;

    beforeEach(() => {
      monitor = new AIPerformanceMonitor();
    });

    it('should track timing metrics', () => {
      const endTiming = monitor.startTiming('test-operation');
      
      // Simulate some work
      const duration = endTiming();
      
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThan(0);
    });

    it('should calculate performance metrics', () => {
      const endTiming1 = monitor.startTiming('test-op');
      endTiming1(); // ~0ms
      
      const endTiming2 = monitor.startTiming('test-op');
      endTiming2(); // ~0ms
      
      const metrics = monitor.getMetrics('test-op');
      
      expect(metrics).toHaveProperty('count', 2);
      expect(metrics).toHaveProperty('min');
      expect(metrics).toHaveProperty('max');
      expect(metrics).toHaveProperty('avg');
      expect(metrics).toHaveProperty('p50');
      expect(metrics).toHaveProperty('p90');
      expect(metrics).toHaveProperty('p95');
    });

    it('should return null for non-existent metrics', () => {
      const metrics = monitor.getMetrics('non-existent');
      expect(metrics).toBeNull();
    });

    it('should get all metrics', () => {
      monitor.startTiming('op1')();
      monitor.startTiming('op2')();
      
      const allMetrics = monitor.getAllMetrics();
      
      expect(allMetrics).toHaveProperty('op1');
      expect(allMetrics).toHaveProperty('op2');
    });

    it('should limit stored measurements', () => {
      // Add more than 100 measurements
      for (let i = 0; i < 150; i++) {
        monitor.startTiming('test-op')();
      }
      
      const metrics = monitor.getMetrics('test-op');
      expect(metrics?.count).toBe(100);
    });
  });
});