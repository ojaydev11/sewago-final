'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Mock useIntl hook for development
const useIntl = () => ({
  formatMessage: (descriptor: { id: string; defaultMessage?: string }, values?: any) => {
    if (values && values.name) {
      return `Welcome, ${values.name}`;
    }
    return descriptor.defaultMessage || descriptor.id;
  },
  formatDate: (date: Date) => date.toLocaleDateString(),
  formatTime: (date: Date) => date.toLocaleTimeString(),
  formatNumber: (num: number) => num.toLocaleString(),
  locale: 'en'
});
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useUserPreferences } from '@/hooks/usePersonalization';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  Heart,
  Settings,
  Globe,
  Zap,
} from 'lucide-react';

interface PreferenceOnboardingProps {
  userId: string;
  onComplete?: () => void;
  onSkip?: () => void;
  className?: string;
}

interface OnboardingData {
  interests: string[];
  preferredTimes: string[];
  budget: number;
  preferredAreas: string[];
  serviceRadius: number;
  language: 'en' | 'ne';
  festivals: string[];
  prioritizePrice: boolean;
  prioritizeQuality: boolean;
  wantsOffers: boolean;
  wantsReminders: boolean;
}

const AVAILABLE_SERVICES = [
  { id: 'cleaning', name: 'House Cleaning', nameNe: 'घर सफाई', icon: '🏠' },
  { id: 'maintenance', name: 'Home Maintenance', nameNe: 'घर मर्मत', icon: '🔧' },
  { id: 'beauty', name: 'Beauty Services', nameNe: 'सौन्दर्य सेवा', icon: '💄' },
  { id: 'delivery', name: 'Delivery', nameNe: 'डेलिभरी', icon: '📦' },
  { id: 'tutoring', name: 'Tutoring', nameNe: 'ट्युसन', icon: '📚' },
  { id: 'fitness', name: 'Fitness Training', nameNe: 'फिटनेस', icon: '💪' },
  { id: 'cooking', name: 'Cooking Services', nameNe: 'खाना पकाउने', icon: '👨‍🍳' },
  { id: 'gardening', name: 'Gardening', nameNe: 'बगैंचा', icon: '🌱' },
];

const TIME_SLOTS = [
  { id: '06:00-09:00', name: 'Early Morning (6-9 AM)', nameNe: 'बिहान सबेरै (६-९)' },
  { id: '09:00-12:00', name: 'Morning (9 AM-12 PM)', nameNe: 'बिहान (९-१२)' },
  { id: '12:00-15:00', name: 'Afternoon (12-3 PM)', nameNe: 'दिउँसो (१२-३)' },
  { id: '15:00-18:00', name: 'Evening (3-6 PM)', nameNe: 'बेलुका (३-६)' },
  { id: '18:00-21:00', name: 'Night (6-9 PM)', nameNe: 'राति (६-९)' },
];

const NEPALI_FESTIVALS = [
  { id: 'dashain', name: 'Dashain', nameNe: 'दशैं' },
  { id: 'tihar', name: 'Tihar', nameNe: 'तिहार' },
  { id: 'holi', name: 'Holi', nameNe: 'होली' },
  { id: 'buddha_jayanti', name: 'Buddha Jayanti', nameNe: 'बुद्ध जयन्ती' },
  { id: 'teej', name: 'Teej', nameNe: 'तीज' },
  { id: 'shivaratri', name: 'Shivaratri', nameNe: 'शिवरात्रि' },
];

const KATHMANDU_AREAS = [
  'Thamel', 'Kathmandu Durbar Square', 'Patan', 'Bhaktapur', 'Lalitpur',
  'Baneshwor', 'New Baneshwor', 'Durbarmarg', 'Asan', 'Indrachowk',
  'Ratnapark', 'Putalisadak', 'Kalanki', 'Koteshwor', 'Chabahil'
];

