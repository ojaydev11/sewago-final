'use client';

import React, { useState } from 'react';
import ServiceBundleCard from '@/components/ServiceBundleCard';

// Local type definition to avoid DB imports
interface ServiceBundle {
  id: string;
  name: string;
  description: string;
  services: Array<{
    serviceId: string;
    serviceName: string;
    serviceCategory: string;
    estimatedDuration: number;
    individualPrice: number;
    isRequired: boolean;
  }>;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
import { formatNPR } from '@/lib/currency';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Sparkles,
  Tag,
  Clock,
  IndianRupee
} from 'lucide-react';

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic';

// Mock data for build-time safety using the correct interface
const mockBundles: ServiceBundle[] = [
  {
    id: 'spring-cleaning-bundle',
    name: 'Spring Cleaning Bundle',
    description: 'Complete home cleaning package including deep cleaning, window washing, and organization',
    services: [
      { serviceId: 'house-cleaning', serviceName: 'House Cleaning', serviceCategory: 'cleaning', estimatedDuration: 120, individualPrice: 1500, isRequired: true },
      { serviceId: 'window-cleaning', serviceName: 'Window Cleaning', serviceCategory: 'cleaning', estimatedDuration: 90, individualPrice: 800, isRequired: true },
      { serviceId: 'organization', serviceName: 'Home Organization', serviceCategory: 'cleaning', estimatedDuration: 180, individualPrice: 1200, isRequired: true }
    ],
    originalPrice: 3500,
    discountedPrice: 2800,
    discountPercentage: 20,
    category: 'cleaning',
    tags: ['cleaning', 'spring', 'bundle', 'popular'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'electrical-maintenance-bundle',
    name: 'Electrical Maintenance Bundle',
    description: 'Comprehensive electrical safety check and maintenance package',
    services: [
      { serviceId: 'electrical-inspection', serviceName: 'Electrical Inspection', serviceCategory: 'electrical', estimatedDuration: 120, individualPrice: 2000, isRequired: true },
      { serviceId: 'wiring-repair', serviceName: 'Wiring Repair', serviceCategory: 'electrical', estimatedDuration: 90, individualPrice: 1500, isRequired: true },
      { serviceId: 'safety-upgrade', serviceName: 'Safety Upgrades', serviceCategory: 'electrical', estimatedDuration: 180, individualPrice: 2500, isRequired: true }
    ],
    originalPrice: 6000,
    discountedPrice: 4800,
    discountPercentage: 20,
    category: 'electrical',
    tags: ['electrical', 'maintenance', 'safety', 'limited'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function ServiceBundlesPage() {
  const [selectedBundle, setSelectedBundle] = useState<ServiceBundle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price' | 'discount' | 'name'>('price');
  const router = useRouter();
  
  // Use mock data for build-time safety
  const bundles = mockBundles;
  const categories = [
    { id: 'all', name: 'All Categories', count: bundles.length },
    { id: 'cleaning', name: 'Cleaning', count: bundles.filter(b => b.category === 'cleaning').length },
    { id: 'electrical', name: 'Electrical', count: bundles.filter(b => b.category === 'electrical').length },
    { id: 'home_setup', name: 'Home Setup', count: bundles.filter(b => b.category === 'home_setup').length },
    { id: 'office_maintenance', name: 'Office Maintenance', count: bundles.filter(b => b.category === 'office_maintenance').length }
  ];

  const filteredBundles = (bundles || [])
    .filter(bundle => {
      if (!bundle || !bundle.name || !bundle.description || !bundle.tags) return false;
      
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

  const handleBundleSelect = (bundle: ServiceBundle, services: any[]) => {
    setSelectedBundle(bundle);
  };

  const handleBookBundle = () => {
    if (!selectedBundle) return;
    
    // Store selected bundle data in localStorage or state management
    const bundleOrder = {
      bundleId: selectedBundle.id || '',
      bundleName: selectedBundle.name || '',
      services: selectedBundle.services || [],
      totalAmount: selectedBundle.originalPrice || 0,
      finalAmount: selectedBundle.discountedPrice || 0,
      savings: (selectedBundle.originalPrice || 0) - (selectedBundle.discountedPrice || 0)
    };
    
    // Only access localStorage on client side with error handling
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('selectedBundleOrder', JSON.stringify(bundleOrder));
      } catch (error) {
        console.error('Failed to save bundle order:', error);
      }
    }
    
    // Navigate to booking page
    router.push('/book?type=bundle');
  };

  const totalSavings = (bundles || []).reduce((sum, bundle) => {
    return sum + ((bundle?.originalPrice || 0) - (bundle?.discountedPrice || 0));
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 mr-3" />
              <h1 className="text-4xl font-bold">Service Bundles</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Save time and money with our curated service packages. Book multiple services together 
              and enjoy exclusive discounts on professional home and office solutions.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">{bundles.length}</div>
                <div className="text-blue-100">Available Bundles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">{formatNPR(totalSavings)}</div>
                <div className="text-blue-100">Total Savings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">20%</div>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Selected Bundle Summary */}
        {selectedBundle && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Selected Bundle: {selectedBundle.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-blue-700">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {selectedBundle.services?.length || 0} services
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedBundle.services?.reduce((sum, service) => sum + service.estimatedDuration, 0) || 0} min total
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    Save {formatNPR((selectedBundle.originalPrice || 0) - (selectedBundle.discountedPrice || 0))} ({selectedBundle.discountPercentage || 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-blue-600">Final Price</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatNPR(selectedBundle.discountedPrice || 0)}
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
              <Filter className="w-16 h-16 mx-auto" />
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
