'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Brain,
  Zap,
  Command,
  MessageSquare,
  Navigation,
  Search,
  Calendar,
  ShoppingCart,
  Settings,
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Volume2,
  Pause,
  Play,
  SkipForward
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface VoiceCommand {
  id: string;
  command: string;
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  timestamp: Date;
  response?: string;
  action?: string;
  success: boolean;
  processingTime?: number;
}

interface VoiceCommandProcessorProps {
  userId?: string;
  onCommandExecuted?: (command: VoiceCommand) => void;
  enableContinuousListening?: boolean;
  language?: 'en' | 'ne';
  className?: string;
}

export function VoiceCommandProcessor({
  userId,
  onCommandExecuted,
  enableContinuousListening = false,
  language = 'en',
  className = ""
}: VoiceCommandProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<VoiceCommand | null>(null);
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const [availableCommands, setAvailableCommands] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState({
    isActive: false,
    confidence: 0,
    lastActivity: null as Date | null,
    totalCommands: 0,
    successRate: 0
  });
  const [voiceResponse, setVoiceResponse] = useState<string | null>(null);
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);

  useEffect(() => {
    loadAvailableCommands();
    if (enableContinuousListening) {
      initializeContinuousListening();
    }
  }, [language, enableContinuousListening]);

  const loadAvailableCommands = async () => {
    try {
      const response = await fetch(`/api/voice/commands?language=${language}`);
      if (response.ok) {
        const commands = await response.json();
        setAvailableCommands(commands);
      }
    } catch (error) {
      console.error('Failed to load voice commands:', error);
    }
  };

  const initializeContinuousListening = () => {
    // This would set up continuous voice monitoring
    setSystemStatus(prev => ({ ...prev, isActive: true }));
  };

  const processVoiceCommand = async (transcript: string, confidence: number = 0.8) => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newCommand: VoiceCommand = {
      id: commandId,
      command: transcript,
      intent: 'unknown',
      confidence,
      entities: {},
      timestamp: new Date(),
      success: false
    };

    setCurrentCommand(newCommand);

    try {
      const startTime = Date.now();
      
      const response = await fetch('/api/ai/voice-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          userId,
          language,
          context: {
            sessionId: `processor_${Date.now()}`,
            enabledFeatures: ['search', 'booking', 'navigation', 'help']
          }
        }),
      });

      const processingTime = Date.now() - startTime;

      if (response.ok) {
        const result = await response.json();
        
        const processedCommand: VoiceCommand = {
          ...newCommand,
          intent: result.intent,
          entities: result.entities || {},
          response: result.response,
          action: result.action,
          success: result.success,
          processingTime,
          confidence: result.confidence || confidence
        };

        setCurrentCommand(processedCommand);
        addToHistory(processedCommand);
        
        if (result.success) {
          await executeCommandAction(processedCommand, result);
          
          if (result.response) {
            setVoiceResponse(result.response);
            if (enableContinuousListening) {
              await speakResponse(result.response);
            }
          }
          
          toast.success(language === 'ne' 
            ? 'आदेश सफल भयो'
            : 'Command executed successfully'
          );
        } else {
          toast.error(result.message || (language === 'ne' 
            ? 'आदेश असफल भयो'
            : 'Command failed'
          ));
        }

        updateSystemStatus(processedCommand);
        
        if (onCommandExecuted) {
          onCommandExecuted(processedCommand);
        }
      }
    } catch (error) {
      console.error('Voice command processing error:', error);
      
      const failedCommand: VoiceCommand = {
        ...newCommand,
        success: false,
        response: language === 'ne' 
          ? 'आदेश प्रसंस्करणमा त्रुटि भयो'
          : 'Error processing command'
      };
      
      setCurrentCommand(failedCommand);
      addToHistory(failedCommand);
      
      toast.error(language === 'ne' 
        ? 'सिस्टम त्रुटि'
        : 'System error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const executeCommandAction = async (command: VoiceCommand, result: any) => {
    switch (result.action) {
      case 'navigate':
        if (result.data?.url) {
          window.location.href = result.data.url;
        }
        break;
        
      case 'search':
        if (result.data?.query) {
          window.location.href = `/search?q=${encodeURIComponent(result.data.query)}`;
        }
        break;
        
      case 'booking':
        if (result.data?.service) {
          window.location.href = `/services/${result.data.service}/book`;
        }
        break;
        
      case 'info':
        // Display information in UI
        break;
        
      default:
        // No specific action required
        break;
    }
  };

  const addToHistory = (command: VoiceCommand) => {
    setCommandHistory(prev => [command, ...prev.slice(0, 19)]); // Keep last 20 commands
  };

  const updateSystemStatus = (command: VoiceCommand) => {
    setSystemStatus(prev => {
      const newTotal = prev.totalCommands + 1;
      const successCount = commandHistory.filter(c => c.success).length + (command.success ? 1 : 0);
      const newSuccessRate = successCount / newTotal;

      return {
        ...prev,
        lastActivity: command.timestamp,
        totalCommands: newTotal,
        successRate: newSuccessRate,
        confidence: command.confidence
      };
    });
  };

  const speakResponse = async (text: string) => {
    if (!('speechSynthesis' in window)) return;

    setIsPlayingResponse(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ne' ? 'ne-NP' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    utterance.onend = () => {
      setIsPlayingResponse(false);
    };

    utterance.onerror = () => {
      setIsPlayingResponse(false);
    };

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsPlayingResponse(false);
  };

  const getCommandIcon = (intent: string) => {
    const iconMap = {
      'search': Search,
      'book': Calendar,
      'navigate': Navigation,
      'query': HelpCircle,
      'cancel': XCircle,
      'help': HelpCircle,
      'settings': Settings,
      'cart': ShoppingCart,
      'unknown': MessageSquare
    };
    
    const IconComponent = iconMap[intent as keyof typeof iconMap] || MessageSquare;
    return <IconComponent className="h-4 w-4" />;
  };

  const getIntentColor = (intent: string, success: boolean) => {
    if (!success) return 'text-red-600 bg-red-100';
    
    const colorMap = {
      'search': 'text-blue-600 bg-blue-100',
      'book': 'text-green-600 bg-green-100',
      'navigate': 'text-purple-600 bg-purple-100',
      'query': 'text-orange-600 bg-orange-100',
      'help': 'text-indigo-600 bg-indigo-100',
      'unknown': 'text-gray-600 bg-gray-100'
    };
    
    return colorMap[intent as keyof typeof colorMap] || 'text-gray-600 bg-gray-100';
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString(language === 'ne' ? 'ne-NP' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* System Status */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Brain className="h-5 w-5" />
            <span>{language === 'ne' ? 'आवाज प्रसंस्करक' : 'Voice Command Processor'}</span>
            <Badge variant={systemStatus.isActive ? 'default' : 'secondary'} className="ml-auto">
              {systemStatus.isActive 
                ? (language === 'ne' ? 'सक्रिय' : 'Active')
                : (language === 'ne' ? 'निष्क्रिय' : 'Inactive')
              }
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemStatus.totalCommands}
              </div>
              <div className="text-xs text-gray-600">
                {language === 'ne' ? 'कुल आदेशहरू' : 'Total Commands'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(systemStatus.successRate * 100)}%
              </div>
              <div className="text-xs text-gray-600">
                {language === 'ne' ? 'सफलता दर' : 'Success Rate'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(systemStatus.confidence * 100)}%
              </div>
              <div className="text-xs text-gray-600">
                {language === 'ne' ? 'आत्मविश्वास' : 'Confidence'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {systemStatus.lastActivity 
                  ? formatTimestamp(systemStatus.lastActivity).split(':').slice(0, 2).join(':')
                  : '--:--'
                }
              </div>
              <div className="text-xs text-gray-600">
                {language === 'ne' ? 'अन्तिम गतिविधि' : 'Last Activity'}
              </div>
            </div>
          </div>
          
          {systemStatus.successRate > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {language === 'ne' ? 'प्रदर्शन मेट्रिक्स' : 'Performance Metrics'}
                </span>
                <span className={systemStatus.successRate >= 0.8 ? 'text-green-600' : systemStatus.successRate >= 0.6 ? 'text-yellow-600' : 'text-red-600'}>
                  {systemStatus.successRate >= 0.8 
                    ? (language === 'ne' ? 'उत्कृष्ट' : 'Excellent')
                    : systemStatus.successRate >= 0.6 
                    ? (language === 'ne' ? 'राम्रो' : 'Good')
                    : (language === 'ne' ? 'सुधार आवश्यक' : 'Needs Improvement')
                  }
                </span>
              </div>
              <Progress value={systemStatus.successRate * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Command Processing */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-800">
                      {language === 'ne' ? 'आदेश प्रसंस्करण गर्दै...' : 'Processing command...'}
                    </h4>
                    {currentCommand && (
                      <p className="text-sm text-yellow-700 mt-1">
                        "{currentCommand.command}"
                      </p>
                    )}
                  </div>
                  <Zap className="h-5 w-5 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Response */}
      <AnimatePresence>
        {voiceResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {isPlayingResponse ? (
                      <Volume2 className="h-5 w-5 text-green-600 animate-pulse" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800">
                      {language === 'ne' ? 'सिस्टम प्रतिक्रिया' : 'System Response'}
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      {voiceResponse}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {isPlayingResponse ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={stopSpeaking}
                        className="h-8"
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => speakResponse(voiceResponse)}
                        className="h-8"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVoiceResponse(null)}
                      className="h-8"
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command History */}
      {commandHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Command className="h-5 w-5 text-gray-600" />
              <span>{language === 'ne' ? 'आदेश इतिहास' : 'Command History'}</span>
              <Badge variant="secondary" className="ml-auto">
                {commandHistory.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {commandHistory.map((command, index) => (
              <motion.div
                key={command.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${
                  command.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getCommandIcon(command.intent)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 truncate">
                      {command.command}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getIntentColor(command.intent, command.success)}`}
                    >
                      {command.intent}
                    </Badge>
                  </div>
                  
                  {command.response && (
                    <p className="text-sm text-gray-600 mb-2">
                      {command.response}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>{formatTimestamp(command.timestamp)}</span>
                    <span>
                      {Math.round(command.confidence * 100)}% confidence
                    </span>
                    {command.processingTime && (
                      <span>{command.processingTime}ms</span>
                    )}
                    <div className="flex items-center space-x-1">
                      {command.success ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-600" />
                      )}
                      <span>{command.success 
                        ? (language === 'ne' ? 'सफल' : 'Success')
                        : (language === 'ne' ? 'असफल' : 'Failed')
                      }</span>
                    </div>
                  </div>
                  
                  {Object.keys(command.entities).length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">
                        {language === 'ne' ? 'निकालिएका तत्वहरू:' : 'Extracted entities:'}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(command.entities).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Commands Reference */}
      {availableCommands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-gray-600" />
              <span>{language === 'ne' ? 'उपलब्ध आदेशहरू' : 'Available Commands'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCommands.slice(0, 8).map((cmd, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getCommandIcon(cmd.intent)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">
                      {cmd.command}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {cmd.description || `${cmd.intent} command`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Command Input */}
      <Card className="border-dashed border-2">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <Mic className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-600">
              {language === 'ne' 
                ? 'आवाज आदेश परीक्षण गर्न यहाँ क्लिक गर्नुहोस्'
                : 'Click here to test voice commands'
              }
            </p>
            <Button 
              onClick={() => {
                // This would trigger the voice input interface
                const testCommand = "search for house cleaning";
                processVoiceCommand(testCommand, 0.9);
              }}
              variant="outline"
            >
              {language === 'ne' ? 'परीक्षण आदेश' : 'Test Command'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}