'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, User, Bell, MapPin, ChevronDown, Phone, Mail, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function EnhancedNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { name: 'Services', href: '/en/services', hasDropdown: true },
    { name: 'How It Works', href: '/en/how-it-works' },
    { name: 'About Us', href: '/en/about' },
    { name: 'Contact', href: '/en/contact' },
    { name: 'Support', href: '/en/support' }
  ];

  const serviceCategories = [
    { name: 'Home Services', href: '/en/services/home', icon: '🏠' },
    { name: 'Professional Services', href: '/en/services/professional', icon: '💼' },
    { name: 'Emergency Services', href: '/en/services/emergency', icon: '🚨' },
    { name: 'Specialty Services', href: '/en/services/specialty', icon: '⭐' }
  ];

  return (
    <>
      {/* Top bar */}
      <div className="bg-gray-900 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>+977-1-4XXXXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>support@sewago.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/en/support" className="hover:text-blue-400 transition-colors">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Live Chat
              </Link>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Kathmandu, Nepal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <header className={`w-full relative z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                  SG
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">SewaGo</div>
                <div className="text-xs text-gray-500 -mt-1">Local Services</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 py-2"
                  >
                    <span>{item.name}</span>
                    {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                  </Link>
                  
                  {/* Dropdown for Services */}
                  {item.hasDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-95 group-hover:scale-100">
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          {serviceCategories.map((category) => (
                            <Link
                              key={category.name}
                              href={category.href}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                              <span className="text-2xl">{category.icon}</span>
                              <div>
                                <div className="font-medium text-gray-900">{category.name}</div>
                                <div className="text-xs text-gray-500">Professional providers</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <Link
                            href="/en/services"
                            className="block text-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            View All Services →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right side actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

                             {/* User menu */}
               {isAuthenticated ? (
                 <div className="relative group">
                   <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                     <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                       {user?.name?.charAt(0).toUpperCase() || 'U'}
                     </div>
                     <ChevronDown className="w-4 h-4" />
                   </button>
                   
                   {/* User dropdown */}
                   <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                     <div className="p-2">
                       <div className="px-3 py-2 border-b border-gray-100">
                         <div className="font-medium text-gray-900">{user?.name}</div>
                         <div className="text-sm text-gray-500">{user?.email}</div>
                       </div>
                       <Link
                         href="/en/dashboard"
                         className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                       >
                         Dashboard
                       </Link>
                       <Link
                         href="/en/profile"
                         className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                       >
                         Profile
                       </Link>
                       <Link
                         href="/en/bookings"
                         className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                       >
                         My Bookings
                       </Link>
                       <div className="border-t border-gray-200 my-2"></div>
                       <button 
                         onClick={logout}
                         className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                       >
                         Sign Out
                       </button>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="flex items-center space-x-4">
                   <Link
                     href="/en/auth/login"
                     className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                   >
                     Sign In
                   </Link>
                   <Link
                     href="/en/auth/register"
                     className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                   >
                     Sign Up
                   </Link>
                 </div>
               )}

                             {/* CTA Button - Only show if not authenticated */}
               {!isAuthenticated && (
                 <Link
                   href="/en/auth/register"
                   className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                 >
                   Get Started
                 </Link>
               )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="border-t border-gray-200 bg-gray-50 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for services, providers, or locations..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-gray-200 pt-4">
                <Link
                  href="/en/auth/login"
                  className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
