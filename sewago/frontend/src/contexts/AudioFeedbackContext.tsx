'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface SoundAsset {
  id: string;
  name: string;
  fileUrl: string;
  category: 'ui' | 'notification' | 'success' | 'error' | 'ambient' | 'cultural';
  duration: number;
  volume: number;
  format: 'mp3' | 'wav' | 'ogg';
  culturalContext?: 'nepali' | 'general';
  accessibility: boolean;
  isDefault: boolean;
}

interface AudioPreferences {
  soundEnabled: boolean;
  soundVolume: number;
  voiceGuidance: boolean;
  culturalSounds: boolean;
  ambientSounds: boolean;
  reducedAudio: boolean;
}

interface AudioFeedbackContextType {
  preferences: AudioPreferences | null;
  updatePreferences: (preferences: Partial<AudioPreferences>) => Promise<void>;
  playSound: (soundName: string, options?: PlaySoundOptions) => Promise<void>;
  playSoundSequence: (sounds: string[], options?: SequenceOptions) => Promise<void>;
  playAmbientSound: (soundName: string, options?: AmbientOptions) => Promise<void>;
  stopAmbientSound: () => void;
  registerCustomSound: (soundAsset: SoundAsset) => Promise<void>;
  speakText: (text: string, options?: SpeechOptions) => Promise<void>;
  isAudioSupported: boolean;
  isSpeechSupported: boolean;
  audioContext: AudioContext | null;
}

interface PlaySoundOptions {
  volume?: number;
  culturalContext?: boolean;
  fade?: { in?: number; out?: number };
  loop?: boolean;
  delay?: number;
}

interface SequenceOptions {
  volume?: number;
  spacing?: number;
  culturalContext?: boolean;
}

interface AmbientOptions extends PlaySoundOptions {
  fadeDuration?: number;
}

interface SpeechOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: 'en-US' | 'ne-NP';
}

const AudioFeedbackContext = createContext<AudioFeedbackContextType | undefined>(undefined);

// Default sound assets with Nepali cultural elements
const DEFAULT_SOUND_ASSETS: SoundAsset[] = [
  {
    id: 'ui_click',
    name: 'UI Click',
    fileUrl: '/sounds/ui/click.mp3',
    category: 'ui',
    duration: 100,
    volume: 50,
    format: 'mp3',
    culturalContext: 'general',
    accessibility: true,
    isDefault: true
  },
  {
    id: 'ui_hover',
    name: 'UI Hover',
    fileUrl: '/sounds/ui/hover.mp3',
    category: 'ui',
    duration: 80,
    volume: 30,
    format: 'mp3',
    culturalContext: 'general',
    accessibility: true,
    isDefault: true
  },
  {
    id: 'success',
    name: 'Success',
    fileUrl: '/sounds/feedback/success.mp3',
    category: 'success',
    duration: 800,
    volume: 70,
    format: 'mp3',
    culturalContext: 'general',
    accessibility: true,
    isDefault: true
  },
  {
    id: 'error',
    name: 'Error',
    fileUrl: '/sounds/feedback/error.mp3',
    category: 'error',
    duration: 600,
    volume: 80,
    format: 'mp3',
    culturalContext: 'general',
    accessibility: true,
    isDefault: true
  },
  {
    id: 'notification',
    name: 'Notification',
    fileUrl: '/sounds/notifications/gentle.mp3',
    category: 'notification',
    duration: 500,
    volume: 60,
    format: 'mp3',
    culturalContext: 'general',
    accessibility: true,
    isDefault: true
  },
  {
    id: 'nepali_bell',
    name: 'Nepali Temple Bell',
    fileUrl: '/sounds/cultural/nepali_bell.mp3',
    category: 'cultural',
    duration: 2000,
    volume: 65,
    format: 'mp3',
    culturalContext: 'nepali',
    accessibility: false,
    isDefault: true
  },
  {
    id: 'nepali_singing_bowl',
    name: 'Nepali Singing Bowl',
    fileUrl: '/sounds/cultural/singing_bowl.mp3',
    category: 'cultural',
    duration: 3000,
    volume: 55,
    format: 'mp3',
    culturalContext: 'nepali',
    accessibility: false,
    isDefault: true
  },
  {
    id: 'nepali_chime',
    name: 'Nepali Wind Chime',
    fileUrl: '/sounds/cultural/wind_chime.mp3',
    category: 'ambient',
    duration: 5000,
    volume: 40,
    format: 'mp3',
    culturalContext: 'nepali',
    accessibility: false,
    isDefault: true
  },
  {
    id: 'booking_success',
    name: 'Booking Success',
    fileUrl: '/sounds/cultural/nepali_success.mp3',
    category: 'success',
    duration: 1500,
    volume: 75,
    format: 'mp3',
    culturalContext: 'nepali',
    accessibility: true,
    isDefault: true
  },
  {
    id: 'payment_success',
    name: 'Payment Success',
    fileUrl: '/sounds/cultural/nepali_celebration.mp3',
    category: 'success',
    duration: 2000,
    volume: 80,
    format: 'mp3',
    culturalContext: 'nepali',
    accessibility: true,
    isDefault: true
  }
];

