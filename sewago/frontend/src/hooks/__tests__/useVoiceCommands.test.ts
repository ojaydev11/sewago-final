import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceCommands } from '../useVoiceCommands';

// Mock fetch
global.fetch = vi.fn();

// Mock Web Speech API
const mockSpeechRecognition = {
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en',
  onstart: null,
  onresult: null,
  onerror: null,
  onend: null,
};

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: vi.fn(() => mockSpeechRecognition),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: vi.fn(() => mockSpeechRecognition),
});

describe('useVoiceCommands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        intent: 'SEARCH_SERVICE',
        confidence: 0.95,
        response: 'I found some services for you',
        entities: { serviceType: 'cleaning' },
        actions: ['REDIRECT_TO_SEARCH'],
      }),
    });
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => 
      useVoiceCommands({
        userId: 'user123',
        language: 'en',
      })
    );

    expect(result.current.isListening).toBe(false);
    expect(result.current.isSupported).toBe(true);
    expect(result.current.currentTranscript).toBe('');
    expect(result.current.lastCommand).toBeNull();
    expect(result.current.commandHistory).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('detects speech recognition support correctly', () => {
    // Test with supported browser
    const { result } = renderHook(() => 
      useVoiceCommands({ userId: 'user123' })
    );
    
    expect(result.current.isSupported).toBe(true);
  });

  it('starts listening when toggleListening is called', async () => {
    const { result } = renderHook(() => 
      useVoiceCommands({
        userId: 'user123',
        language: 'en',
      })
    );

    await act(async () => {
      result.current.toggleListening();
    });

    expect(mockSpeechRecognition.start).toHaveBeenCalled();
    expect(result.current.isListening).toBe(true);
  });

  it('stops listening when toggleListening is called while listening', async () => {
    const { result } = renderHook(() => 
      useVoiceCommands({
        userId: 'user123',
        language: 'en',
      })
    );

    // Start listening first
    await act(async () => {
      result.current.toggleListening();
    });

    // Then stop
    await act(async () => {
      result.current.toggleListening();
    });

    expect(mockSpeechRecognition.stop).toHaveBeenCalled();
    expect(result.current.isListening).toBe(false);
  });

  it('processes voice command and updates state', async () => {
    const { result } = renderHook(() => 
      useVoiceCommands({
        userId: 'user123',
        language: 'en',
        enableAnalytics: true,
      })
    );

    await act(async () => {
      result.current.processCommand('find house cleaning services');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/ai/voice-process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'find house cleaning services',
        userId: 'user123',
        language: 'en',
        sessionId: expect.any(String),
      }),
    });

    expect(result.current.lastCommand).toEqual({
      transcript: 'find house cleaning services',
      intent: 'SEARCH_SERVICE',
      confidence: 0.95,
      response: 'I found some services for you',
      timestamp: expect.any(Date),
      successful: true,
    });

    expect(result.current.commandHistory).toHaveLength(1);
  });

  it('handles voice recognition results', async () => {
    const { result } = renderHook(() => 
      useVoiceCommands({
        userId: 'user123',
        language: 'en',
      })
    );

    // Start listening
    await act(async () => {
      result.current.toggleListening();
    });

    // Simulate voice recognition result
    const mockEvent = {
      results: [
        [{ transcript: 'book plumber', confidence: 0.9 }]
      ],
      resultIndex: 0,
    };

    await act(async () => {
      if (mockSpeechRecognition.onresult) {
        mockSpeechRecognition.onresult(mockEvent);
      }
    });

    expect(result.current.currentTranscript).toBe('book plumber');
  });

  it('handles voice recognition errors', async () => {
    const { result } = renderHook(() => 
      useVoiceCommands({
        userId: 'user123',
        language: 'en',
      })
    );

    await act(async () => {
      result.current.toggleListening();
    });

    // Simulate voice recognition error
    const mockError = { error: 'not-allowed' };

    await act(async () => {
      if (mockSpeechRecognition.onerror) {
        mockSpeechRecognition.onerror(mockError);
      }
    });

    expect(result.current.error).toEqual({
      type: 'recognition_error',
      message: 'Microphone access denied',
    });
    expect(result.current.isListening).toBe(false);
  });

  it('sets up continuous listening when enabled', () => {
    renderHook(() => 
      useVoiceCommands({
        userId: 'user123',
        language: 'en',
        continuous: true,
      })
    );

    expect(mockSpeechRecognition.continuous).toBe(true);
    expect(mockSpeechRecognition.interimResults).toBe(true);
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => 
      useVoiceCommands({
        userId: 'user123',
        language: 'en',
      })
    );

    await act(async () => {
      result.current.processCommand('test command');
    });

    expect(result.current.error).toEqual({
      type: 'processing_error',
      message: 'Failed to process voice command',
    });

    expect(result.current.commandHistory[0].successful).toBe(false);
  });

  it('clears command history', async () => {
    const { result } = renderHook(() => 
      useVoiceCommands({
        userId: 'user123',
        language: 'en',
      })
    );

    // Add a command first
    await act(async () => {
      result.current.processCommand('test command');
    });

    expect(result.current.commandHistory).toHaveLength(1);

    // Clear history
    await act(async () => {
      result.current.clearHistory();
    });

    expect(result.current.commandHistory).toHaveLength(0);
  });

  it('handles different languages', async () => {
    const { result } = renderHook(() => 
      useVoiceCommands({
        userId: 'user123',
        language: 'ne',
      })
    );

    expect(mockSpeechRecognition.lang).toBe('ne');

    await act(async () => {
      result.current.processCommand('घर सफाई');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/ai/voice-process', 
      expect.objectContaining({
        body: expect.stringContaining('\"language\":\"ne\"'),
      })
    );
  });

  it('maintains command history with correct limit', async () => {
    const { result } = renderHook(() => 
      useVoiceCommands({
        userId: 'user123',
        language: 'en',
      })
    );

    // Add multiple commands (more than typical limit)
    for (let i = 0; i < 15; i++) {
      await act(async () => {
        result.current.processCommand(`command ${i}`);
      });
    }

    // Should maintain only last 10 commands
    expect(result.current.commandHistory).toHaveLength(10);
    expect(result.current.commandHistory[0].transcript).toBe('command 5');
    expect(result.current.commandHistory[9].transcript).toBe('command 14');
  });

  it('calculates success rate correctly', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ intent: 'SUCCESS', confidence: 0.9 }),
      })
      .mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => 
      useVoiceCommands({
        userId: 'user123',
        language: 'en',
      })
    );

    await act(async () => {
      result.current.processCommand('successful command');
    });

    await act(async () => {
      result.current.processCommand('failed command');
    });

    expect(result.current.successRate).toBe(0.5); // 1 out of 2 successful
  });

  it('stops listening on unmount', () => {
    const { result, unmount } = renderHook(() => 
      useVoiceCommands({
        userId: 'user123',
        language: 'en',
      })
    );

    act(() => {
      result.current.toggleListening();
    });

    unmount();

    expect(mockSpeechRecognition.stop).toHaveBeenCalled();
  });
});