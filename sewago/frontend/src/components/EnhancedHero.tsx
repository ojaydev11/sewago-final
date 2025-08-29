'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Star, Shield, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function EnhancedHero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const popularServices = [
    { id: 'electrician', name: 'Electrician', icon: '⚡', count: '2,847' },
    { id: 'plumber', name: 'Plumber', icon: '🔧', count: '1,923' },
    { id: 'cleaner', name: 'House Cleaner', icon: '✨', count: '3,156' },
    { id: 'tutor', name: 'Home Tutor', icon: '📚', count: '1,234' },
    { id: 'carpenter', name: 'Carpenter', icon: '🪚', count: '892' },
    { id: 'painter', name: 'Painter', icon: '🎨', count: '1,567' }
  ];

  const popularLocations = [
    'Kathmandu', 'Pokhara', 'Lalitpur', 'Bharatpur', 'Biratnagar', 'Dharan'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedService) params.append('service', selectedService);
      if (selectedLocation) params.append('location', selectedLocation);
      
      window.location.href = `/en/search?${params.toString()}`;
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-16 h-16 bg-purple-400/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Floating service icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-20 text-4xl opacity-20 animate-float">🔧</div>
        <div className="absolute top-48 right-32 text-3xl opacity-20 animate-float" style={{animationDelay: '1s'}}>⚡</div>
        <div className="absolute bottom-48 left-32 text-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}>✨</div>
        <div className="absolute bottom-32 right-20 text-4xl opacity-20 animate-float" style={{animationDelay: '3s'}}>📚</div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-6">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white/90 font-medium">Trusted by 50,000+ families</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
                Find Trusted Local
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Service Providers
                </span>
                in Nepal
              </h1>
              
              <p className="text-xl sm:text-2xl text-white/90 font-light leading-relaxed max-w-2xl">
                Connect with verified professionals for all your home services. 
                Quality guaranteed, prices transparent, satisfaction assured.
              </p>
            </div>

            {/* Key benefits */}
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">Verified Providers</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">Same Day Service</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">Fixed Pricing</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-white/80">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-sm">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">5K+</div>
                <div className="text-sm">Service Providers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">25+</div>
                <div className="text-sm">Cities Covered</div>
              </div>
            </div>
          </div>

          {/* Right content - Search and Services */}
          <div className="space-y-8">
            {/* Main search form */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                What service do you need today?
              </h3>
              
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Service selection */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Service Type</label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    <option value="">Select a service</option>
                    <option value="electrician">⚡ Electrician</option>
                    <option value="plumber">🔧 Plumber</option>
                    <option value="cleaner">✨ House Cleaner</option>
                    <option value="tutor">📚 Home Tutor</option>
                    <option value="carpenter">🪚 Carpenter</option>
                    <option value="painter">🎨 Painter</option>
                  </select>
                </div>

                {/* Location selection */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    <option value="">Select your city</option>
                    {popularLocations.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Search button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900"
                >
                  <Search className="inline-block w-5 h-5 mr-2" />
                  Find Service Providers
                </button>
              </form>

              {/* Quick search */}
              <div className="mt-6">
                <p className="text-sm text-white/60 mb-3">Quick search:</p>
                <div className="flex flex-wrap gap-2">
                  {popularServices.slice(0, 4).map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full text-sm text-white/80 hover:text-white transition-all duration-200"
                    >
                      {service.icon} {service.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Popular services grid */}
            <div className="grid grid-cols-2 gap-4">
              {popularServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedService(service.id)}
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-1">{service.name}</h4>
                  <p className="text-xs text-white/60">{service.count} providers</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-80"></div>
    </section>
  );
}
