'use client';
import 'client-only';

import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceCommand {
  id: string;
  transcript: string;
  confidence: number;
  timestamp: Date;
  intent?: string;
  success?: boolean;
  response?: string;
}

interface VoiceCommandsConfig {
  language?: 'en' | 'ne';
  continuous?: boolean;
  autoStart?: boolean;
  confidenceThreshold?: number;
  userId?: string;
}

interface UseVoiceCommandsReturn {
  // State
  isListening: boolean;
  isProcessing: boolean;
  isSupported: boolean;
  currentTranscript: string;
  lastCommand: VoiceCommand | null;
  error: string | null;
  
  // Controls
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  processCommand: (transcript: string) => Promise<void>;
  clearError: () => void;
  
  // Settings
  setLanguage: (lang: 'en' | 'ne') => void;
  setConfidenceThreshold: (threshold: number) => void;
  
  // Analytics
  commandHistory: VoiceCommand[];
  successRate: number;
}

export function useVoiceCommands(config: VoiceCommandsConfig = {}): UseVoiceCommandsReturn {
  const {
    language = 'en',
    continuous = false,
    autoStart = false,
    confidenceThreshold = 0.7,
    userId
  } = config;

  // State
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [currentThreshold, setCurrentThreshold] = useState(confidenceThreshold);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const sessionIdRef = useRef(`voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = currentLanguage === 'ne' ? 'ne-NP' : 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      isListeningRef.current = true;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          transcript = result[0].transcript;
          confidence = result[0].confidence;
          break;
        } else {
          setCurrentTranscript(result[0].transcript);
        }
      }

      if (transcript && confidence >= currentThreshold) {
        const command: VoiceCommand = {
          id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          transcript: transcript.trim(),
          confidence,
          timestamp: new Date()
        };

        setLastCommand(command);
        processCommand(transcript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      
      const errorMessages = {
        'network': currentLanguage === 'ne' 
          ? 'नेटवर्क त्रुटि। इन्टरनेट जडान जाँच गर्नुहोस्।'
          : 'Network error. Check your internet connection.',
        'not-allowed': currentLanguage === 'ne' 
          ? 'माइक्रोफोन पहुँच अस्वीकृत। सेटिङमा अनुमति दिनुहोस्।'
          : 'Microphone access denied. Please allow microphone permissions.',
        'no-speech': currentLanguage === 'ne' 
          ? 'कुनै आवाज सुनिएन। फेरि प्रयास गर्नुहोस्।'
          : 'No speech detected. Please try again.',
        'audio-capture': currentLanguage === 'ne' 
          ? 'माइक्रोफोन समस्या। डिभाइस जाँच गर्नुहोस्।'
          : 'Microphone problem. Check your device.',
        'service-not-allowed': currentLanguage === 'ne' 
          ? 'आवाज सेवा उपलब्ध छैन।'
          : 'Speech service not available.',
        'bad-grammar': currentLanguage === 'ne' 
          ? 'आवाज बुझ्न सकिएन।'
          : 'Could not understand the speech.'
      };

      setError(errorMessages[event.error as keyof typeof errorMessages] || 
               (currentLanguage === 'ne' ? 'आवाज पहिचान त्रुटि।' : 'Speech recognition error.'));
      setIsListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      setIsListening(false);
      setCurrentTranscript('');
      isListeningRef.current = false;

      // Restart if continuous mode is enabled and we're still supposed to be listening
      if (continuous && isListeningRef.current) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Failed to restart recognition:', error);
        }
      }
    };

    recognitionRef.current = recognition;

    // Auto-start if requested
    if (autoStart) {
      startListening();
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isSupported, continuous, autoStart, currentLanguage, currentThreshold]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current || isListening) return;

    try {
      recognitionRef.current.start();
      setError(null);
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setError(currentLanguage === 'ne' 
        ? 'आवाज सुन्न सुरु गर्न सकिएन।'
        : 'Could not start listening.');
    }
  }, [isSupported, isListening, currentLanguage]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    isListeningRef.current = false;
    recognitionRef.current.stop();
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const processCommand = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/ai/voice-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcript.trim(),
          userId,
          language: currentLanguage,
          context: {
            sessionId: sessionIdRef.current,
            timestamp: new Date().toISOString(),
            continuous
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const processingTime = Date.now() - startTime;

        const processedCommand: VoiceCommand = {
          id: lastCommand?.id || `cmd_${Date.now()}`,
          transcript,
          confidence: result.confidence || lastCommand?.confidence || 0,
          timestamp: new Date(),
          intent: result.intent,
          success: result.success,
          response: result.response
        };

        setLastCommand(processedCommand);
        setCommandHistory(prev => [processedCommand, ...prev.slice(0, 19)]); // Keep last 20

        // Execute the action if successful
        if (result.success && result.action && result.data) {
          await executeVoiceAction(result.action, result.data);
        }

        return result;
      } else {
        throw new Error('Failed to process voice command');
      }
    } catch (error) {
      console.error('Voice command processing error:', error);
      
      const failedCommand: VoiceCommand = {
        id: lastCommand?.id || `cmd_${Date.now()}`,
        transcript,
        confidence: lastCommand?.confidence || 0,
        timestamp: new Date(),
        success: false,
        response: currentLanguage === 'ne' 
          ? 'आदेश प्रसंस्करणमा त्रुटि भयो।'
          : 'Error processing command.'
      };

      setLastCommand(failedCommand);
      setCommandHistory(prev => [failedCommand, ...prev.slice(0, 19)]);
      
      setError(currentLanguage === 'ne' 
        ? 'आदेश प्रसंस्करणमा त्रुटि भयो।'
        : 'Failed to process command.');
    } finally {
      setIsProcessing(false);
    }
  }, [userId, currentLanguage, continuous, lastCommand]);

  const executeVoiceAction = async (action: string, data: any) => {
    switch (action) {
      case 'navigate':
        if (data.url) {
          window.location.href = data.url;
        }
        break;
      
      case 'search':
        if (data.query) {
          const searchUrl = `/search?q=${encodeURIComponent(data.query)}`;
          window.location.href = searchUrl;
        }
        break;
      
      case 'scroll':
        if (data.direction) {
          const scrollAmount = data.direction === 'up' ? -300 : 300;
          window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        }
        break;
      
      case 'click':
        if (data.selector) {
          const element = document.querySelector(data.selector);
          if (element instanceof HTMLElement) {
            element.click();
          }
        }
        break;
      
      default:
        console.log('Unhandled voice action:', action, data);
    }
  };

  const setLanguage = useCallback((lang: 'en' | 'ne') => {
    setCurrentLanguage(lang);
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang === 'ne' ? 'ne-NP' : 'en-US';
    }
  }, []);

  const setConfidenceThreshold = useCallback((threshold: number) => {
    setCurrentThreshold(Math.max(0, Math.min(1, threshold)));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Calculate success rate
  const successRate = commandHistory.length > 0 
    ? commandHistory.filter(cmd => cmd.success).length / commandHistory.length 
    : 0;

  return {
    // State
    isListening,
    isProcessing,
    isSupported,
    currentTranscript,
    lastCommand,
    error,
    
    // Controls
    startListening,
    stopListening,
    toggleListening,
    processCommand,
    clearError,
    
    // Settings
    setLanguage,
    setConfidenceThreshold,
    
    // Analytics
    commandHistory,
    successRate
  };
}

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;

  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

  abort(): void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: 'network' | 'not-allowed' | 'no-speech' | 'audio-capture' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechGrammarList {
  length: number;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}