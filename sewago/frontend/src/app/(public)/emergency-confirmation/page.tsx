'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ExclamationTriangleIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

interface EmergencyBooking {
  serviceId: string;
  serviceName: string;
  category: string;
  location: {
    lat: number;
    lng: number;
  };
  isEmergency: boolean;
  timestamp: string;
}

interface Provider {
  id: string;
  name: string;
  rating: number;
  responseTime: string;
  distance: string;
  isVerified: boolean;
  specialties: string[];
}

export default function EmergencyConfirmationPage() {
  const [emergencyData, setEmergencyData] = useState<EmergencyBooking | null>(null);
  const [currentStep, setCurrentStep] = useState<'searching' | 'found' | 'assigned' | 'confirmed'>('searching');
  const [searchProgress, setSearchProgress] = useState(0);
  const [foundProviders, setFoundProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [eta, setEta] = useState<string>('Calculating...');
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    try {
      // Get emergency booking data from localStorage
      const storedData = localStorage.getItem('emergencyBooking');
      if (storedData) {
        setEmergencyData(JSON.parse(storedData));
      } else {
        // Redirect if no emergency data
        router.push('/');
        return;
      }

      // Simulate the emergency service process
      simulateEmergencyProcess();
    } catch (error) {
      console.error('Failed to load emergency data:', error);
      router.push('/');
    }
  }, [router]);

  const simulateEmergencyProcess = async () => {
    // Step 1: Searching for providers
    setCurrentStep('searching');
    
    // Simulate search progress
    for (let i = 0; i <= 100; i += 10) {
      setSearchProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Step 2: Found providers
    setCurrentStep('found');
    
    // Simulate finding providers
    const mockProviders: Provider[] = [
      {
        id: 'provider-1',
        name: 'Emergency Pro Services',
        rating: 4.8,
        responseTime: '15-20 minutes',
        distance: '0.8 km',
        isVerified: true,
        specialties: ['Emergency Response', '24/7 Service', 'Quick Fix']
      },
      {
        id: 'provider-2',
        name: 'Quick Fix Solutions',
        rating: 4.6,
        responseTime: '20-25 minutes',
        distance: '1.2 km',
        isVerified: true,
        specialties: ['Same Day Service', 'Emergency Support']
      },
      {
        id: 'provider-3',
        name: 'Reliable Emergency Team',
        rating: 4.9,
        responseTime: '18-22 minutes',
        distance: '1.5 km',
        isVerified: true,
        specialties: ['Certified Technicians', 'Insurance Accepted']
      }
    ];
    
    setFoundProviders(mockProviders);
    
    // Auto-select the best provider after a delay
    setTimeout(() => {
      setSelectedProvider(mockProviders[0]);
      setCurrentStep('assigned');
      
      // Calculate ETA
      setTimeout(() => {
        setEta('15-20 minutes');
        setCurrentStep('confirmed');
      }, 2000);
    }, 3000);
  };

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setCurrentStep('assigned');
    
    // Simulate ETA calculation
    setTimeout(() => {
      const responseTime = provider.responseTime;
      setEta(responseTime);
      setCurrentStep('confirmed');
    }, 2000);
  };

  const handleContactProvider = () => {
    // In a real app, this would initiate a call or chat
    if (typeof window !== 'undefined') {
      try {
        window.open(`tel:+9779800000001`, '_blank');
      } catch (error) {
        console.error('Failed to open phone link:', error);
      }
    }
  };

  const handleTrackService = () => {
    // Navigate to tracking page
    router.push('/tracking');
  };

  if (!emergencyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No emergency data found</h3>
          <p className="text-gray-600">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 mr-3" />
              <h1 className="text-3xl font-bold">Emergency Service Requested</h1>
            </div>
            <p className="text-red-100 text-lg">
              We're finding the best available provider for your urgent {emergencyData.serviceName} needs
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Service Status</h2>
            <div className="text-sm text-gray-500">
              {new Date(emergencyData.timestamp).toLocaleTimeString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { key: 'searching', label: 'Searching', icon: ClockIcon, active: currentStep === 'searching' },
              { key: 'found', label: 'Providers Found', icon: CheckCircleIcon, active: currentStep === 'found' || currentStep === 'assigned' || currentStep === 'confirmed' },
              { key: 'assigned', label: 'Provider Assigned', icon: UserIcon, active: currentStep === 'assigned' || currentStep === 'confirmed' },
              { key: 'confirmed', label: 'Confirmed', icon: CheckCircleSolid, active: currentStep === 'confirmed' }
            ].map((step, index) => (
              <div key={step.key} className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  step.active ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className={`text-sm font-medium ${
                  step.active ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Status */}
        {currentStep === 'searching' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Searching for Providers</h3>
              <p className="text-gray-600 mb-4">
                We're searching for the nearest available {emergencyData.serviceName} providers in your area.
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${searchProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{searchProgress}% Complete</p>
            </div>
          </div>
        )}

        {/* Providers Found */}
        {currentStep === 'found' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Providers Found</h3>
            <div className="space-y-4">
              {foundProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedProvider?.id === provider.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleProviderSelect(provider)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                          {provider.isVerified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                            {provider.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {provider.responseTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            {provider.distance}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {provider.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {selectedProvider?.id === provider.id && (
                      <CheckCircleIcon className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Provider Assigned */}
        {currentStep === 'assigned' && selectedProvider && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Provider Assigned!</h3>
              <p className="text-gray-600 mb-4">
                {selectedProvider.name} has been assigned to your emergency service request.
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  Calculating estimated arrival time...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Service Confirmed */}
        {currentStep === 'confirmed' && selectedProvider && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleSolid className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Service Confirmed!</h3>
              <p className="text-gray-600 mb-6">
                Your {emergencyData.serviceName} request has been confirmed and a provider is on the way.
              </p>
              
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                  <ClockIcon className="w-5 h-5" />
                  <span className="font-semibold">Estimated Arrival Time: {eta}</span>
                </div>
                <p className="text-sm text-green-600">
                  {selectedProvider.name} will arrive at your location within {eta}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleContactProvider}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <PhoneIcon className="w-4 h-4" />
                  Contact Provider
                </button>
                <button
                  onClick={handleTrackService}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MapPinIcon className="w-4 h-4" />
                  Track Service
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Service Information</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Service:</span> {emergencyData.serviceName}</p>
                <p><span className="font-medium">Category:</span> {emergencyData.category}</p>
                <p><span className="font-medium">Type:</span> Emergency Service</p>
                <p><span className="font-medium">Requested:</span> {new Date(emergencyData.timestamp).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Location</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Latitude:</span> {emergencyData.location.lat.toFixed(6)}</p>
                <p><span className="font-medium">Longitude:</span> {emergencyData.location.lng.toFixed(6)}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    currentStep === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentStep === 'confirmed' ? 'Confirmed' : 'In Progress'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
