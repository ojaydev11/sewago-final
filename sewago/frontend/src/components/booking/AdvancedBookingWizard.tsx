'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, Users, Repeat, MapPin, Zap, Cloud, Car, CheckCircle, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import SmartScheduler from './SmartScheduler';
import GroupBookingManager from './GroupBookingManager';
import RecurringServiceSetup from './RecurringServiceSetup';
import BookingCalendar from './BookingCalendar';

// Form schema for advanced booking
const advancedBookingSchema = z.object({
  // Basic booking details
  serviceId: z.string().min(1, 'Service is required'),
  providerId: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  notes: z.string().optional(),
  
  // Booking type and advanced options
  bookingType: z.enum(['STANDARD', 'GROUP', 'RECURRING', 'SMART_SCHEDULED']),
  smartScheduled: z.boolean().default(false),
  weatherSensitive: z.boolean().default(false),
  trafficOptimized: z.boolean().default(true),
  
  // Scheduling preferences
  preferredTimes: z.array(z.object({
    start: z.string(),
    end: z.string(),
    priority: z.number().min(1).max(5),
    dayOfWeek: z.number().min(0).max(6).optional()
  })).optional(),
  
  scheduledAt: z.date().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  flexibilityHours: z.number().min(1).max(168).default(24),
  
  // Group booking settings
  groupSettings: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    maxParticipants: z.number().min(2).max(20).default(10),
    splitMethod: z.enum(['EQUAL', 'PERCENTAGE', 'CUSTOM', 'BY_SERVICE']).default('EQUAL'),
    groupDiscount: z.number().min(0).max(50).default(0)
  }).optional(),
  
  // Recurring booking settings
  recurringSettings: z.object({
    frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM']),
    interval: z.number().min(1).max(12).default(1),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    preferredTime: z.string().optional(),
    startDate: z.date(),
    endDate: z.date().optional(),
    holidayHandling: z.enum(['SKIP', 'RESCHEDULE_BEFORE', 'RESCHEDULE_AFTER']).default('RESCHEDULE_AFTER')
  }).optional()
});

type AdvancedBookingForm = z.infer<typeof advancedBookingSchema>;

interface AdvancedBookingWizardProps {
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  basePrice: number;
  onComplete: (booking: any) => void;
  onCancel: () => void;
}

const BOOKING_STEPS = [
  { id: 'type', title: 'Booking Type', description: 'Choose your booking style' },
  { id: 'details', title: 'Details', description: 'Service details and location' },
  { id: 'schedule', title: 'Scheduling', description: 'When and how often' },
  { id: 'advanced', title: 'Smart Options', description: 'AI optimization settings' },
  { id: 'review', title: 'Review', description: 'Confirm your booking' }
];

