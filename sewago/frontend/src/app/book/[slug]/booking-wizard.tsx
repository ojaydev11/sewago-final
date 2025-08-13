'use client';

import { useState } from 'react';
import { Service } from '@/models/Service';
import { BookingFormData, PaymentMethod } from '@/models/Booking';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { Button } from '@/components/ui/button';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  CreditCardIcon,
  BanknotesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface BookingWizardProps {
  service: Service;
}

const CITIES = ['Kathmandu', 'Lalitpur', 'Bhaktapur'] as const;
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function BookingWizard({ service }: BookingWizardProps) {
  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    serviceName: service.name,
    servicePrice: service.price.min,
    paymentMethod: 'COD' as PaymentMethod
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          paymentStatus: 'PendingCollection',
          status: 'Requested'
        })
      });

      if (response.ok) {
        // Redirect to confirmation page
        window.location.href = '/booking/confirmation';
      }
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <CalendarIcon className="w-5 h-5" />
        Select Date & Time
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={formData.scheduledDate || ''}
            onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Time Slot</label>
          <select
            value={formData.scheduledTime || ''}
            onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select time</option>
            {TIME_SLOTS.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MapPinIcon className="w-5 h-5" />
        Service Location
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <select
            value={formData.city || ''}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select city</option>
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Full Address</label>
          <textarea
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Street address, house/apartment number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Landmark (Optional)</label>
          <input
            type="text"
            value={formData.landmark || ''}
            onChange={(e) => handleInputChange('landmark', e.target.value)}
            placeholder="Nearby landmark for easy location"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Contact Information</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            value={formData.customerName || ''}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.customerPhone || ''}
            onChange={(e) => handleInputChange('customerPhone', e.target.value)}
            placeholder="+977-"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email Address</label>
        <input
          type="email"
          value={formData.customerEmail || ''}
          onChange={(e) => handleInputChange('customerEmail', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Special Instructions (Optional)</label>
        <textarea
          value={formData.specialInstructions || ''}
          onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
          placeholder="Any specific requirements or instructions"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <CreditCardIcon className="w-5 h-5" />
        Payment Method
      </h3>

      <div className="space-y-4">
        {/* Cash on Delivery */}
        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
            formData.paymentMethod === 'COD' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleInputChange('paymentMethod', 'COD')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BanknotesIcon className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-medium">Cash on Service Delivery</h4>
                <p className="text-sm text-gray-600">Pay after service completion</p>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={formData.paymentMethod === 'COD'}
              readOnly
              className="w-4 h-4 text-blue-600"
            />
          </div>
        </div>

        {/* eSewa (Coming Soon) */}
        <div className={`border-2 rounded-lg p-4 opacity-50 ${
          isFeatureEnabled('PAYMENTS_ESEWA_ENABLED') 
            ? 'cursor-pointer hover:border-gray-300' 
            : 'cursor-not-allowed'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCardIcon className="w-6 h-6 text-purple-600" />
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  eSewa
                  {!isFeatureEnabled('PAYMENTS_ESEWA_ENABLED') && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
                  )}
                </h4>
                <p className="text-sm text-gray-600">Digital wallet payment</p>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              value="ESEWA"
              disabled={!isFeatureEnabled('PAYMENTS_ESEWA_ENABLED')}
              className="w-4 h-4 text-purple-600"
            />
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Price Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Service</span>
            <span>NPR {service.price.min.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-medium">
            <span>Total Amount</span>
            <span>NPR {service.price.min.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
          <InformationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>Payment will be collected after service completion. Our team will contact you to confirm the booking.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Schedule</span>
          <span>Location</span>
          <span>Contact</span>
          <span>Payment</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            disabled={
              (currentStep === 1 && (!formData.scheduledDate || !formData.scheduledTime)) ||
              (currentStep === 2 && (!formData.city || !formData.address)) ||
              (currentStep === 3 && (!formData.customerName || !formData.customerPhone || !formData.customerEmail))
            }
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.paymentMethod}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </Button>
        )}
      </div>
    </div>
  );
}