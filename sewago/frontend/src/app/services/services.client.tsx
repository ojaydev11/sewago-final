'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, MapPin, Star, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  priceRange?: { min: number; max: number };
  isActive: boolean;
}

interface ServicesClientProps {
  initialServices: Service[];
}

const categories = [
  { id: 'all', name: 'All Services', icon: '🔧' },
  { id: 'plumbing', name: 'Plumbing', icon: '🚰' },
  { id: 'electrical', name: 'Electrical', icon: '⚡' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
  { id: 'moving', name: 'Moving', icon: '📦' },
  { id: 'repairs', name: 'Repairs', icon: '🔨' },
  { id: 'gardening', name: 'Gardening', icon: '🌱' },
];

export function ServicesClient({ initialServices }: ServicesClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Fetch services with React Query for real-time updates
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['services', searchTerm, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const response = await fetch(`/api/services?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
    initialData: { services: initialServices, total: initialServices.length },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const services = servicesData?.services || [];

  const filteredAndSortedServices = useMemo(() => {
    let filtered = services;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((service: { title: string; description: string; category: string }) =>
        service.title.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower) ||
        service.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((service: { category: string }) => service.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a: { title: string; priceRange?: { min: number; max: number } }, b: { title: string; priceRange?: { min: number; max: number } }) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'price-low':
          return (a.priceRange?.min || 0) - (b.priceRange?.min || 0);
        case 'price-high':
          return (b.priceRange?.max || 0) - (a.priceRange?.max || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [services, searchTerm, selectedCategory, sortBy]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading services...</p>
      </div>
    );
  }

  if (filteredAndSortedServices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Check back later for new services'
            }
          </p>
          {(searchTerm || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedServices.map((service: { id: string; slug: string; title: string; description: string; category: string; imageUrl?: string; priceRange?: { min: number; max: number } }) => (
          <div
            key={service.id}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            {/* Service Image */}
            <div className="h-48 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="h-24 w-24 object-contain"
                />
              ) : (
                <div className="text-6xl">🔧</div>
              )}
            </div>

            {/* Service Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {service.category}
                </span>
                {service.priceRange && (
                  <span className="text-sm text-gray-600">
                    Rs. {service.priceRange.min.toLocaleString()} - {service.priceRange.max.toLocaleString()}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {service.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {service.description}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link
                  href={`/services/${service.slug}`}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm font-medium"
                >
                  Learn More
                </Link>
                <Link
                  href={`/book/${service.slug}`}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-center text-sm font-medium flex items-center justify-center gap-2"
                >
                  Book Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
        <p className="text-red-100 mb-6 max-w-2xl mx-auto">
          Join thousands of satisfied customers who trust SewaGo for their service needs
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/services"
            className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Explore Services
          </Link>
          <Link
            href="/provider/register"
            className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
          >
            Become a Provider
          </Link>
        </div>
      </div>
    </div>
  );
}


