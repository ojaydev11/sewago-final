'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin, Star, Clock } from 'lucide-react';

interface Service {
  _id: string;
  slug: string;
  name: string;
  category: string;
  shortDesc: string;
  basePrice: number;
  image?: string;
  active: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  const categories = [
    'all',
    'Cleaning',
    'Electrical',
    'Outdoor',
    'Relocation',
    'Plumbing',
    'Painting'
  ];

  const districts = [
    'all',
    'Kathmandu',
    'Lalitpur',
    'Bhaktapur',
    'Kirtipur',
    'Madhyapur Thimi'
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedCategory, selectedDistrict]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services.filter(service => service.active);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Note: District filtering would require additional data structure
    // For now, we'll show all services

    setFilteredServices(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-primary">Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover reliable local services from verified professionals across Nepal
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* District Filter */}
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger>
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district === 'all' ? 'All Districts' : district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDistrict('all');
              }}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredServices.length} of {services.length} services
          </p>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDistrict('all');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card key={service._id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{service.category}</Badge>
                    <span className="text-lg font-semibold text-primary">
                      ₹{service.basePrice}
                    </span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {service.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {service.shortDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>Available in your area</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" />
                      <span>4.8+</span>
                    </div>
                  </div>
                  
                  <Link href={`/services/${service.slug}`}>
                    <Button className="w-full group-hover:bg-primary group-hover:text-white">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-gray-600 mb-6">
              Contact us and we'll help you find the right service provider
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button variant="outline">
                  Contact Support
                </Button>
              </Link>
              <Link href="/provider/register">
                <Button>
                  Become a Provider
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


