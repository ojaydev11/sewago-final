'use client';

import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface EmergencyServiceButtonProps {
  className?: string;
}

interface EmergencyService {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  estimatedResponseTime: string;
}

const emergencyServices: EmergencyService[] = [
  {
    id: 'emergency-plumbing',
    name: 'Emergency Plumbing',
    category: 'plumbing',
    icon: '🚰',
    description: 'Burst pipes, blocked drains, water leaks',
    estimatedResponseTime: '15-30 minutes'
  },
  {
    id: 'emergency-electrical',
    name: 'Emergency Electrical',
    category: 'electrical',
    icon: '⚡',
    description: 'Power outages, electrical faults, safety issues',
    estimatedResponseTime: '20-45 minutes'
  },
  {
    id: 'emergency-locksmith',
    name: 'Emergency Locksmith',
    category: 'locksmith',
    icon: '🔑',
    description: 'Locked out, broken locks, security issues',
    estimatedResponseTime: '25-40 minutes'
  },
  {
    id: 'emergency-cleaning',
    name: 'Emergency Cleaning',
    category: 'cleaning',
    icon: '🧹',
    description: 'Flood damage, accident cleanup, urgent cleaning',
    estimatedResponseTime: '30-60 minutes'
  }
];

export default function EmergencyServiceButton({ className = '' }: EmergencyServiceButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Get user location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setLocationError('Unable to get your location. Please enter manually.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleEmergencyClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      // Add pulsing animation class
      document.body.classList.add('emergency-active');
    }
  };

  const handleServiceSelect = (service: EmergencyService) => {
    setSelectedService(service);
  };

  const handleEmergencyBooking = async () => {
    if (!selectedService || !userLocation) return;

    setIsProcessing(true);
    
    try {
      // Simulate emergency booking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store emergency booking data
      const emergencyData = {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        category: selectedService.category,
        location: userLocation,
        isEmergency: true,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('emergencyBooking', JSON.stringify(emergencyData));
      
      // Navigate to emergency booking confirmation
      router.push('/emergency-confirmation');
      
    } catch (error) {
      console.error('Emergency booking failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const closeEmergency = () => {
    setIsExpanded(false);
    setSelectedService(null);
    document.body.classList.remove('emergency-active');
  };

  return (
    <>
      {/* Main Emergency Button */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={handleEmergencyClick}
          className="group relative bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 animate-pulse"
          disabled={isProcessing}
        >
          <ExclamationTriangleIcon className="w-8 h-8" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Need help now? Emergency services
          </div>
        </button>
      </div>

      {/* Emergency Service Modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-8 h-8" />
                  <div>
                    <h2 className="text-xl font-bold">Emergency Service</h2>
                    <p className="text-red-100 text-sm">Quick response for urgent needs</p>
                  </div>
                </div>
                <button
                  onClick={closeEmergency}
                  className="text-red-100 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {!selectedService ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      What emergency service do you need?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Select the service type and we'll find the nearest available provider.
                    </p>
                  </div>

                  {/* Service Options */}
                  <div className="space-y-3">
                    {emergencyServices.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className="w-full p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all duration-200 text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{service.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-red-700">
                              {service.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {service.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <ClockIcon className="w-4 h-4" />
                              <span>Response: {service.estimatedResponseTime}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{selectedService.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedService.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedService.description}
                        </p>
                      </div>
                    </div>

                    {/* Location Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="font-medium">Your Location</span>
                      </div>
                      {userLocation ? (
                        <div className="text-sm text-gray-600">
                          <p>Latitude: {userLocation.lat.toFixed(6)}</p>
                          <p>Longitude: {userLocation.lng.toFixed(6)}</p>
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">
                          {locationError || 'Getting your location...'}
                        </div>
                      )}
                    </div>

                    {/* Response Time */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <ClockIcon className="w-4 h-4" />
                        <span className="font-medium">
                          Estimated Response Time: {selectedService.estimatedResponseTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedService(null)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleEmergencyBooking}
                      disabled={!userLocation || isProcessing}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <PhoneIcon className="w-4 h-4" />
                          Book Emergency Service
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for emergency animation */}
      <style jsx global>{`
        .emergency-active .emergency-button {
          animation: emergency-pulse 1s infinite;
        }
        
        @keyframes emergency-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(220, 38, 38, 0);
          }
        }
      `}</style>
    </>
  );
}