interface AudioFeedbackProviderProps {
  children: ReactNode;
}

export function AudioFeedbackProvider({ children }: AudioFeedbackProviderProps) {
  const [preferences, setPreferences] = useState<AudioPreferences | null>(null);
  const [soundAssets, setSoundAssets] = useState<SoundAsset[]>(DEFAULT_SOUND_ASSETS);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isAudioSupported, setIsAudioSupported] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [loadedSounds, setLoadedSounds] = useState<Map<string, AudioBuffer>>(new Map());
  const [ambientSource, setAmbientSource] = useState<AudioBufferSourceNode | null>(null);
  const [gainNodes, setGainNodes] = useState<Map<string, GainNode>>(new Map());
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize audio system
  useEffect(() => {
    initializeAudioSystem();
    loadUserPreferences();
    preloadDefaultSounds();
  }, []);

  const initializeAudioSystem = async () => {
    // Check for audio support
    const audioSupported = typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined';
    setIsAudioSupported(audioSupported);

    // Check for speech synthesis support
    const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    setIsSpeechSupported(speechSupported);

    if (audioSupported) {
      try {
        // @ts-ignore
        const AudioContextClass = AudioContext || webkitAudioContext;
        const context = new AudioContextClass();
        setAudioContext(context);

        // Handle audio context state
        if (context.state === 'suspended') {
          // Wait for user interaction to resume context
          document.addEventListener('click', resumeAudioContext, { once: true });
          document.addEventListener('touchstart', resumeAudioContext, { once: true });
        }

        async function resumeAudioContext() {
          try {
            await context.resume();
          } catch (error) {
            console.warn('Failed to resume audio context:', error);
          }
        }
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
        setIsAudioSupported(false);
      }
    }
  };

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/ux/preferences');
      if (response.ok) {
        const userPrefs = await response.json();
        setPreferences({
          soundEnabled: userPrefs.soundEnabled,
          soundVolume: userPrefs.soundVolume,
          voiceGuidance: userPrefs.voiceGuidance,
          culturalSounds: userPrefs.culturalSounds,
          ambientSounds: userPrefs.ambientSounds || false,
          reducedAudio: userPrefs.reducedMotion || false
        });
      } else {
        // Set default preferences
        const defaultPrefs: AudioPreferences = {
          soundEnabled: true,
          soundVolume: 70,
          voiceGuidance: false,
          culturalSounds: true,
          ambientSounds: false,
          reducedAudio: false
        };
        setPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Error loading audio preferences:', error);
    }
  };

  const preloadDefaultSounds = async () => {
    if (!audioContext || !preferences?.soundEnabled) return;

    const soundsToPreload = soundAssets.filter(sound => 
      sound.isDefault && 
      (sound.culturalContext === 'general' || 
       (sound.culturalContext === 'nepali' && preferences.culturalSounds))
    );

    for (const sound of soundsToPreload) {
      try {
        await loadSound(sound.name, sound.fileUrl);
      } catch (error) {
        console.warn(`Failed to preload sound ${sound.name}:`, error);
      }
    }
  };

  const loadSound = async (soundName: string, url: string): Promise<AudioBuffer> => {
    if (!audioContext) {
      throw new Error('Audio context not available');
    }

    // Check if already loaded
    const existingBuffer = loadedSounds.get(soundName);
    if (existingBuffer) return existingBuffer;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      setLoadedSounds(prev => new Map(prev.set(soundName, audioBuffer)));
      return audioBuffer;
    } catch (error) {
      console.error(`Error loading sound ${soundName}:`, error);
      throw error;
    }
  };

  const updatePreferences = async (newPreferences: Partial<AudioPreferences>) => {
    if (!preferences) return;

    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);

    try {
      await fetch('/api/ux/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soundEnabled: updated.soundEnabled,
          soundVolume: updated.soundVolume,
          voiceGuidance: updated.voiceGuidance,
          culturalSounds: updated.culturalSounds
        })
      });
    } catch (error) {
      console.error('Error updating audio preferences:', error);
    }
  };

  const playSound = async (soundName: string, options: PlaySoundOptions = {}) => {
    if (!preferences?.soundEnabled || !audioContext || !isAudioSupported) return;

    const soundAsset = soundAssets.find(s => s.name.toLowerCase() === soundName.toLowerCase());
    if (!soundAsset) {
      console.warn(`Sound '${soundName}' not found`);
      return;
    }

    // Check cultural context preferences
    if (soundAsset.culturalContext === 'nepali' && !preferences.culturalSounds) {
      // Use general alternative
      await playSound('ui_click', options);
      return;
    }

    try {
      let audioBuffer = loadedSounds.get(soundAsset.name);
      if (!audioBuffer) {
        audioBuffer = await loadSound(soundAsset.name, soundAsset.fileUrl);
      }

      // Create audio source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create gain node for volume control
      const gainNode = audioContext.createGain();
      const volume = (options.volume ?? soundAsset.volume) * (preferences.soundVolume / 100) / 100;
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

      // Handle fade in/out
      if (options.fade?.in) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + options.fade.in / 1000);
      }

      if (options.fade?.out) {
        const startFadeTime = audioBuffer.duration - (options.fade.out / 1000);
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime + startFadeTime);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + audioBuffer.duration);
      }

      // Set up audio chain
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Handle looping
      source.loop = options.loop || false;

      // Start playback with optional delay
      const startTime = audioContext.currentTime + (options.delay || 0) / 1000;
      source.start(startTime);

      // Stop after duration if not looping
      if (!options.loop) {
        source.stop(startTime + audioBuffer.duration);
      }

      // Log analytics
      await logAudioAnalytics('sound_play', soundName, soundAsset.duration, {
        soundCategory: soundAsset.category,
        culturalContext: soundAsset.culturalContext,
        volume,
        options
      });

    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  };

  const playSoundSequence = async (sounds: string[], options: SequenceOptions = {}) => {
    if (!preferences?.soundEnabled || sounds.length === 0) return;

    const spacing = options.spacing || 200;
    
    for (let i = 0; i < sounds.length; i++) {
      const delay = i * spacing;
      await playSound(sounds[i], {
        volume: options.volume,
        culturalContext: options.culturalContext,
        delay
      });
    }
  };

  const playAmbientSound = async (soundName: string, options: AmbientOptions = {}) => {
    if (!preferences?.soundEnabled || !preferences.ambientSounds) return;

    // Stop existing ambient sound
    stopAmbientSound();

    try {
      await playSound(soundName, {
        ...options,
        loop: true,
        volume: (options.volume || 30) * 0.5 // Ambient sounds are quieter
      });
    } catch (error) {
      console.error(`Error playing ambient sound ${soundName}:`, error);
    }
  };

  const stopAmbientSound = () => {
    if (ambientSource) {
      try {
        ambientSource.stop();
      } catch (error) {
        console.warn('Error stopping ambient sound:', error);
      }
      setAmbientSource(null);
    }
  };

  const registerCustomSound = async (soundAsset: SoundAsset) => {
    setSoundAssets(prev => [...prev, soundAsset]);
    
    // Preload if it's a commonly used sound
    if (soundAsset.category === 'ui' || soundAsset.category === 'notification') {
      try {
        await loadSound(soundAsset.name, soundAsset.fileUrl);
      } catch (error) {
        console.warn(`Failed to preload custom sound ${soundAsset.name}:`, error);
      }
    }
  };

  const speakText = async (text: string, options: SpeechOptions = {}) => {
    if (!preferences?.voiceGuidance || !isSpeechSupported) return;

    // Cancel any existing speech
    if (speechRef.current) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set speech options
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = (options.volume || 80) * (preferences.soundVolume / 100) / 100;
    utterance.lang = options.language || 'en-US';

    // Try to use a specific voice if provided
    if (options.voice) {
      utterance.voice = options.voice;
    } else {
      // Try to find a suitable voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(options.language || 'en') && 
        voice.localService
      ) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    // Set up event handlers
    utterance.onstart = () => {
      speechRef.current = utterance;
    };

    utterance.onend = () => {
      speechRef.current = null;
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      speechRef.current = null;
    };

    // Start speech
    speechSynthesis.speak(utterance);

    // Log analytics
    await logAudioAnalytics('voice_guidance', 'text_to_speech', text.length * 50, {
      textLength: text.length,
      language: options.language || 'en-US',
      rate: utterance.rate,
      pitch: utterance.pitch
    });
  };

  const logAudioAnalytics = async (
    interactionType: string,
    elementId: string,
    duration: number,
    context: any
  ) => {
    try {
      await fetch('/api/ux/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactionType,
          elementId,
          duration,
          context: {
            ...context,
            audioSupported: isAudioSupported,
            speechSupported: isSpeechSupported,
            timestamp: new Date().toISOString()
          },
          deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
          screenSize: `${screen.width}x${screen.height}`
        })
      });
    } catch (error) {
      console.error('Error logging audio analytics:', error);
    }
  };

  const contextValue: AudioFeedbackContextType = {
    preferences,
    updatePreferences,
    playSound,
    playSoundSequence,
    playAmbientSound,
    stopAmbientSound,
    registerCustomSound,
    speakText,
    isAudioSupported,
    isSpeechSupported,
    audioContext
  };

  return (
    <AudioFeedbackContext.Provider value={contextValue}>
      {children}
    </AudioFeedbackContext.Provider>
  );
}

export const useAudioFeedback = () => {
  const context = useContext(AudioFeedbackContext);
  if (!context) {
    throw new Error('useAudioFeedback must be used within an AudioFeedbackProvider');
  }
  return context;
};