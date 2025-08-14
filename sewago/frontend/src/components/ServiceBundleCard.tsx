'use client';

import React, { useState } from 'react';
import { ServiceBundle, BundleService } from '../models/ServiceBundle';
import { CheckIcon, XMarkIcon, TagIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

interface ServiceBundleCardProps {
  bundle: ServiceBundle;
  onSelect: (bundle: ServiceBundle, selectedServices: BundleService[]) => void;
  isSelected?: boolean;
}

export default function ServiceBundleCard({ bundle, onSelect, isSelected = false }: ServiceBundleCardProps) {
  const [selectedServices, setSelectedServices] = useState<BundleService[]>(
    bundle.services.filter(service => service.isRequired)
  );

  const handleServiceToggle = (service: BundleService) => {
    if (service.isRequired) return; // Required services cannot be toggled
    
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.serviceId === service.serviceId);
      if (isSelected) {
        return prev.filter(s => s.serviceId !== service.serviceId);
      } else {
        return [...prev, service];
      }
    });
  };

  const calculateSelectedPrice = () => {
    const selectedTotal = selectedServices.reduce((sum, service) => sum + service.individualPrice, 0);
    const originalTotal = bundle.services.reduce((sum, service) => sum + service.individualPrice, 0);
    const discount = originalTotal - bundle.discountedPrice;
    const discountRatio = discount / originalTotal;
    return selectedTotal - (selectedTotal * discountRatio);
  };

  const selectedPrice = calculateSelectedPrice();
  const savings = selectedServices.reduce((sum, service) => sum + service.individualPrice, 0) - selectedPrice;

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{bundle.name}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{bundle.description}</p>
          </div>
          {bundle.discountPercentage > 0 && (
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
              {bundle.discountPercentage}% OFF
            </div>
          )}
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {bundle.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              ₹{selectedPrice.toLocaleString()}
            </span>
            {savings > 0 && (
              <span className="text-lg text-gray-500 line-through">
                ₹{selectedServices.reduce((sum, service) => sum + service.individualPrice, 0).toLocaleString()}
              </span>
            )}
          </div>
          {savings > 0 && (
            <div className="text-green-600 text-sm font-semibold">
              Save ₹{savings.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Services List */}
      <div className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-blue-500" />
          Services Included
        </h4>
        
        <div className="space-y-3 mb-6">
          {bundle.services.map((service) => {
            const isServiceSelected = selectedServices.some(s => s.serviceId === service.serviceId);
            const isRequired = service.isRequired;
            
            return (
              <div
                key={service.serviceId}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isServiceSelected 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isRequired 
                      ? 'border-blue-500 bg-blue-500' 
                      : isServiceSelected 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                  }`}>
                    {isRequired || isServiceSelected ? (
                      <CheckIcon className="w-3 h-3 text-white" />
                    ) : (
                      <XMarkIcon className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{service.serviceName}</span>
                      {isRequired && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {service.estimatedDuration} min
                      </span>
                      <span>₹{service.individualPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {!isRequired && (
                  <button
                    onClick={() => handleServiceToggle(service)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      isServiceSelected
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isServiceSelected ? 'Remove' : 'Add'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelect(bundle, selectedServices)}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            isSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
          }`}
        >
          {isSelected ? 'Selected' : `Book Bundle for ₹${selectedPrice.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}
