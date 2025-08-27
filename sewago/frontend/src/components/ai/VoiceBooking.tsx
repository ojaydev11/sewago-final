'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Play, Pause, Volume2, Loader2, CheckCircle, AlertCircle, Clock, MapPin, Calendar, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
// Mock useAuth hook for development
const useAuth = () => ({ user: { id: 'mock-user-id', name: 'Mock User', email: 'mock@example.com' } });

interface VoiceData {
  transcription: string;
  intent: string;
  confidence: number;
  extractedData: {
    serviceType: string;
    location: string;
    date: string;
    time: string;
    urgency: string;
  };
  nextSteps: string[];
}

export default function VoiceBooking() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceData, setVoiceData] = useState<VoiceData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start recording timer
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success('Recording started. Speak clearly about your service needs.');
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Unable to access microphone. Please check permissions.');
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      toast.success('Recording stopped. Processing your request...');
      processVoiceInput();
    }
  };

  const processVoiceInput = async () => {
    if (!audioBlob || !user) return;
    
    setIsProcessing(true);
    
    try {
      // Create FormData for audio upload
      const formData = new FormData();
      formData.append('audioFile', audioBlob, 'voice-booking.wav');
      formData.append('transcription', 'Mock transcription for demo'); // In real app, this would be actual transcription
      formData.append('intent', 'BOOK_SERVICE');
      
      const response = await fetch('/api/ai/voice-booking', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setVoiceData(data);
        setShowConfirmation(true);
        toast.success('Voice input processed successfully!');
      } else {
        throw new Error('Failed to process voice input');
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      setError('Failed to process voice input. Please try again.');
      toast.error('Failed to process voice input');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmBooking = async () => {
    if (!voiceData) return;
    
    try {
      // In a real app, this would create an actual booking
      toast.success('Booking confirmed! We\'ll send you confirmation details.');
      setShowConfirmation(false);
      setVoiceData(null);
      setAudioBlob(null);
      setAudioUrl('');
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast.error('Failed to confirm booking');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'BOOK_SERVICE':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'MODIFY_BOOKING':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'GET_INFO':
        return <Zap className="w-5 h-5 text-green-500" />;
      default:
        return <Zap className="w-5 h-5 text-gray-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice Booking</h1>
        <p className="text-gray-600">Book services using your voice - it's that simple!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Voice Recording Section */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Voice Input
            </CardTitle>
            <CardDescription>
              Click the microphone and speak about your service needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recording Controls */}
            <div className="text-center">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                size="lg"
                className={`w-20 h-20 rounded-full ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
              
              <p className="mt-4 text-sm text-gray-600">
                {isRecording ? 'Click to stop recording' : 'Click to start recording'}
              </p>
              
              {isRecording && (
                <div className="mt-4">
                  <div className="text-2xl font-mono text-red-500">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Audio Playback */}
            {audioUrl && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Your Recording</h4>
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/wav" />
                  Your browser does not support audio playback.
                </audio>
                <p className="text-sm text-gray-500 mt-2">
                  Duration: {formatTime(recordingTime)}
                </p>
              </div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <div className="text-center py-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-gray-600">Processing your voice input...</p>
                <p className="text-sm text-gray-500">This may take a few seconds</p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Use Voice Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  1
                </div>
                <p className="text-gray-600">Click the microphone button and speak clearly</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  2
                </div>
                <p className="text-gray-600">Describe your service needs, location, and preferred time</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  3
                </div>
                <p className="text-gray-600">Our AI will extract the details and confirm your booking</p>
              </div>
            </CardContent>
          </Card>

          {/* Example Phrases */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Example Phrases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">Try saying things like:</p>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">"I need a house cleaning service tomorrow at 2 PM in Kathmandu"</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">"Book a plumber for urgent pipe repair in Lalitpur"</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">"Schedule electrical work for next week in Bhaktapur"</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Voice Data Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && voiceData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-2 mb-4">
                {getIntentIcon(voiceData.intent)}
                <h3 className="text-lg font-semibold">Confirm Your Booking</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Confidence:</strong> {(voiceData.confidence * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                    <p className="text-gray-900">{voiceData.extractedData.serviceType || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <p className="text-gray-900">{voiceData.extractedData.location || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <p className="text-gray-900">{voiceData.extractedData.date || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <p className="text-gray-900">{voiceData.extractedData.time || 'Not specified'}</p>
                  </div>
                </div>

                {voiceData.extractedData.urgency && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                    <Badge className={getUrgencyColor(voiceData.extractedData.urgency)}>
                      {voiceData.extractedData.urgency}
                    </Badge>
                  </div>
                )}

                {voiceData.nextSteps.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Next Steps</label>
                    <ul className="space-y-1">
                      {voiceData.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button onClick={confirmBooking} className="flex-1">
                    Confirm Booking
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1"
                  >
                    Modify Details
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Highlight */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Voice Booking Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast & Natural</h3>
              <p className="text-gray-600 text-sm">Speak naturally and get instant service booking</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Recognition</h3>
              <p className="text-gray-600 text-sm">AI-powered voice recognition with high accuracy</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multi-language</h3>
              <p className="text-gray-600 text-sm">Support for Nepali and English languages</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
