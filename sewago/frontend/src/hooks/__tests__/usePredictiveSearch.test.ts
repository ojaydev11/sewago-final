import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePredictiveSearch } from '../usePredictiveSearch';

// Mock fetch
global.fetch = vi.fn();

// Mock useDebounce hook
vi.mock('../useDebounce', () => ({
  useDebounce: vi.fn((value) => value), // Return value immediately for testing
}));

describe('usePredictiveSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        predictions: [
          { text: 'house cleaning', confidence: 0.9, category: 'CLEANING' },
          { text: 'house repairs', confidence: 0.8, category: 'REPAIRS' },
        ],
        corrections: [],
        suggestions: ['plumber', 'electrician', 'cleaner'],
      }),
    });
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
      })
    );

    expect(result.current.query).toBe('');
    expect(result.current.predictions).toEqual([]);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.corrections).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.searchHistory).toEqual([]);
    expect(result.current.sessionId).toBeTruthy();
  });

  it('updates query when setQuery is called', () => {
    const { result } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
      })
    );

    act(() => {
      result.current.setQuery('house cleaning');
    });

    expect(result.current.query).toBe('house cleaning');
  });

  it('fetches predictions when query changes', async () => {
    const { result } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
        enableAnalytics: true,
      })
    );

    await act(async () => {
      result.current.setQuery('house');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/ai/search-predict'),
      expect.objectContaining({
        method: 'GET',
      })
    );

    expect(result.current.predictions).toEqual([
      { text: 'house cleaning', confidence: 0.9, category: 'CLEANING' },
      { text: 'house repairs', confidence: 0.8, category: 'REPAIRS' },
    ]);

    expect(result.current.suggestions).toEqual(['plumber', 'electrician', 'cleaner']);
  });

  it('does not fetch predictions for very short queries', async () => {
    const { result } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
      })
    );

    await act(async () => {
      result.current.setQuery('h');
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('performs search and adds to history', async () => {
    const { result } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
      })
    );

    await act(async () => {
      result.current.performSearch('house cleaning');
    });

    expect(result.current.searchHistory).toContain('house cleaning');
    expect(result.current.query).toBe('house cleaning');
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
      })
    );

    await act(async () => {
      result.current.setQuery('house cleaning');
    });

    expect(result.current.predictions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('clears search history', () => {
    const { result } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
      })
    );

    act(() => {
      result.current.performSearch('test search');
    });

    expect(result.current.searchHistory).toContain('test search');

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.searchHistory).toEqual([]);
  });

  it('tracks search behavior when analytics is enabled', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          predictions: [],
          corrections: [],
          suggestions: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { result } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
        enableAnalytics: true,
      })
    );

    await act(async () => {
      result.current.performSearch('plumber');
    });

    // Should call analytics API
    expect(global.fetch).toHaveBeenCalledWith('/api/ai/search-predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('"query":"plumber"'),
    });
  });

  it('handles corrections when available', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        predictions: [],
        corrections: [
          { original: 'plumer', corrected: 'plumber', confidence: 0.95 },
        ],
        suggestions: [],
      }),
    });

    const { result } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
        enableCorrections: true,
      })
    );

    await act(async () => {
      result.current.setQuery('plumer');
    });

    expect(result.current.corrections).toEqual([
      { original: 'plumer', corrected: 'plumber', confidence: 0.95 },
    ]);
  });

  it('maintains search history with correct limit', async () => {
    const { result } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
      })
    );

    // Add multiple searches (more than typical limit)
    for (let i = 0; i < 15; i++) {
      await act(async () => {
        result.current.performSearch(`search ${i}`);
      });
    }

    // Should maintain only last 10 searches
    expect(result.current.searchHistory).toHaveLength(10);
    expect(result.current.searchHistory[0]).toBe('search 14'); // Most recent first
    expect(result.current.searchHistory[9]).toBe('search 5');
  });

  it('handles location-based searches', async () => {
    const { result } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Pokhara', lat: 28.2096, lng: 83.9856 },
      })
    );

    await act(async () => {
      result.current.setQuery('restaurant');
    });

    const fetchCall = (global.fetch as any).mock.calls[0];
    const url = fetchCall[0];
    
    expect(url).toContain('location=Pokhara');
    expect(url).toContain('lat=28.2096');
    expect(url).toContain('lng=83.9856');
  });

  it('shows loading state during API calls', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as any).mockReturnValue(promise);

    const { result } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
      })
    );

    act(() => {
      result.current.setQuery('house cleaning');
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!({
        ok: true,
        json: async () => ({
          predictions: [],
          corrections: [],
          suggestions: [],
        }),
      });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('does not duplicate search history entries', async () => {
    const { result } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
      })
    );

    await act(async () => {
      result.current.performSearch('plumber');
    });

    await act(async () => {
      result.current.performSearch('plumber'); // Same search again
    });

    // Should only have one instance in history
    const plumberCount = result.current.searchHistory.filter(
      (search) => search === 'plumber'
    ).length;
    
    expect(plumberCount).toBe(1);
  });

  it('generates unique session ID', () => {
    const { result: result1 } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
      })
    );

    const { result: result2 } = renderHook(() => 
      usePredictiveSearch({
        userId: 'user123',
        location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
      })
    );

    expect(result1.current.sessionId).not.toBe(result2.current.sessionId);
    expect(result1.current.sessionId).toBeTruthy();
    expect(result2.current.sessionId).toBeTruthy();
  });
});