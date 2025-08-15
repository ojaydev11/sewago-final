'use client';

import React, { useState } from 'react';
import { ServiceBundle, BundleService } from '../../models/ServiceBundle';
import { sampleServiceBundles } from '../../models/ServiceBundle';
import ServiceBundleCard from '../../components/ServiceBundleCard';
import { useRouter } from 'next/navigation';
import { formatNPR } from '@/lib/currency';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  SparklesIcon,
  TagIcon,
  ClockIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';

export default function ServiceBundlesPage() {
  const [selectedBundle, setSelectedBundle] = useState<ServiceBundle | null>(null);
  const [selectedServices, setSelectedServices] = useState<BundleService[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price' | 'discount' | 'name'>('price');
  const router = useRouter();

  const categories = [
    { id: 'all', name: 'All Categories', count: sampleServiceBundles.length },
    { id: 'home_setup', name: 'Home Setup', count: sampleServiceBundles.filter(b => b.category === 'home_setup').length },
    { id: 'office_maintenance', name: 'Office Maintenance', count: sampleServiceBundles.filter(b => b.category === 'office_maintenance').length },
    { id: 'emergency', name: 'Emergency Services', count: sampleServiceBundles.filter(b => b.category === 'emergency').length }
  ];

  const filteredBundles = sampleServiceBundles
    .filter(bundle => {
      const matchesSearch = bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bundle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bundle.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || bundle.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.discountedPrice - b.discountedPrice;
        case 'discount':
          return b.discountPercentage - a.discountPercentage;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleBundleSelect = (bundle: ServiceBundle, services: BundleService[]) => {
    setSelectedBundle(bundle);
    setSelectedServices(services);
  };

  const handleBookBundle = () => {
    if (!selectedBundle) return;
    
    // Store selected bundle data in localStorage or state management
    const bundleOrder = {
      bundleId: selectedBundle.id,
      bundleName: selectedBundle.name,
      services: selectedServices,
      totalAmount: selectedServices.reduce((sum, service) => sum + service.individualPrice, 0),
      finalAmount: selectedServices.reduce((sum, service) => sum + service.individualPrice, 0) - 
                  (selectedServices.reduce((sum, service) => sum + service.individualPrice, 0) * selectedBundle.discountPercentage / 100)
    };
    
    localStorage.setItem('selectedBundleOrder', JSON.stringify(bundleOrder));
    
    // Navigate to booking page
    router.push('/book?type=bundle');
  };

  const totalSavings = sampleServiceBundles.reduce((sum, bundle) => {
    return sum + (bundle.originalPrice - bundle.discountedPrice);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <SparklesIcon className="w-8 h-8 mr-3" />
              <h1 className="text-4xl font-bold">Service Bundles</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Save time and money with our curated service packages. Book multiple services together 
              and enjoy exclusive discounts on professional home and office solutions.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{sampleServiceBundles.length}</div>
                <div className="text-blue-100">Available Bundles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{formatNPR(totalSavings)}</div>
                <div className="text-blue-100">Total Savings</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">20%</div>
                <div className="text-blue-100">Average Discount</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bundles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'discount' | 'name')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="price">Sort by Price</option>
              <option value="discount">Sort by Discount</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSortBy('price');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Selected Bundle Summary */}
        {selectedBundle && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Selected Bundle: {selectedBundle.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-blue-700">
                  <span className="flex items-center gap-1">
                    <TagIcon className="w-4 h-4" />
                    {selectedServices.length} services
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {selectedServices.reduce((sum, service) => sum + service.estimatedDuration, 0)} min total
                  </span>
                  <span className="flex items-center gap-1">
                    <CurrencyRupeeIcon className="w-4 h-4" />
                    {formatNPR(selectedServices.reduce((sum, service) => sum + service.individualPrice, 0))} total
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-blue-600">Final Price</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatNPR(selectedServices.reduce((sum, service) => sum + service.individualPrice, 0) - 
                      (selectedServices.reduce((sum, service) => sum + service.individualPrice, 0) * selectedBundle.discountPercentage / 100)
                    )}
                  </div>
                </div>
                <button
                  onClick={handleBookBundle}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bundles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredBundles.map((bundle) => (
            <ServiceBundleCard
              key={bundle.id}
              bundle={bundle}
              onSelect={handleBundleSelect}
              isSelected={selectedBundle?.id === bundle.id}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredBundles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FunnelIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bundles found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find the perfect service bundle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
