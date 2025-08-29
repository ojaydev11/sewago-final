'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import EnhancedButton from '@/components/ux/EnhancedButton';
import HapticButton from '@/components/ux/HapticButton';
import HapticSwitch from '@/components/ux/HapticSwitch';
import HapticGestureHandler from '@/components/ux/HapticGestureHandler';
import { ButtonRippleEffect, LoadingMicroAnimations, StateAnimations } from '@/components/ux/MicroInteractionAnimations';
import { NepaliPatternBackground, FestivalCelebration, CulturalColorPalette, CulturalTypography } from '@/components/ux/CulturalUXElements';
import { HighContrastToggle, ReducedMotionToggle, FontSizeController, SkipLinks } from '@/components/ux/AccessibilityComponents';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useAudioFeedback } from '@/hooks/useSoundDesign';
import { useContextualIntelligence } from '@/hooks/useContextualIntelligence';
import { useAccessibility } from '@/hooks/useAccessibility';

/**
 * UX Integration Examples Component
 * 
 * This component demonstrates how to integrate all premium UX features
 * into existing SewaGo components. It serves as a reference implementation
 * and can be used as a testing ground for UX features.
 */
export default function UXIntegrationExamples() {
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<string>('');
  const [progress, setProgress] = useState(45);
  const [switchState, setSwitchState] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Mock hooks for development
const useHapticFeedback = () => ({ triggerHaptic: (pattern: string) => console.log('Haptic feedback triggered:', pattern) });
const useAudioFeedback = () => ({ playSound: (sound: string, options?: any) => console.log('Sound played:', sound, options) });
const useContextualIntelligence = () => ({ 
  state: { 
    currentContext: {
      device: {
        type: 'mobile',
        screenSize: { width: 375, height: 667 },
        orientation: 'portrait',
        connection: '4G'
      },
      user: {
        preferences: { theme: 'light', language: 'en' },
        behavior: { lastAction: 'search', sessionDuration: 300 }
      },
      environment: {
        location: 'Kathmandu',
        time: 'afternoon',
        weather: 'sunny'
      },
      time: {
        hour: 14,
        isWorkingHours: true,
        isWeekend: false,
        nepaliDate: { year: 2080, month: 9, day: 15 }
      },
      location: {
        city: 'Kathmandu',
        district: 'Kathmandu',
        isUrban: true,
        country: 'Nepal',
        coordinates: { lat: 27.7172, lng: 85.3240 }
      }
    },
    activeAdaptations: ['theme', 'fontSize', 'contrast'],
    isProcessing: false
  }, 
  registerBehavior: (behavior: string, data: any) => Promise.resolve() 
});
const useAccessibility = () => ({ announceToScreenReader: (message: string) => console.log('Screen reader:', message) });
  
  const { triggerHaptic } = useHapticFeedback();
  const { playSound } = useAudioFeedback();
  const { state: contextState, registerBehavior } = useContextualIntelligence();
  const { announceToScreenReader } = useAccessibility();

  const handleServiceBooking = async () => {
    setLoadingState('loading');
    await registerBehavior('service_booking', { duration: 1000, element: 'booking_button' });
    
    // Simulate booking process
    setTimeout(() => {
      setLoadingState('success');
      setCelebrationActive(true);
      setTimeout(() => {
        setLoadingState('idle');
        setCelebrationActive(false);
      }, 3000);
    }, 2000);
  };

  const handleGestureEvent = async (gesture: any) => {
    await announceToScreenReader(`Gesture detected: ${gesture.type} ${gesture.direction || ''}`);
    
    if (gesture.type === 'swipe' && gesture.direction === 'right') {
      setProgress(Math.min(100, progress + 10));
    } else if (gesture.type === 'swipe' && gesture.direction === 'left') {
      setProgress(Math.max(0, progress - 10));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Skip Links */}
      <SkipLinks 
        links={[
          { href: '#main-content', label: 'Main Content' },
          { href: '#booking-section', label: 'Booking Section' },
          { href: '#accessibility-controls', label: 'Accessibility Controls' }
        ]}
      />

      {/* Cultural Background Pattern */}
      <NepaliPatternBackground
        pattern="mandala"
        intensity="subtle"
        colors="traditional"
        animated={true}
      />

      {/* Festival Celebration */}
      <FestivalCelebration
        festival="dashain"
        active={celebrationActive}
        duration={5000}
        onComplete={() => setCelebrationActive(false)}
      />

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CulturalTypography
            text="SewaGo Premium UX Showcase"
            textNe="सेवागो प्रिमियम UX प्रदर्शन"
            variant="display"
            style="ceremonial"
            showBoth={true}
            animated={true}
          />
          <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
            Experience the next generation of user interface design with haptic feedback, 
            intelligent audio cues, voice guidance, and cultural elements designed 
            specifically for the Nepali market.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Enhanced Buttons Section */}
          <motion.section
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Enhanced Button Components</h2>
            
            <div className="space-y-6">
              {/* Service Booking Button */}
              <div id="booking-section">
                <h3 className="text-lg font-semibold mb-3">Service Booking Button</h3>
                <EnhancedButton
                  onClick={handleServiceBooking}
                  loadingState={loadingState}
                  variant="default"
                  size="lg"
                  culturalTheme={true}
                  festivalMode={true}
                  hapticPattern="nepali_celebration"
                  soundEffect="booking_success"
                  voiceDescription="Service booking initiated"
                  tooltip="Click to book a service with premium UX feedback"
                  nepaliText="सेवा बुक गर्नुहोस्"
                  className="w-full"
                >
                  {loadingState === 'idle' && 'Book Service'}
                  {loadingState === 'loading' && 'Processing...'}
                  {loadingState === 'success' && 'Booking Confirmed!'}
                  {loadingState === 'error' && 'Try Again'}
                </EnhancedButton>
              </div>

              {/* Haptic Buttons */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Haptic Feedback Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <HapticButton
                    hapticPattern="success"
                    culturalContext={true}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Success
                  </HapticButton>
                  
                  <HapticButton
                    hapticPattern="error"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Error
                  </HapticButton>
                  
                  <HapticButton
                    hapticPattern="nepali_celebration"
                    culturalContext={true}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg border-b-2 border-yellow-400"
                  >
                    Cultural
                  </HapticButton>
                </div>
              </div>

              {/* Haptic Switch */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Haptic Switch</h3>
                <HapticSwitch
                  checked={switchState}
                  onCheckedChange={setSwitchState}
                  label="Enable Cultural Mode"
                  description="Switch to experience Nepali cultural UX elements"
                  variant="cultural"
                  hapticPatternOn="nepali_blessing"
                  hapticPatternOff="selection"
                  culturalContext={true}
                />
              </div>
            </div>
          </motion.section>

          {/* Micro Animations Section */}
          <motion.section
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Micro Interactions</h2>
            
            <div className="space-y-6">
              {/* Loading Animations */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Loading Animations</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <LoadingMicroAnimations variant="dots" size="md" />
                  <LoadingMicroAnimations variant="pulse" size="md" />
                  <LoadingMicroAnimations variant="nepali_mandala" size="md" culturalTheme={true} />
                  <LoadingMicroAnimations variant="prayer_wheel" size="md" culturalTheme={true} />
                </div>
              </div>

              {/* State Animations */}
              <div>
                <h3 className="text-lg font-semibold mb-3">State Feedback</h3>
                <div className="space-y-2">
                  <StateAnimations state="success" message="Service booked successfully!" />
                  <StateAnimations state="error" message="Booking failed. Please try again." />
                  <StateAnimations state="loading" message="Processing your request..." />
                </div>
              </div>

              {/* Ripple Effects */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Ripple Effects</h3>
                <ButtonRippleEffect
                  onClick={async () => {
                    await triggerHaptic('selection');
                    await playSound('ui_click', { volume: 40 });
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                  rippleColor="rgba(255, 255, 255, 0.5)"
                >
                  Click for Ripple Effect
                </ButtonRippleEffect>
              </div>

              {/* Progress Indicator */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Progress Indicators</h3>
                <div className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">Progress: {progress}%</p>
                  <p className="text-xs text-gray-500">Use swipe gestures below to adjust</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Gesture Handler Section */}
          <motion.section
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl lg:col-span-2"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Gesture Recognition</h2>
            
            <HapticGestureHandler
              onGesture={handleGestureEvent}
              enableSwipe={true}
              enableLongPress={true}
              enableShakeToUndo={true}
              culturalGestures={switchState}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 min-h-[200px] flex items-center justify-center"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Interactive Gesture Area</h3>
                <p className="text-gray-600 mb-4">
                  Try swiping, long pressing, or shaking your device
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>↔️ Swipe left/right to adjust progress</p>
                  <p>⏰ Long press for cultural celebration</p>
                  <p>📱 Shake device to trigger special effects</p>
                </div>
              </div>
            </HapticGestureHandler>
          </motion.section>

          {/* Cultural Elements Section */}
          <motion.section
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Cultural UX Elements</h2>
            
            <div className="space-y-6">
              <CulturalColorPalette
                onColorSelect={(palette) => {
                  setSelectedPalette(palette.name);
                  announceToScreenReader(`Selected color palette: ${palette.name}`);
                }}
                selectedPalette={selectedPalette}
                variant="traditional"
              />
            </div>
          </motion.section>

          {/* Accessibility Controls Section */}
          <motion.section
            id="accessibility-controls"
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Accessibility Controls</h2>
            
            <div className="space-y-6">
              <HighContrastToggle onToggle={(enabled) => 
                announceToScreenReader(enabled ? 'High contrast enabled' : 'High contrast disabled')
              } />
              
              <ReducedMotionToggle onToggle={(enabled) =>
                announceToScreenReader(enabled ? 'Reduced motion enabled' : 'Reduced motion disabled')
              } />
              
              <FontSizeController onSizeChange={(size) =>
                announceToScreenReader(`Font size changed to ${size}`)
              } />
            </div>
          </motion.section>
        </div>

        {/* Context Information */}
        <motion.section
          className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Contextual Intelligence</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Device Context</h3>
              <p className="text-sm text-gray-600">
                Type: {contextState.currentContext.device.type}<br />
                Screen: {contextState.currentContext.device.screenSize.width}×{contextState.currentContext.device.screenSize.height}<br />
                Orientation: {contextState.currentContext.device.orientation}<br />
                Connection: {contextState.currentContext.device.connection}
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Time Context</h3>
              <p className="text-sm text-gray-600">
                Hour: {contextState.currentContext.time.hour}:00<br />
                Working Hours: {contextState.currentContext.time.isWorkingHours ? 'Yes' : 'No'}<br />
                Weekend: {contextState.currentContext.time.isWeekend ? 'Yes' : 'No'}<br />
                Nepali Date: {contextState.currentContext.time.nepaliDate.year}/{contextState.currentContext.time.nepaliDate.month}/{contextState.currentContext.time.nepaliDate.day}
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Location Context</h3>
              <p className="text-sm text-gray-600">
                City: {contextState.currentContext.location.city || 'Unknown'}<br />
                District: {contextState.currentContext.location.district || 'Unknown'}<br />
                Urban: {contextState.currentContext.location.isUrban ? 'Yes' : 'No'}<br />
                Country: {contextState.currentContext.location.country}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Feature Status */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <p className="text-sm text-gray-600 mb-2">
            Active Adaptations: {contextState.activeAdaptations.length} | 
            Processing: {contextState.isProcessing ? 'Yes' : 'No'}
          </p>
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <span>🎮 Haptic Feedback</span>
            <span>🔊 Audio Design</span>
            <span>🗣️ Voice Guidance</span>
            <span>🧠 Contextual AI</span>
            <span>🏛️ Cultural UX</span>
            <span>♿ Accessibility</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}