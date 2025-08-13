import { Suspense } from 'react';
import { Metadata } from 'next';
import { getServices } from '@/lib/services';
import ServiceGrid from '@/components/services/ServiceGrid';
import ServiceGridSkeleton from '@/components/services/ServiceGridSkeleton';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Services - SewaGo',
  description: 'Browse our comprehensive range of local services including cleaning, electrical work, gardening, and more.',
  keywords: 'services, local services, cleaning, electrical, gardening, plumbing, painting, moving',
};

export const revalidate = 3600; // Revalidate every hour

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover reliable local services for all your home and business needs. 
              From cleaning to repairs, we connect you with verified professionals.
            </p>
            
            {/* Search and Filter Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <Button variant="outline" className="px-6">
                  <Filter className="h-5 w-5 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            All Services ({services.length})
          </h2>
          <p className="text-gray-600">
            Choose from our wide range of professional services
          </p>
        </div>

        <Suspense fallback={<ServiceGridSkeleton />}>
          <ServiceGrid services={services} />
        </Suspense>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need a Custom Service?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Can't find what you're looking for? Contact us and we'll help you find the right professional.
          </p>
          <Button 
            variant="secondary" 
            size="lg"
            className="bg-white text-primary hover:bg-gray-100"
          >
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
}