export default function AdvancedBookingWizard({
  serviceId,
  serviceName,
  serviceCategory,
  basePrice,
  onComplete,
  onCancel
}: AdvancedBookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [smartRecommendations, setSmartRecommendations] = useState<any[]>([]);
  
  const methods = useForm<AdvancedBookingForm>({
    resolver: zodResolver(advancedBookingSchema),
    defaultValues: {
      serviceId,
      bookingType: 'STANDARD',
      smartScheduled: false,
      weatherSensitive: isWeatherSensitiveService(serviceCategory),
      trafficOptimized: true,
      urgency: 'MEDIUM',
      flexibilityHours: 24,
      preferredTimes: []
    }
  });

  const { watch, setValue, getValues } = methods;
  const bookingType = watch('bookingType');
  const smartScheduled = watch('smartScheduled');

  useEffect(() => {
    // Auto-enable smart scheduling for certain service types
    if (['house-cleaning', 'gardening', 'repairs'].includes(serviceCategory)) {
      setValue('smartScheduled', true);
    }
  }, [serviceCategory, setValue]);

  const handleNext = async () => {
    const currentStepId = BOOKING_STEPS[currentStep].id;
    
    // Validate current step
    const isValid = await validateCurrentStep(currentStepId);
    if (!isValid) return;

    if (currentStep < BOOKING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: AdvancedBookingForm) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          scheduledAt: data.scheduledAt?.toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const result = await response.json();
      toast.success('Advanced booking created successfully!');
      onComplete(result);

    } catch (error: any) {
      console.error('Error creating advanced booking:', error);
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const validateCurrentStep = async (stepId: string): Promise<boolean> => {
    switch (stepId) {
      case 'type':
        return true; // No validation needed
      case 'details':
        const address = getValues('address');
        if (!address || address.length < 5) {
          toast.error('Please provide a valid address');
          return false;
        }
        return true;
      case 'schedule':
        return validateScheduleStep();
      case 'advanced':
        return true; // Optional settings
      default:
        return true;
    }
  };

  const validateScheduleStep = (): boolean => {
    const data = getValues();
    
    if (data.bookingType === 'RECURRING' && !data.recurringSettings) {
      toast.error('Please configure recurring booking settings');
      return false;
    }
    
    if (data.bookingType === 'GROUP' && !data.groupSettings) {
      toast.error('Please configure group booking settings');
      return false;
    }
    
    if (!data.smartScheduled && !data.scheduledAt) {
      toast.error('Please select a date and time or enable smart scheduling');
      return false;
    }
    
    return true;
  };

  const generateSmartRecommendations = async () => {
    const formData = getValues();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/bookings/smart-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          address: formData.address,
          preferredTimes: formData.preferredTimes,
          weatherSensitive: formData.weatherSensitive,
          trafficOptimized: formData.trafficOptimized,
          urgency: formData.urgency,
          flexibilityHours: formData.flexibilityHours
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSmartRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = () => {
    return ((currentStep + 1) / BOOKING_STEPS.length) * 100;
  };

  const renderStepContent = () => {
    const stepId = BOOKING_STEPS[currentStep].id;

    switch (stepId) {
      case 'type':
        return <BookingTypeStep />;
      case 'details':
        return <BookingDetailsStep />;
      case 'schedule':
        return <SchedulingStep onGenerateRecommendations={generateSmartRecommendations} />;
      case 'advanced':
        return <AdvancedOptionsStep recommendations={smartRecommendations} />;
      case 'review':
        return <ReviewStep serviceDetails={{ name: serviceName, category: serviceCategory, basePrice }} />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Advanced Booking
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Book {serviceName} with smart scheduling and advanced options
          </p>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={getStepProgress()} className="w-full h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              {BOOKING_STEPS.map((step, index) => (
                <span
                  key={step.id}
                  className={`${
                    index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="min-h-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getStepIcon(BOOKING_STEPS[currentStep].id)}
              {BOOKING_STEPS[currentStep].title}
            </CardTitle>
            <CardDescription>
              {BOOKING_STEPS[currentStep].description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onCancel : handlePrevious}
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 0 ? 'Cancel' : 'Previous'}
          </Button>

          <div className="flex gap-2">
            {currentStep === BOOKING_STEPS.length - 1 ? (
              <Button
                onClick={methods.handleSubmit(handleSubmit)}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create Booking
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={isLoading}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

// Step Components
function BookingTypeStep() {
  const { watch, setValue } = methods.useFormContext<AdvancedBookingForm>();
  const bookingType = watch('bookingType');

  const bookingTypes = [
    {
      id: 'STANDARD' as const,
      title: 'Standard Booking',
      description: 'Traditional one-time service booking',
      icon: Calendar,
      features: ['One-time service', 'Flexible scheduling', 'Provider selection'],
      recommended: false
    },
    {
      id: 'SMART_SCHEDULED' as const,
      title: 'Smart Scheduled',
      description: 'AI-powered optimal time recommendations',
      icon: Zap,
      features: ['AI recommendations', 'Weather consideration', 'Traffic optimization'],
      recommended: true
    },
    {
      id: 'GROUP' as const,
      title: 'Group Booking',
      description: 'Coordinate with friends and family',
      icon: Users,
      features: ['Split costs', 'Group coordination', 'Bulk discounts'],
      recommended: false
    },
    {
      id: 'RECURRING' as const,
      title: 'Recurring Service',
      description: 'Regular scheduled maintenance',
      icon: Repeat,
      features: ['Automatic rebooking', 'Consistent provider', 'Volume discounts'],
      recommended: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Choose Your Booking Type</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Select the booking style that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookingTypes.map((type) => (
          <motion.div
            key={type.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 ${
                bookingType === type.id
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setValue('bookingType', type.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      bookingType === type.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <type.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {type.title}
                        {type.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {type.description}
                      </CardDescription>
                    </div>
                  </div>
                  {bookingType === type.id && (
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-1">
                  {type.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BookingDetailsStep() {
  const { register, watch, formState: { errors } } = methods.useFormContext<AdvancedBookingForm>();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Service Details</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Tell us where and any special requirements
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Service Address *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              {...register('address')}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-800 dark:text-white`}
              rows={3}
              placeholder="Enter complete address with landmarks..."
            />
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.address.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Notes
          </label>
          <textarea
            {...register('notes')}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-800 dark:text-white"
            rows={4}
            placeholder="Any specific requirements, preferences, or instructions for the service provider..."
          />
        </div>
      </div>
    </div>
  );
}

function SchedulingStep({ onGenerateRecommendations }: { onGenerateRecommendations: () => void }) {
  const { watch } = methods.useFormContext<AdvancedBookingForm>();
  const bookingType = watch('bookingType');
  const smartScheduled = watch('smartScheduled');

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Schedule Your Service</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Choose when and how you want this service scheduled
        </p>
      </div>

      <Tabs defaultValue={bookingType.toLowerCase()} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="smart_scheduled">Smart</TabsTrigger>
          <TabsTrigger value="group">Group</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-4">
          <BookingCalendar
            onDateSelect={(date) => methods.setValue('scheduledAt', date)}
            selectedDate={watch('scheduledAt')}
          />
        </TabsContent>

        <TabsContent value="smart_scheduled" className="space-y-4">
          <SmartScheduler
            serviceId={watch('serviceId')}
            onRecommendationSelect={(recommendation) => {
              methods.setValue('scheduledAt', new Date(recommendation.suggestedTime));
            }}
            onGenerateRecommendations={onGenerateRecommendations}
          />
        </TabsContent>

        <TabsContent value="group" className="space-y-4">
          <GroupBookingManager
            onGroupSettingsChange={(settings) => {
              methods.setValue('groupSettings', settings);
            }}
          />
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <RecurringServiceSetup
            onRecurringSettingsChange={(settings) => {
              methods.setValue('recurringSettings', settings);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdvancedOptionsStep({ recommendations }: { recommendations: any[] }) {
  const { register, watch, setValue } = methods.useFormContext<AdvancedBookingForm>();
  const weatherSensitive = watch('weatherSensitive');
  const trafficOptimized = watch('trafficOptimized');
  const urgency = watch('urgency');

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Smart Optimization</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Configure AI-powered scheduling optimizations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather Sensitivity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cloud className="w-5 h-5" />
              Weather Consideration
            </CardTitle>
            <CardDescription>
              Optimize scheduling based on weather conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={weatherSensitive}
                onChange={(e) => setValue('weatherSensitive', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Enable weather optimization</span>
            </label>
            {weatherSensitive && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  We'll avoid scheduling outdoor services during bad weather and suggest optimal times.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Traffic Optimization */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="w-5 h-5" />
              Traffic Optimization
            </CardTitle>
            <CardDescription>
              Consider traffic conditions for provider travel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={trafficOptimized}
                onChange={(e) => setValue('trafficOptimized', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Enable traffic optimization</span>
            </label>
            {trafficOptimized && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  We'll schedule during low-traffic times to ensure timely arrivals.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Urgency Level */}
      <Card>
        <CardHeader>
          <CardTitle>Urgency Level</CardTitle>
          <CardDescription>
            How soon do you need this service?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'LOW', label: 'Low', description: 'Within a week', color: 'bg-green-100 text-green-800' },
              { value: 'MEDIUM', label: 'Medium', description: 'Within 2-3 days', color: 'bg-yellow-100 text-yellow-800' },
              { value: 'HIGH', label: 'High', description: 'ASAP (today)', color: 'bg-red-100 text-red-800' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('urgency', option.value as any)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  urgency === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="text-center space-y-2">
                  <Badge className={option.color}>{option.label}</Badge>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {option.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Recommendations Preview */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>
              Based on your preferences and smart optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => setValue('scheduledAt', new Date(rec.suggestedTime))}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {new Date(rec.suggestedTime).toLocaleDateString()} at{' '}
                        {new Date(rec.suggestedTime).toLocaleTimeString([], { 
                          hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {rec.reasoning.explanation}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {Math.round(rec.confidence * 100)}% match
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReviewStep({ serviceDetails }: { serviceDetails: any }) {
  const { watch } = methods.useFormContext<AdvancedBookingForm>();
  const formData = watch();

  const calculateTotal = () => {
    let total = serviceDetails.basePrice;
    
    if (formData.groupSettings?.groupDiscount) {
      total = total * (1 - formData.groupSettings.groupDiscount / 100);
    }
    
    return total;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Review Your Booking</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Please review all details before confirming
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Service:</span>
              <p className="font-medium">{serviceDetails.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Address:</span>
              <p className="font-medium">{formData.address}</p>
            </div>
            {formData.notes && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Notes:</span>
                <p className="font-medium">{formData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Booking Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Type:</span>
              <p className="font-medium">{formData.bookingType.replace('_', ' ')}</p>
            </div>
            {formData.scheduledAt && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Scheduled:</span>
                <p className="font-medium">
                  {formData.scheduledAt.toLocaleDateString()} at{' '}
                  {formData.scheduledAt.toLocaleTimeString([], { 
                    hour: '2-digit', minute: '2-digit' 
                  })}
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {formData.smartScheduled && (
                <Badge variant="secondary">Smart Scheduled</Badge>
              )}
              {formData.weatherSensitive && (
                <Badge variant="secondary">Weather Aware</Badge>
              )}
              {formData.trafficOptimized && (
                <Badge variant="secondary">Traffic Optimized</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Special Configurations */}
      {(formData.groupSettings || formData.recurringSettings) && (
        <Card>
          <CardHeader>
            <CardTitle>Special Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.groupSettings && (
              <div>
                <h4 className="font-medium text-lg mb-2">Group Booking</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Title:</span>
                    <p className="font-medium">{formData.groupSettings.title}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Max Participants:</span>
                    <p className="font-medium">{formData.groupSettings.maxParticipants}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Split Method:</span>
                    <p className="font-medium">{formData.groupSettings.splitMethod}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Group Discount:</span>
                    <p className="font-medium">{formData.groupSettings.groupDiscount}%</p>
                  </div>
                </div>
              </div>
            )}
            
            {formData.recurringSettings && (
              <div>
                <h4 className="font-medium text-lg mb-2">Recurring Schedule</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Frequency:</span>
                    <p className="font-medium">{formData.recurringSettings.frequency}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Interval:</span>
                    <p className="font-medium">Every {formData.recurringSettings.interval}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Start Date:</span>
                    <p className="font-medium">
                      {formData.recurringSettings.startDate.toLocaleDateString()}
                    </p>
                  </div>
                  {formData.recurringSettings.endDate && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">End Date:</span>
                      <p className="font-medium">
                        {formData.recurringSettings.endDate.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span>NPR {serviceDetails.basePrice.toLocaleString()}</span>
            </div>
            {formData.groupSettings?.groupDiscount && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Group Discount ({formData.groupSettings.groupDiscount}%):</span>
                <span>-NPR {(serviceDetails.basePrice * formData.groupSettings.groupDiscount / 100).toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>NPR {calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notices */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                Important Information
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Service confirmation is subject to provider availability</li>
                <li>• Smart scheduling recommendations may change based on real-time conditions</li>
                {formData.recurringSettings && (
                  <li>• Recurring bookings can be paused or modified anytime</li>
                )}
                {formData.groupSettings && (
                  <li>• Group members will receive invitation to join this booking</li>
                )}
                <li>• Payment will be processed after service confirmation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function getStepIcon(stepId: string) {
  switch (stepId) {
    case 'type': return <Users className="w-5 h-5" />;
    case 'details': return <MapPin className="w-5 h-5" />;
    case 'schedule': return <Calendar className="w-5 h-5" />;
    case 'advanced': return <Zap className="w-5 h-5" />;
    case 'review': return <CheckCircle className="w-5 h-5" />;
    default: return <Calendar className="w-5 h-5" />;
  }
}

function isWeatherSensitiveService(category: string): boolean {
  const weatherSensitiveCategories = [
    'gardening',
    'house-cleaning', // if outdoor areas
    'repairs', // if outdoor repairs
    'moving'
  ];
  
  return weatherSensitiveCategories.includes(category);
}