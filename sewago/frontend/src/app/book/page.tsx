'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface Service {
  _id: string;
  slug: string;
  name: string;
  category: string;
  basePrice: number;
}

interface BookingForm {
  serviceId: string;
  date: Date | undefined;
  timeSlot: string;
  address: string;
  notes: string;
}

const timeSlots = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '01:00 PM - 03:00 PM',
  '03:00 PM - 05:00 PM',
  '05:00 PM - 07:00 PM',
];

export default function BookingPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [service, setService] = useState<Service | null>(null);
  
  const [formData, setFormData] = useState<BookingForm>({
    serviceId: '',
    date: undefined,
    timeSlot: '',
    address: '',
    notes: '',
  });

  // Get service from URL params
  const serviceSlug = searchParams.get('service');

  useEffect(() => {
    if (serviceSlug) {
      fetchService();
    }
  }, [serviceSlug]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login?redirect=/book');
      return;
    }
    
    if (session.user.role !== 'customer') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${serviceSlug}`);
      if (response.ok) {
        const data = await response.json();
        setService(data.service);
        setFormData(prev => ({ ...prev, serviceId: data.service._id }));
      }
    } catch (error) {
      console.error('Error fetching service:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.date || !formData.timeSlot || !formData.address) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard?booking=${data.booking._id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create booking');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></Loader2>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'customer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Book Your Service
            </h1>
            <p className="text-gray-600">
              {service ? `Booking: ${service.name}` : 'Select a service to continue'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step <= currentStep 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {step < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="grid grid-cols-3 gap-4 mb-8 text-center text-sm">
            <div className={currentStep >= 1 ? 'text-primary font-medium' : 'text-gray-500'}>
              Date & Time
            </div>
            <div className={currentStep >= 2 ? 'text-primary font-medium' : 'text-gray-500'}>
              Location & Notes
            </div>
            <div className={currentStep >= 3 ? 'text-primary font-medium' : 'text-gray-500'}>
              Review & Confirm
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Date & Time */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Select Date & Time
                  </CardTitle>
                  <CardDescription>
                    Choose when you'd like the service to be performed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Select Time Slot</Label>
                    <Select 
                      value={formData.timeSlot} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, timeSlot: value }))}
                    >
                      <SelectTrigger>
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
                </CardContent>
              </Card>
            )}

            {/* Step 2: Location & Notes */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location & Additional Details
                  </CardTitle>
                  <CardDescription>
                    Provide your address and any special requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">Service Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter the complete address where the service should be performed"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions, requirements, or additional information..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review & Confirm */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Review & Confirm
                  </CardTitle>
                  <CardDescription>
                    Review your booking details before confirming
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {service && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Service Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Service:</span>
                          <p className="font-medium">{service.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <p className="font-medium">{service.category}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Base Price:</span>
                          <p className="font-medium text-primary">₹{service.basePrice}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <p className="font-medium">
                          {formData.date ? format(formData.date, 'PPP') : 'Not selected'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <p className="font-medium">{formData.timeSlot || 'Not selected'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Address:</span>
                        <p className="font-medium">{formData.address || 'Not provided'}</p>
                      </div>
                      {formData.notes && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Notes:</span>
                          <p className="font-medium">{formData.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 text-red-600 text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && (!formData.date || !formData.timeSlot)) ||
                    (currentStep === 2 && !formData.address)
                  }
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
