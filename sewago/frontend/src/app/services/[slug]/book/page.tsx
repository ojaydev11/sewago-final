'use client';

import { useState } from 'react';

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = 'force-dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, MapPin, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface BookingFormData {
  date: Date | undefined;
  timeSlot: string;
  address: string;
  notes: string;
}

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM'
];

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    date: undefined,
    timeSlot: '',
    address: '',
    notes: ''
  });

  const slug = params.slug as string;

  // Redirect if not authenticated
  if (!session?.user) {
    router.push(`/auth/login?callbackUrl=/services/${slug}/book`);
    return null;
  }

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const canProceedToStep2 = formData.date && formData.timeSlot;
  const canSubmit = canProceedToStep2 && formData.address.trim();

  const handleNext = () => {
    if (canProceedToStep2) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceSlug: slug,
          date: formData.date,
          timeSlot: formData.timeSlot,
          address: formData.address,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        const { booking } = await response.json();
        toast.success('Booking created successfully!');
        router.push(`/dashboard?booking=${booking._id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book Your Service
          </h1>
          <p className="text-gray-600">
            Complete your booking in just a few simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep >= 1 ? 'border-primary bg-primary text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Date & Time</span>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-300"></div>
            
            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep >= 2 ? 'border-primary bg-primary text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Details</span>
            </div>
          </div>
        </div>

        {/* Step 1: Date & Time Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Select Date & Time
              </CardTitle>
              <CardDescription>
                Choose when you'd like the service to be performed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div>
                <Label htmlFor="date" className="text-base font-medium">
                  Select Date
                </Label>
                <div className="mt-2">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => handleInputChange('date', date)}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>
              </div>

              {/* Time Slot Selection */}
              <div>
                <Label htmlFor="timeSlot" className="text-base font-medium">
                  Select Time Slot
                </Label>
                <Select value={formData.timeSlot} onValueChange={(value) => handleInputChange('timeSlot', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Date & Time Summary */}
              {formData.date && formData.timeSlot && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Selected Schedule:</span>
                  </div>
                  <p className="text-blue-700 mt-1">
                    {format(formData.date, 'EEEE, MMMM do, yyyy')} at {formData.timeSlot}
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleNext}
                  disabled={!canProceedToStep2}
                  className="bg-primary hover:bg-primary/90"
                >
                  Continue to Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Address & Notes */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Service Details
              </CardTitle>
              <CardDescription>
                Provide the address and any additional notes for the service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Address Input */}
              <div>
                <Label htmlFor="address" className="text-base font-medium">
                  Service Address *
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter the complete address where the service should be performed"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-2 min-h-[100px]"
                  required
                />
              </div>

              {/* Notes Input */}
              <div>
                <Label htmlFor="notes" className="text-base font-medium">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or requirements for the service provider"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="mt-2 min-h-[100px]"
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">
                      {formData.date ? format(formData.date, 'MMM do, yyyy') : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">{formData.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Address:</span>
                    <span className="font-medium text-right max-w-xs truncate">
                      {formData.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
