'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Repeat, MapPin, Smartphone, Zap, Target, TrendingUp, Settings, Plus, Minus, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
// Mock useAuth hook for development
const useAuth = () => ({ user: { id: 'mock-user-id', name: 'Mock User', email: 'mock@example.com' } });

interface Service {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  estimatedDuration: number;
}

interface SmartSchedulingOptions {
  preferredTimes: Array<{
    start: string;
    end: string;
    priority: number;
  }>;
  weatherSensitive: boolean;
  trafficOptimized: boolean;
  flexibilityHours: number;
}

interface GroupBooking {
  isGroup: boolean;
  participants: Array<{
    name: string;
    email: string;
    phone: string;
    shareAmount: number;
  }>;
  splitMethod: 'EQUAL' | 'PERCENTAGE' | 'CUSTOM' | 'BY_SERVICE';
  groupDiscount: number;
}

interface RecurringBooking {
  isRecurring: boolean;
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'CUSTOM';
  interval: number;
  startDate: string;
  endDate: string;
}

export default function SmartBookingWizard() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'>('MEDIUM');
  
  // Smart scheduling options
  const [smartScheduling, setSmartScheduling] = useState<SmartSchedulingOptions>({
    preferredTimes: [],
    weatherSensitive: false,
    trafficOptimized: true,
    flexibilityHours: 24
  });
  
  // Group booking options
  const [groupBooking, setGroupBooking] = useState<GroupBooking>({
    isGroup: false,
    participants: [],
    splitMethod: 'EQUAL',
    groupDiscount: 0
  });
  
  // Recurring booking options
  const [recurringBooking, setRecurringBooking] = useState<RecurringBooking>({
    isRecurring: false,
    frequency: 'WEEKLY',
    interval: 1,
    startDate: '',
    endDate: ''
  });

  const [availableServices] = useState<Service[]>([
    { id: '1', name: 'House Cleaning', category: 'Cleaning', basePrice: 1500, estimatedDuration: 120 },
    { id: '2', name: 'Electrical Work', category: 'Electrical', basePrice: 800, estimatedDuration: 60 },
    { id: '3', name: 'Plumbing', category: 'Plumbing', basePrice: 1200, estimatedDuration: 90 },
    { id: '4', name: 'Gardening', category: 'Landscaping', basePrice: 1000, estimatedDuration: 120 }
  ]);

  const [recommendedSlots, setRecommendedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedService && selectedDate) {
      generateRecommendedSlots();
    }
  }, [selectedService, selectedDate]);

  const generateRecommendedSlots = async () => {
    try {
      setIsLoading(true);
      
      // Mock API call to get smart scheduling recommendations
      const response = await fetch('/api/ai/scheduling-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          serviceId: selectedService?.id,
          date: selectedDate,
          preferences: smartScheduling
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendedSlots(data.recommendations || ['09:00', '11:00', '14:00', '16:00']);
      } else {
        // Fallback to default slots
        setRecommendedSlots(['09:00', '11:00', '14:00', '16:00']);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendedSlots(['09:00', '11:00', '14:00', '16:00']);
    } finally {
      setIsLoading(false);
    }
  };

  const addPreferredTime = () => {
    setSmartScheduling(prev => ({
      ...prev,
      preferredTimes: [...prev.preferredTimes, { start: '09:00', end: '10:00', priority: 1 }]
    }));
  };

  const removePreferredTime = (index: number) => {
    setSmartScheduling(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes.filter((_, i) => i !== index)
    }));
  };

  const updatePreferredTime = (index: number, field: 'start' | 'end' | 'priority', value: string | number) => {
    setSmartScheduling(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes.map((time, i) => 
        i === index ? { ...time, [field]: value } : time
      )
    }));
  };

  const addParticipant = () => {
    setGroupBooking(prev => ({
      ...prev,
      participants: [...prev.participants, { name: '', email: '', phone: '', shareAmount: 0 }]
    }));
  };

  const removeParticipant = (index: number) => {
    setGroupBooking(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
  };

  const updateParticipant = (index: number, field: keyof GroupBooking['participants'][0], value: string | number) => {
    setGroupBooking(prev => ({
      ...prev,
      participants: prev.participants.map((participant, i) => 
        i === index ? { ...participant, [field]: value } : participant
      )
    }));
  };

  const calculateGroupPricing = () => {
    if (!selectedService || !groupBooking.isGroup) return { total: 0, perPerson: 0 };
    
    const baseTotal = selectedService.basePrice;
    const discountAmount = (baseTotal * groupBooking.groupDiscount) / 100;
    const finalTotal = baseTotal - discountAmount;
    const perPerson = finalTotal / Math.max(groupBooking.participants.length, 1);
    
    return { total: finalTotal, perPerson };
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !address) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      const bookingData = {
        serviceId: selectedService.id,
        scheduledAt: `${selectedDate}T${selectedTime}:00`,
        address,
        notes,
        urgency,
        basePrice: selectedService.basePrice,
        total: calculateGroupPricing().total || selectedService.basePrice,
        
        // Smart scheduling
        smartScheduling: {
          enabled: smartScheduling.preferredTimes.length > 0,
          ...smartScheduling
        },
        
        // Group booking
        groupBooking: {
          isGroup: groupBooking.isGroup,
          participants: groupBooking.participants,
          splitMethod: groupBooking.splitMethod,
          groupDiscount: groupBooking.groupDiscount
        },
        
        // Recurring booking
        recurring: {
          isRecurring: recurringBooking.isRecurring,
          frequency: recurringBooking.frequency,
          interval: recurringBooking.interval,
          startDate: recurringBooking.startDate,
          endDate: recurringBooking.endDate
        }
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        toast.success('Booking created successfully!');
        // Reset form or redirect
      } else {
        toast.error('Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Booking Wizard</h1>
        <p className="text-gray-600">Book services with intelligent scheduling, group options, and recurring plans</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Service & Time</span>
          <span>Smart Options</span>
          <span>Group & Recurring</span>
          <span>Review & Book</span>
        </div>
      </div>

      <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
        <TabsContent value="1" className="space-y-6">
          {/* Step 1: Service Selection and Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Select Service & Time
              </CardTitle>
              <CardDescription>Choose your service and preferred scheduling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableServices.map((service) => (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all ${
                        selectedService?.id === service.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <p className="text-sm text-gray-500">{service.category}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{service.basePrice} NPR</div>
                            <div className="text-xs text-gray-500">{service.estimatedDuration} min</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Date and Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose time" />
                    </SelectTrigger>
                    <SelectContent>
                      {recommendedSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address and Notes */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Address</label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements or instructions"
                  />
                </div>
              </div>

              {/* Urgency Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                <Select value={urgency} onValueChange={(value: any) => setUrgency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low - Flexible timing</SelectItem>
                    <SelectItem value="MEDIUM">Medium - Standard priority</SelectItem>
                    <SelectItem value="HIGH">High - Urgent service needed</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency - Immediate attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2" className="space-y-6">
          {/* Step 2: Smart Scheduling Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Smart Scheduling Options
              </CardTitle>
              <CardDescription>Optimize your booking with AI-powered recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preferred Time Slots */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Preferred Time Slots</label>
                  <Button onClick={addPreferredTime} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Time
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {smartScheduling.preferredTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Input
                        type="time"
                        value={time.start}
                        onChange={(e) => updatePreferredTime(index, 'start', e.target.value)}
                        className="w-24"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        value={time.end}
                        onChange={(e) => updatePreferredTime(index, 'end', e.target.value)}
                        className="w-24"
                      />
                      <Select
                        value={time.priority.toString()}
                        onValueChange={(value) => updatePreferredTime(index, 'priority', parseInt(value))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => removePreferredTime(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {smartScheduling.preferredTimes.length === 0 && (
                    <p className="text-gray-500 text-sm">No preferred times set. We'll suggest optimal slots.</p>
                  )}
                </div>
              </div>

              {/* Smart Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="weatherSensitive"
                    checked={smartScheduling.weatherSensitive}
                    onChange={(e) => setSmartScheduling(prev => ({ ...prev, weatherSensitive: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="weatherSensitive" className="text-sm text-gray-700">
                    Weather Sensitive
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="trafficOptimized"
                    checked={smartScheduling.trafficOptimized}
                    onChange={(e) => setSmartScheduling(prev => ({ ...prev, trafficOptimized: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="trafficOptimized" className="text-sm text-gray-700">
                    Traffic Optimized
                  </label>
                </div>
              </div>

              {/* Flexibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flexibility (hours before/after preferred time)
                </label>
                <Select
                  value={smartScheduling.flexibilityHours.toString()}
                  onValueChange={(value) => setSmartScheduling(prev => ({ ...prev, flexibilityHours: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* AI Recommendations */}
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Generating smart recommendations...</p>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">AI Recommendations</h4>
                  <p className="text-sm text-blue-700">
                    Based on your preferences, we recommend booking during low-traffic hours 
                    and avoiding weather-sensitive times for optimal service delivery.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="3" className="space-y-6">
          {/* Step 3: Group and Recurring Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Group Booking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Group Booking
                </CardTitle>
                <CardDescription>Book for multiple people and split costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isGroup"
                    checked={groupBooking.isGroup}
                    onChange={(e) => setGroupBooking(prev => ({ ...prev, isGroup: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isGroup" className="text-sm text-gray-700">
                    Enable Group Booking
                  </label>
                </div>

                {groupBooking.isGroup && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Split Method</label>
                      <Select
                        value={groupBooking.splitMethod}
                        onValueChange={(value: any) => setGroupBooking(prev => ({ ...prev, splitMethod: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EQUAL">Equal Split</SelectItem>
                          <SelectItem value="PERCENTAGE">Percentage Based</SelectItem>
                          <SelectItem value="CUSTOM">Custom Amounts</SelectItem>
                          <SelectItem value="BY_SERVICE">By Service Type</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Group Discount (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={groupBooking.groupDiscount}
                        onChange={(e) => setGroupBooking(prev => ({ ...prev, groupDiscount: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Participants</label>
                        <Button onClick={addParticipant} size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Person
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {groupBooking.participants.map((participant, index) => (
                          <div key={index} className="p-3 border rounded-lg space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Name"
                                value={participant.name}
                                onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                              />
                              <Input
                                placeholder="Email"
                                type="email"
                                value={participant.email}
                                onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Phone"
                                value={participant.phone}
                                onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                              />
                              <Input
                                placeholder="Share Amount"
                                type="number"
                                value={participant.shareAmount}
                                onChange={(e) => updateParticipant(index, 'shareAmount', parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <Button
                              onClick={() => removeParticipant(index)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 w-full"
                            >
                              <Minus className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recurring Booking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="w-5 h-5" />
                  Recurring Service
                </CardTitle>
                <CardDescription>Set up regular service appointments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={recurringBooking.isRecurring}
                    onChange={(e) => setRecurringBooking(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isRecurring" className="text-sm text-gray-700">
                    Enable Recurring Service
                  </label>
                </div>

                {recurringBooking.isRecurring && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                      <Select
                        value={recurringBooking.frequency}
                        onValueChange={(value: any) => setRecurringBooking(prev => ({ ...prev, frequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WEEKLY">Weekly</SelectItem>
                          <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                          <SelectItem value="MONTHLY">Monthly</SelectItem>
                          <SelectItem value="CUSTOM">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Interval</label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={recurringBooking.interval}
                        onChange={(e) => setRecurringBooking(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
                        placeholder="1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <Input
                          type="date"
                          value={recurringBooking.startDate}
                          onChange={(e) => setRecurringBooking(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <Input
                          type="date"
                          value={recurringBooking.endDate}
                          onChange={(e) => setRecurringBooking(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="4" className="space-y-6">
          {/* Step 4: Review and Book */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Review & Confirm
              </CardTitle>
              <CardDescription>Review your booking details before confirming</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Service Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Service:</span>
                    <span className="ml-2 font-medium">{selectedService?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium">{selectedDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <span className="ml-2 font-medium">{selectedTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <span className="ml-2 font-medium">{address}</span>
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">Pricing Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Base Price:</span>
                    <span className="font-medium">{selectedService?.basePrice} NPR</span>
                  </div>
                  
                  {groupBooking.isGroup && groupBooking.groupDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Group Discount ({groupBooking.groupDiscount}%):</span>
                      <span className="font-medium text-green-600">
                        -{((selectedService?.basePrice || 0) * groupBooking.groupDiscount / 100)} NPR
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-blue-900">Total:</span>
                      <span className="text-blue-900">{calculateGroupPricing().total || selectedService?.basePrice} NPR</span>
                    </div>
                    
                    {groupBooking.isGroup && groupBooking.participants.length > 0 && (
                      <div className="text-sm text-blue-700 mt-1">
                        Per person: {calculateGroupPricing().perPerson.toFixed(2)} NPR
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Features */}
              {(smartScheduling.preferredTimes.length > 0 || groupBooking.isGroup || recurringBooking.isRecurring) && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-3">Special Features</h4>
                  <div className="space-y-2">
                    {smartScheduling.preferredTimes.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Zap className="w-4 h-4" />
                        <span>Smart scheduling with {smartScheduling.preferredTimes.length} preferred time slots</span>
                      </div>
                    )}
                    {groupBooking.isGroup && (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Users className="w-4 h-4" />
                        <span>Group booking for {groupBooking.participants.length} participants</span>
                      </div>
                    )}
                    {recurringBooking.isRecurring && (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Repeat className="w-4 h-4" />
                        <span>Recurring service every {recurringBooking.interval} {recurringBooking.frequency.toLowerCase()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded border-gray-300 mt-1"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the terms and conditions and confirm that all information provided is accurate.
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          onClick={prevStep}
          disabled={currentStep === 1}
          variant="outline"
        >
          Previous
        </Button>
        
        {currentStep < 4 ? (
          <Button onClick={nextStep} disabled={!selectedService || !selectedDate}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Creating Booking...' : 'Confirm Booking'}
          </Button>
        )}
      </div>
    </div>
  );
}
