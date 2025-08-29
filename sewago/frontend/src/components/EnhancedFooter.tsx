'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, MessageCircle, Shield, Clock, Star, Users } from 'lucide-react';

export default function EnhancedFooter() {
  const currentYear = new Date().getFullYear();

  const serviceCategories = [
    { name: 'Home Services', services: ['Electrician', 'Plumber', 'Cleaner', 'Carpenter', 'Painter'] },
    { name: 'Professional Services', services: ['Home Tutor', 'Photographer', 'Event Planner', 'Interior Designer'] },
    { name: 'Emergency Services', services: ['24/7 Electrician', 'Emergency Plumber', 'Security Services', 'Medical Support'] },
    { name: 'Specialty Services', services: ['Garden Maintenance', 'Pet Care', 'Elderly Care', 'Child Care'] }
  ];

  const companyLinks = [
    { name: 'About Us', href: '/en/about' },
    { name: 'How It Works', href: '/en/how-it-works' },
    { name: 'Careers', href: '/en/careers' },
    { name: 'Press & Media', href: '/en/press' },
    { name: 'Partnerships', href: '/en/partnerships' },
    { name: 'Investor Relations', href: '/en/investors' }
  ];

  const supportLinks = [
    { name: 'Help Center', href: '/en/support' },
    { name: 'Contact Us', href: '/en/contact' },
    { name: 'Live Chat', href: '/en/support/chat' },
    { name: 'Emergency Support', href: '/en/support/emergency' },
    { name: 'Provider Support', href: '/en/support/providers' },
    { name: 'Community Forum', href: '/en/community' }
  ];

  const legalLinks = [
    { name: 'Terms of Service', href: '/en/terms' },
    { name: 'Privacy Policy', href: '/en/privacy' },
    { name: 'Cookie Policy', href: '/en/cookies' },
    { name: 'Data Protection', href: '/en/data-protection' },
    { name: 'Accessibility', href: '/en/accessibility' },
    { name: 'GDPR Compliance', href: '/en/gdpr' }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/sewago', color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/sewago', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/sewago', color: 'hover:text-pink-500' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/sewago', color: 'hover:text-blue-700' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/sewago', color: 'hover:text-red-600' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
          {/* Company info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                SG
              </div>
              <div>
                <div className="text-2xl font-bold">SewaGo</div>
                <div className="text-sm text-gray-400">Local Services Platform</div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 max-w-md">
              Connecting families with trusted local service providers across Nepal. 
              Quality guaranteed, prices transparent, satisfaction assured.
            </p>

            {/* Trust indicators */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Shield className="w-4 h-4 text-green-400" />
                <span>50,000+ Verified Providers</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>4.8/5 Customer Rating</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Same Day Service Available</span>
              </div>
            </div>
          </div>

          {/* Service Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Services</h3>
            <div className="space-y-4">
              {serviceCategories.map((category) => (
                <div key={category.name}>
                  <h4 className="font-medium text-gray-300 mb-2">{category.name}</h4>
                  <ul className="space-y-1">
                    {category.services.map((service) => (
                      <li key={service}>
                        <Link 
                          href={`/en/services/${service.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
                        >
                          {service}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Company & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold mb-6 text-white mt-8">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold mb-6 text-white mt-8">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>+977-1-4XXXXXX</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>support@sewago.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Kathmandu, Nepal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-6">
              Get the latest updates on new services, special offers, and local service tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © {currentYear} SewaGo. All rights reserved. Made with ❤️ in Nepal.
            </div>

            {/* Social links */}
            <div className="flex items-center space-x-6">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 ${social.color} transition-colors duration-200`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>

            {/* Additional links */}
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/en/sitemap" className="hover:text-blue-400 transition-colors duration-200">
                Sitemap
              </Link>
              <Link href="/en/accessibility" className="hover:text-blue-400 transition-colors duration-200">
                Accessibility
              </Link>
              <Link href="/en/status" className="hover:text-blue-400 transition-colors duration-200">
                System Status
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="bg-gray-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-purple-400" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
