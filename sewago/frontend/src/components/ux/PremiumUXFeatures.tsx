'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Smartphone, Zap, Palette, Eye, Hand, Sparkles, Settings, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
// Mock useAuth hook for development
const useAuth = () => ({ user: { id: 'mock-user-id', name: 'Mock User', email: 'mock@example.com' } });

interface HapticPattern {
  id: string;
  name: string;
  pattern: number[];
  description: string;
}

interface SoundEffect {
  id: string;
  name: string;
  audioUrl: string;
  category: 'notification' | 'interaction' | 'success' | 'error';
}

interface ThemeConfig {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export default function PremiumUXFeatures() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('haptics');
  const [hapticsEnabled, setHapticsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [animationSpeed, setAnimationSpeed] = useState('normal');
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [selectedHapticPattern, setSelectedHapticPattern] = useState<string>('');
  const [selectedSoundEffect, setSelectedSoundEffect] = useState<string>('');
  const [volume, setVolume] = useState(0.7);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const hapticPatterns: HapticPattern[] = [
    { id: 'light', name: 'Light Tap', pattern: [50], description: 'Gentle single vibration' },
    { id: 'double', name: 'Double Tap', pattern: [50, 100, 50], description: 'Two quick vibrations' },
    { id: 'success', name: 'Success', pattern: [100, 50, 200], description: 'Celebration pattern' },
    { id: 'error', name: 'Error', pattern: [200, 100, 200, 100], description: 'Error notification' },
    { id: 'warning', name: 'Warning', pattern: [150, 100, 150], description: 'Attention pattern' },
    { id: 'custom', name: 'Custom', pattern: [100, 200, 100, 200, 100], description: 'Custom pattern' }
  ];

  const soundEffects: SoundEffect[] = [
    { id: 'notification', name: 'Notification Bell', audioUrl: '/sounds/notification.mp3', category: 'notification' },
    { id: 'success', name: 'Success Chime', audioUrl: '/sounds/success.mp3', category: 'success' },
    { id: 'error', name: 'Error Alert', audioUrl: '/sounds/error.mp3', category: 'error' },
    { id: 'click', name: 'Click Sound', audioUrl: '/sounds/click.mp3', category: 'interaction' },
    { id: 'hover', name: 'Hover Effect', audioUrl: '/sounds/hover.mp3', category: 'interaction' },
    { id: 'complete', name: 'Task Complete', audioUrl: '/sounds/complete.mp3', category: 'success' }
  ];

  const themes: ThemeConfig[] = [
    {
      name: 'default',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      accentColor: '#F59E0B'
    },
    {
      name: 'dark',
      primaryColor: '#6366F1',
      secondaryColor: '#4F46E5',
      backgroundColor: '#111827',
      textColor: '#F9FAFB',
      accentColor: '#F59E0B'
    },
    {
      name: 'nature',
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      backgroundColor: '#F0FDF4',
      textColor: '#064E3B',
      accentColor: '#F59E0B'
    },
    {
      name: 'sunset',
      primaryColor: '#F97316',
      secondaryColor: '#EA580C',
      backgroundColor: '#FEF7ED',
      textColor: '#7C2D12',
      accentColor: '#F59E0B'
    }
  ];

  useEffect(() => {
    // Check if device supports haptics
    if ('vibrate' in navigator) {
      setHapticsEnabled(true);
    }
    
    // Load user preferences from localStorage
    const savedPreferences = localStorage.getItem('sewago-ux-preferences');
    if (savedPreferences) {
      const prefs = JSON.parse(savedPreferences);
      setSoundEnabled(prefs.soundEnabled ?? true);
      setVolume(prefs.volume ?? 0.7);
      setAnimationSpeed(prefs.animationSpeed ?? 'normal');
      setCurrentTheme(prefs.theme ?? 'default');
      setAccessibilityMode(prefs.accessibilityMode ?? false);
    }
  }, []);

  useEffect(() => {
    // Save preferences to localStorage
    const preferences = {
      soundEnabled,
      volume,
      animationSpeed,
      theme: currentTheme,
      accessibilityMode
    };
    localStorage.setItem('sewago-ux-preferences', JSON.stringify(preferences));
  }, [soundEnabled, volume, animationSpeed, currentTheme, accessibilityMode]);

  const triggerHapticFeedback = (pattern: number[]) => {
    if (!hapticsEnabled || !('vibrate' in navigator)) {
      toast.error('Haptic feedback not supported on this device');
      return;
    }

    try {
      navigator.vibrate(pattern);
      toast.success('Haptic feedback triggered!');
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
      toast.error('Failed to trigger haptic feedback');
    }
  };

  const playSoundEffect = (soundEffect: SoundEffect) => {
    if (!soundEnabled) {
      toast.error('Sound is disabled');
      return;
    }

    try {
      if (audioRef.current) {
        audioRef.current.src = soundEffect.audioUrl;
        audioRef.current.volume = volume;
        audioRef.current.play();
        setIsPlaying(true);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
        
        toast.success(`Playing ${soundEffect.name}`);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      toast.error('Failed to play sound effect');
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const applyTheme = (theme: ThemeConfig) => {
    setCurrentTheme(theme.name);
    
    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    
    toast.success(`Theme "${theme.name}" applied successfully!`);
  };

  const toggleAccessibilityMode = () => {
    setAccessibilityMode(!accessibilityMode);
    
    if (!accessibilityMode) {
      // Enable accessibility features
      document.body.classList.add('accessibility-mode');
      toast.success('Accessibility mode enabled');
    } else {
      // Disable accessibility features
      document.body.classList.remove('accessibility-mode');
      toast.success('Accessibility mode disabled');
    }
  };

  const testHapticPattern = () => {
    const pattern = hapticPatterns.find(p => p.id === selectedHapticPattern);
    if (pattern) {
      triggerHapticFeedback(pattern.pattern);
    }
  };

  const testSoundEffect = () => {
    const sound = soundEffects.find(s => s.id === selectedSoundEffect);
    if (sound) {
      playSoundEffect(sound);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Premium UX Features</h1>
        <p className="text-gray-600">Enhance your experience with haptic feedback, sound design, and visual customization</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="haptics">Haptics</TabsTrigger>
          <TabsTrigger value="sound">Sound Design</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
        </TabsList>

        <TabsContent value="haptics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Haptic Feedback
              </CardTitle>
              <CardDescription>
                Feel the interaction with tactile feedback on supported devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Haptics Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${hapticsEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium">
                    {hapticsEnabled ? 'Haptics Supported' : 'Haptics Not Supported'}
                  </span>
                </div>
                <Badge variant={hapticsEnabled ? 'default' : 'secondary'}>
                  {hapticsEnabled ? 'Available' : 'Unavailable'}
                </Badge>
              </div>

              {/* Haptic Patterns */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Haptic Patterns</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hapticPatterns.map((pattern) => (
                    <Card
                      key={pattern.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedHapticPattern === pattern.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedHapticPattern(pattern.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{pattern.name}</h5>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHapticFeedback(pattern.pattern);
                            }}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Test
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">{pattern.description}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {pattern.pattern.map((duration, index) => (
                            <div
                              key={index}
                              className="h-2 bg-blue-200 rounded"
                              style={{ width: `${duration / 10}px` }}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Custom Haptic Pattern */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">Custom Haptic Pattern</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      placeholder="Enter pattern (e.g., 100,200,100)"
                      className="flex-1"
                      onChange={(e) => {
                        const pattern = e.target.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                        if (pattern.length > 0) {
                          const customPattern = hapticPatterns.find(p => p.id === 'custom');
                          if (customPattern) {
                            customPattern.pattern = pattern;
                          }
                        }
                      }}
                    />
                    <Button onClick={testHapticPattern} disabled={!selectedHapticPattern}>
                      Test Pattern
                    </Button>
                  </div>
                  <p className="text-sm text-blue-700">
                    Enter vibration durations in milliseconds, separated by commas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sound" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Sound Design
              </CardTitle>
              <CardDescription>
                Customize audio feedback for different interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sound Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Sound Effects</label>
                    <Button
                      variant={soundEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                    >
                      {soundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                      {soundEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
                    <Input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>{Math.round(volume * 100)}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Audio Player</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={testSoundEffect}
                        disabled={!selectedSoundEffect || !soundEnabled}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={stopSound}
                        disabled={!isPlaying}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selected Sound</label>
                    <Select value={selectedSoundEffect} onValueChange={setSelectedSoundEffect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a sound effect" />
                      </SelectTrigger>
                      <SelectContent>
                        {soundEffects.map((sound) => (
                          <SelectItem key={sound.id} value={sound.id}>
                            {sound.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Sound Effects Library */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Sound Effects Library</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {soundEffects.map((sound) => (
                    <Card
                      key={sound.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedSoundEffect === sound.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedSoundEffect(sound.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{sound.name}</h5>
                          <Badge variant="outline" className="text-xs">
                            {sound.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              playSoundEffect(sound);
                            }}
                            disabled={!soundEnabled}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Play
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSoundEffect(sound.id);
                            }}
                          >
                            Select
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Audio Element */}
              <audio ref={audioRef} style={{ display: 'none' }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="themes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Visual Themes
              </CardTitle>
              <CardDescription>
                Customize the visual appearance with different color schemes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {themes.map((theme) => (
                  <Card
                    key={theme.name}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      currentTheme === theme.name ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => applyTheme(theme)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900 capitalize">{theme.name}</h5>
                          {currentTheme === theme.name && (
                            <Badge variant="default">Active</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: theme.primaryColor }}
                            />
                            <span className="text-xs text-gray-600">Primary</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: theme.secondaryColor }}
                            />
                            <span className="text-xs text-gray-600">Secondary</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: theme.accentColor }}
                            />
                            <span className="text-xs text-gray-600">Accent</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Animation Speed */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Animation Speed</h4>
                <div className="space-y-3">
                  <Select value={animationSpeed} onValueChange={setAnimationSpeed}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="instant">Instant</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600">
                    Adjust the speed of animations and transitions throughout the app
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Accessibility Features
              </CardTitle>
              <CardDescription>
                Enhance usability for users with different accessibility needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Accessibility Mode */}
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-green-900">Accessibility Mode</h4>
                  <Button
                    variant={accessibilityMode ? 'default' : 'outline'}
                    onClick={toggleAccessibilityMode}
                  >
                    <Hand className="w-4 h-4 mr-2" />
                    {accessibilityMode ? 'Enabled' : 'Enable'}
                  </Button>
                </div>
                <p className="text-sm text-green-700">
                  When enabled, this mode increases contrast, reduces motion, and enhances keyboard navigation
                </p>
              </div>

              {/* Accessibility Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">High Contrast</h5>
                  <p className="text-sm text-gray-600">
                    Enhanced color contrast for better readability
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Reduced Motion</h5>
                  <p className="text-sm text-gray-600">
                    Minimize animations for users sensitive to motion
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Keyboard Navigation</h5>
                  <p className="text-sm text-gray-600">
                    Full keyboard support for all interactive elements
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Screen Reader</h5>
                  <p className="text-sm text-gray-600">
                    Optimized for screen reader compatibility
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      document.body.style.fontSize = '18px';
                      toast.success('Font size increased');
                    }}
                  >
                    Increase Font
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      document.body.style.fontSize = '16px';
                      toast.success('Font size reset');
                    }}
                  >
                    Reset Font
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      document.body.classList.toggle('high-contrast');
                      toast.success('High contrast toggled');
                    }}
                  >
                    Toggle Contrast
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      document.body.classList.toggle('no-animations');
                      toast.success('Animations toggled');
                    }}
                  >
                    Toggle Animations
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => {
            if (hapticsEnabled) {
              triggerHapticFeedback([100, 50, 100]);
            }
            if (soundEnabled) {
              playSoundEffect(soundEffects[0]);
            }
            toast.success('Premium UX features activated!');
          }}
        >
          <Sparkles className="w-6 h-6" />
        </Button>
      </motion.div>
    </div>
  );
}
