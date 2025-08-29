<<<<<<< HEAD


export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Home, Wrench, Phone, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-600 leading-none">
            404
          </h1>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Don't worry, we're here to help you find what you need.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for services, pages, or help..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 text-sm">
              Search
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <Link href="/">
              <Button variant="outline" className="w-full h-12 border-white/20 text-white hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" />
                Homepage
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" className="w-full h-12 border-white/20 text-white hover:bg-white/10">
                <Wrench className="w-4 h-4 mr-2" />
                Browse Services
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="w-full h-12 border-white/20 text-white hover:bg-white/10">
                <Phone className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </Link>
            <Link href="/faqs">
              <Button variant="outline" className="w-full h-12 border-white/20 text-white hover:bg-white/10">
                <Search className="w-4 h-4 mr-2" />
                View FAQ
              </Button>
            </Link>
          </div>
        </div>

        {/* Popular Services */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Popular Services
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'Electrical Work', href: '/services/electrical-work' },
              { name: 'House Cleaning', href: '/services/house-cleaning' },
              { name: 'Plumbing', href: '/services/plumbing' },
              { name: 'Tutoring', href: '/services/tutoring' },
            ].map((service) => (
              <Link key={service.href} href={service.href}>
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                  {service.name}
                  <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            Still Can't Find What You're Looking For?
          </h3>
          <p className="text-gray-300 mb-4">
            Our support team is here to help you navigate our services and find exactly what you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact">
              <Button className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white">
                Contact Support
              </Button>
            </Link>
            <Link href="/faqs">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Browse FAQ
              </Button>
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Homepage
            </Button>
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl"></div>
        </div>
=======
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
      </div>
    </main>
  );
}
