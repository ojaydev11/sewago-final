'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Globe,
  Zap,
  Brain,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface VoiceSearchInterfaceProps {
  isActive: boolean;
  onResult: (transcript: string, confidence?: number, intent?: string) => void;
  onClose: () => void;
  language?: 'en' | 'ne';
  userId?: string;
  className?: string;
}

interface VoiceRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
  };
  resultIndex: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => VoiceRecognition;
    webkitSpeechRecognition: new () => VoiceRecognition;
  }
}

export function VoiceSearchInterface({
  isActive,
  onResult,
  onClose,
  language = 'en',
  userId,
  className = ""
}: VoiceSearchInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [voiceSettings, setVoiceSettings] = useState({
    autoSend: true,
    enableFeedback: true,
    sensitivity: 0.8,
    timeout: 5000
  });
  const [sessionData, setSessionData] = useState({
    startTime: Date.now(),
    attempts: 0,
    successRate: 0
  });
  const [aiInsights, setAiInsights] = useState<any>(null);
  
  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (isActive) {
      initializeVoiceRecognition();
      setupAudioVisualization();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isActive, language]);

  const initializeVoiceRecognition = useCallback(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setError(language === 'ne' 
        ? 'तपाईंको ब्राउजरले आवाज पहिचान समर्थन गर्दैन।'
        : 'Your browser doesn\'t support speech recognition.'
      );
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'ne' ? 'ne-NP' : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setSessionData(prev => ({ 
        ...prev, 
        startTime: Date.now(),
        attempts: prev.attempts + 1
      }));
      
      if (voiceSettings.enableFeedback) {
        playFeedbackSound('start');
      }

      // Set timeout for automatic stop
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, voiceSettings.timeout);
    };

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i][0];
        
        if (event.results[i].isFinal) {
          finalTranscript += result.transcript;
          setConfidence(result.confidence);
        } else {
          interimText += result.transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        
        if (voiceSettings.autoSend) {
          await processVoiceCommand(finalTranscript, result.confidence);
        }
      }

      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      const errorMessages = {
        'ne': {
          'network': 'नेटवर्क त्रुटि। इन्टरनेट जडान जाँच गर्नुहोस्।',
          'not-allowed': 'माइक्रोफोन पहुँच अस्वीकृत।',
          'no-speech': 'कुनै आवाज सुनिएन।',
          'audio-capture': 'माइक्रोफोन समस्या।'
        },
        'en': {
          'network': 'Network error. Check your internet connection.',
          'not-allowed': 'Microphone access denied.',
          'no-speech': 'No speech detected.',
          'audio-capture': 'Microphone problem.'
        }
      };

      setError(errorMessages[language][event.error as keyof typeof errorMessages[typeof language]] || 
               (language === 'ne' ? 'आवाज पहिचान त्रुटि।' : 'Speech recognition error.'));
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (voiceSettings.enableFeedback) {
        playFeedbackSound('end');
      }
    };

    recognitionRef.current = recognition;
  }, [language, voiceSettings]);

  const setupAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
    } catch (error) {
      console.error('Failed to setup audio visualization:', error);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceCommand = async (text: string, confidenceScore: number) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/ai/voice-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: text,
          userId,
          language,
          context: {
            sessionId: `voice_${sessionData.startTime}`,
            previousAttempts: sessionData.attempts,
            confidence: confidenceScore
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          setAiInsights(result);
          onResult(text, confidenceScore, result.intent);
          
          // Update success rate
          setSessionData(prev => ({
            ...prev,
            successRate: ((prev.successRate * (prev.attempts - 1)) + 1) / prev.attempts
          }));

          if (voiceSettings.enableFeedback) {
            playFeedbackSound('success');
          }

          // Provide voice feedback if available
          if (result.response && voiceSettings.enableFeedback) {
            speak(result.response);
          }
        } else {
          setError(result.message || (language === 'ne' 
            ? 'आदेश प्रसंस्करणमा त्रुटि।' 
            : 'Error processing command.')
          );
          
          if (voiceSettings.enableFeedback) {
            playFeedbackSound('error');
          }
        }
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      setError(language === 'ne' 
        ? 'सर्भर त्रुटि। फेरि प्रयास गर्नुहोस्।'
        : 'Server error. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ne' ? 'ne-NP' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const playFeedbackSound = (type: 'start' | 'end' | 'success' | 'error') => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const frequencies = {
      start: 800,
      end: 400,
      success: 600,
      error: 300
    };

    oscillator.frequency.value = frequencies[type];
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsListening(false);
    setIsProcessing(false);
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-600 bg-green-100';
    if (conf >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", duration: 0.3 }}
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Mic className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'ne' ? 'आवाज खोज' : 'Voice Search'}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {language === 'ne' 
                  ? 'आवाजमा आफ्नो आदेश भन्नुहोस्'
                  : 'Speak your command clearly'
                }
              </p>
            </div>

            {/* Voice Visualizer */}
            <div className="relative h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              {isListening ? (
                <motion.div
                  className="flex space-x-1"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-blue-500 rounded-full"
                      animate={{ 
                        height: [10, Math.random() * 40 + 10, 10]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.5 + Math.random() * 0.5,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </motion.div>
              ) : (
                <div className="text-gray-400">
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                      <span className="text-sm">
                        {language === 'ne' ? 'प्रसंस्करण...' : 'Processing...'}
                      </span>
                    </div>
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </div>
              )}
            </div>

            {/* Transcript Display */}
            {(transcript || interimTranscript) && (
              <div className="space-y-2">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    {transcript}
                    {interimTranscript && (
                      <span className="text-blue-600 opacity-70">{interimTranscript}</span>
                    )}
                  </p>
                </div>
                
                {confidence > 0 && (
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Confidence</span>
                    <Badge variant="secondary" className={getConfidenceColor(confidence)}>
                      {Math.round(confidence * 100)}%
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* AI Insights */}
            {aiInsights && (
              <div className="bg-green-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    {language === 'ne' ? 'समझियो!' : 'Understood!'}
                  </span>
                </div>
                <p className="text-sm text-green-800">
                  {aiInsights.response}
                </p>
                {aiInsights.followUp && (
                  <p className="text-xs text-green-700 italic">
                    {aiInsights.followUp}
                  </p>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">
                    {language === 'ne' ? 'त्रुटि' : 'Error'}
                  </span>
                </div>
                <p className="text-sm text-red-800 mt-1">{error}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant={isListening ? "destructive" : "default"}
                size="lg"
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className="w-16 h-16 rounded-full"
              >
                {isListening ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTranscript('');
                    setInterimTranscript('');
                    setError(null);
                    setAiInsights(null);
                  }}
                  disabled={isListening || isProcessing}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Select value={language} onValueChange={() => {}}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="ne">नेप</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {sessionData.attempts}
                </div>
                <div className="text-xs text-gray-600">
                  {language === 'ne' ? 'प्रयासहरू' : 'Attempts'}
                </div>
              </div>
              
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {Math.round(sessionData.successRate * 100)}%
                </div>
                <div className="text-xs text-gray-600">
                  {language === 'ne' ? 'सफलता' : 'Success'}
                </div>
              </div>
              
              <div>
                <div className="text-lg font-semibold text-purple-600">
                  {Math.round((Date.now() - sessionData.startTime) / 1000)}s
                </div>
                <div className="text-xs text-gray-600">
                  {language === 'ne' ? 'समय' : 'Time'}
                </div>
              </div>
            </div>

            {/* Quick Settings */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {language === 'ne' ? 'स्वत: पठाउनुहोस्' : 'Auto-send'}
                </span>
                <Switch 
                  checked={voiceSettings.autoSend}
                  onCheckedChange={(checked) => 
                    setVoiceSettings(prev => ({ ...prev, autoSend: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {language === 'ne' ? 'आवाज प्रतिक्रिया' : 'Voice feedback'}
                </span>
                <Switch 
                  checked={voiceSettings.enableFeedback}
                  onCheckedChange={(checked) => 
                    setVoiceSettings(prev => ({ ...prev, enableFeedback: checked }))
                  }
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                {language === 'ne' ? 'बन्द गर्नुहोस्' : 'Close'}
              </Button>
              
              {transcript && !voiceSettings.autoSend && (
                <Button 
                  onClick={() => processVoiceCommand(transcript, confidence)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    language === 'ne' ? 'पठाउनुहोस्' : 'Send'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}