export function PreferenceOnboarding({
  userId,
  onComplete,
  onSkip,
  className = '',
}: PreferenceOnboardingProps) {
  const intl = useIntl();
  const { createInitialPreferences, loading } = useUserPreferences(userId);
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    interests: [],
    preferredTimes: [],
    budget: 2500,
    preferredAreas: [],
    serviceRadius: 5000,
    language: 'en',
    festivals: [],
    prioritizePrice: true,
    prioritizeQuality: true,
    wantsOffers: true,
    wantsReminders: true,
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const success = await createInitialPreferences(onboardingData);
      if (success) {
        onComplete?.();
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };

  const updateData = (key: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} onSkip={handleSkip} />;
      case 1:
        return (
          <ServicesStep
            selectedServices={onboardingData.interests}
            onServicesChange={(services) => updateData('interests', services)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 2:
        return (
          <TimingStep
            selectedTimes={onboardingData.preferredTimes}
            onTimesChange={(times) => updateData('preferredTimes', times)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <BudgetLocationStep
            budget={onboardingData.budget}
            selectedAreas={onboardingData.preferredAreas}
            serviceRadius={onboardingData.serviceRadius}
            onBudgetChange={(budget) => updateData('budget', budget)}
            onAreasChange={(areas) => updateData('preferredAreas', areas)}
            onRadiusChange={(radius) => updateData('serviceRadius', radius)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <PersonalizationStep
            language={onboardingData.language}
            festivals={onboardingData.festivals}
            prioritizePrice={onboardingData.prioritizePrice}
            prioritizeQuality={onboardingData.prioritizeQuality}
            wantsOffers={onboardingData.wantsOffers}
            wantsReminders={onboardingData.wantsReminders}
            onLanguageChange={(lang: "en" | "ne") => updateData('language', lang)}
            onFestivalsChange={(festivals) => updateData('festivals', festivals)}
            onPriorityChange={(key, value) => updateData(key as keyof OnboardingData, value)}
            onComplete={handleComplete}
            onPrevious={handlePrevious}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Welcome Step Component
function WelcomeStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const intl = useIntl();

  return (
    <Card className="text-center">
      <CardHeader className="pb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <CardTitle className="text-2xl">
          {intl.formatMessage({ id: 'personalization.onboarding.welcome' })}
        </CardTitle>
        <CardDescription className="text-lg">
          {intl.formatMessage({ id: 'personalization.onboarding.subtitle' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Heart, label: 'Personalized' },
            { icon: Zap, label: 'Smart' },
            { icon: Clock, label: 'Time-saving' },
            { icon: Globe, label: 'Cultural' },
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-3"
            >
              <feature.icon className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <span className="text-sm text-gray-600">{feature.label}</span>
            </motion.div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onNext} size="lg" className="sm:order-1">
            Get Started
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="ghost" onClick={onSkip} size="lg" className="sm:order-2">
            {intl.formatMessage({ id: 'personalization.onboarding.skip' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Services Selection Step
function ServicesStep({
  selectedServices,
  onServicesChange,
  onNext,
  onPrevious,
}: {
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const intl = useIntl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="h-5 w-5 mr-2 text-red-500" />
          {intl.formatMessage({ id: 'personalization.onboarding.step1.title' })}
        </CardTitle>
        <CardDescription>
          {intl.formatMessage({ id: 'personalization.onboarding.step1.description' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AVAILABLE_SERVICES.map((service) => (
            <motion.div
              key={service.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={selectedServices.includes(service.id) ? 'default' : 'outline'}
                className="h-auto p-4 flex flex-col items-center space-y-2 w-full"
                onClick={() => {
                  const newServices = selectedServices.includes(service.id)
                    ? selectedServices.filter(s => s !== service.id)
                    : [...selectedServices, service.id];
                  onServicesChange(newServices);
                }}
              >
                <div className="text-2xl">{service.icon}</div>
                <span className="text-sm text-center">{service.name}</span>
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={onNext} disabled={selectedServices.length === 0}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Timing Preferences Step
function TimingStep({
  selectedTimes,
  onTimesChange,
  onNext,
  onPrevious,
}: {
  selectedTimes: string[];
  onTimesChange: (times: string[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const intl = useIntl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-500" />
          {intl.formatMessage({ id: 'personalization.onboarding.step2.title' })}
        </CardTitle>
        <CardDescription>
          {intl.formatMessage({ id: 'personalization.onboarding.step2.description' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TIME_SLOTS.map((timeSlot) => (
            <motion.div
              key={timeSlot.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={selectedTimes.includes(timeSlot.id) ? 'default' : 'outline'}
                className="h-auto p-4 w-full text-left justify-start"
                onClick={() => {
                  const newTimes = selectedTimes.includes(timeSlot.id)
                    ? selectedTimes.filter(t => t !== timeSlot.id)
                    : [...selectedTimes, timeSlot.id];
                  onTimesChange(newTimes);
                }}
              >
                <div>
                  <div className="font-medium">{timeSlot.name}</div>
                  <div className="text-sm text-gray-600">{timeSlot.nameNe}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={onNext} disabled={selectedTimes.length === 0}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Budget and Location Step
function BudgetLocationStep({
  budget,
  selectedAreas,
  serviceRadius,
  onBudgetChange,
  onAreasChange,
  onRadiusChange,
  onNext,
  onPrevious,
}: {
  budget: number;
  selectedAreas: string[];
  serviceRadius: number;
  onBudgetChange: (budget: number) => void;
  onAreasChange: (areas: string[]) => void;
  onRadiusChange: (radius: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const intl = useIntl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-green-500" />
          {intl.formatMessage({ id: 'personalization.onboarding.step3.title' })}
        </CardTitle>
        <CardDescription>
          {intl.formatMessage({ id: 'personalization.onboarding.step3.description' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Range */}
        <div className="space-y-3">
          <Label className="text-base">Budget Range (NPR)</Label>
          <div className="px-4">
            <Slider
              value={budget}
              onValueChange={(value) => {
                if (Array.isArray(value)) {
                  onBudgetChange(value[0]);
                } else {
                  onBudgetChange(value);
                }
              }}
              max={10000}
              min={500}
              step={250}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>NPR 500</span>
              <span className="font-medium">NPR {budget.toLocaleString()}</span>
              <span>NPR 10,000+</span>
            </div>
          </div>
        </div>

        {/* Preferred Areas */}
        <div className="space-y-3">
          <Label className="text-base">Preferred Areas</Label>
          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {KATHMANDU_AREAS.map((area) => (
              <Button
                key={area}
                variant={selectedAreas.includes(area) ? 'default' : 'outline'}
                size="sm"
                className="justify-start text-xs"
                onClick={() => {
                  const newAreas = selectedAreas.includes(area)
                    ? selectedAreas.filter(a => a !== area)
                    : [...selectedAreas, area];
                  onAreasChange(newAreas);
                }}
              >
                {area}
              </Button>
            ))}
          </div>
        </div>

        {/* Service Radius */}
        <div className="space-y-3">
          <Label className="text-base">Service Radius</Label>
          <div className="px-4">
            <Slider
              value={serviceRadius}
              onValueChange={(value) => {
                if (Array.isArray(value)) {
                  onRadiusChange(value[0]);
                } else {
                  onRadiusChange(value);
                }
              }}
              max={20000}
              min={1000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>1 km</span>
              <span className="font-medium">{(serviceRadius / 1000).toFixed(1)} km</span>
              <span>20+ km</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={onNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Final Personalization Step
function PersonalizationStep({
  language,
  festivals,
  prioritizePrice,
  prioritizeQuality,
  wantsOffers,
  wantsReminders,
  onLanguageChange,
  onFestivalsChange,
  onPriorityChange,
  onComplete,
  onPrevious,
  loading,
}: {
  language: 'en' | 'ne';
  festivals: string[];
  prioritizePrice: boolean;
  prioritizeQuality: boolean;
  wantsOffers: boolean;
  wantsReminders: boolean;
  onLanguageChange: (lang: 'en' | 'ne') => void;
  onFestivalsChange: (festivals: string[]) => void;
  onPriorityChange: (key: string, value: boolean) => void;
  onComplete: () => void;
  onPrevious: () => void;
  loading: boolean;
}) {
  const intl = useIntl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2 text-purple-500" />
          {intl.formatMessage({ id: 'personalization.onboarding.step4.title' })}
        </CardTitle>
        <CardDescription>
          {intl.formatMessage({ id: 'personalization.onboarding.step4.description' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Preference */}
        <div className="space-y-3">
          <Label className="text-base">Language Preference</Label>
          <RadioGroup value={language} onValueChange={(value) => onLanguageChange(value as "en" | "ne")}>
            <RadioGroupItem value="en" id="en">
              <Label htmlFor="en">English</Label>
            </RadioGroupItem>
            <RadioGroupItem value="ne" id="ne">
              <Label htmlFor="ne">नेपाली (Nepali)</Label>
            </RadioGroupItem>
          </RadioGroup>
        </div>

        {/* Cultural Preferences */}
        <div className="space-y-3">
          <Label className="text-base">Festivals You Celebrate</Label>
          <div className="grid grid-cols-2 gap-3">
            {NEPALI_FESTIVALS.map((festival) => (
              <div key={festival.id} className="flex items-center space-x-2">
                <Checkbox
                  id={festival.id}
                  checked={festivals.includes(festival.id)}
                  onCheckedChange={(checked) => {
                    const newFestivals = checked
                      ? [...festivals, festival.id]
                      : festivals.filter(f => f !== festival.id);
                    onFestivalsChange(newFestivals);
                  }}
                />
                <Label htmlFor={festival.id} className="text-sm">
                  {festival.name} ({festival.nameNe})
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Priorities and Preferences */}
        <div className="space-y-3">
          <Label className="text-base">Your Priorities</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="prioritizePrice"
                checked={prioritizePrice}
                onCheckedChange={(checked) => onPriorityChange('prioritizePrice', checked as boolean)}
              />
              <Label htmlFor="prioritizePrice">Show affordable options first</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="prioritizeQuality"
                checked={prioritizeQuality}
                onCheckedChange={(checked) => onPriorityChange('prioritizeQuality', checked as boolean)}
              />
              <Label htmlFor="prioritizeQuality">Prioritize highly-rated providers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wantsOffers"
                checked={wantsOffers}
                onCheckedChange={(checked) => onPriorityChange('wantsOffers', checked as boolean)}
              />
              <Label htmlFor="wantsOffers">Send me personalized offers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wantsReminders"
                checked={wantsReminders}
                onCheckedChange={(checked) => onPriorityChange('wantsReminders', checked as boolean)}
              />
              <Label htmlFor="wantsReminders">Send me booking reminders</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={onComplete} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Setting up...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'personalization.onboarding.complete' })}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}