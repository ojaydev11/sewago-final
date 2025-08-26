
'use client';

import { useState, useEffect } from 'react';
// Mock session hook - replace with actual backend integration
const useSession = () => ({ data: { user: { id: 'mock-user-id', name: 'Mock User', email: 'mock@example.com' } } });
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExclamationCircleIcon
} from 'lucide-react';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { 
  ExclamationCircleIcon, 
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    id: '1',
    category: 'booking',
    question: 'How do I book a service?',
    answer: 'Browse our services, select your city, choose a provider, and complete the booking form. Payment is cash on delivery (COD).'
  },
  {
    id: '2',
    category: 'booking',
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel up to 2 hours before the scheduled time. Go to your dashboard and click "Cancel Booking".'
  },
  {
    id: '3',
    category: 'payment',
    question: 'What payment methods do you accept?',
    answer: 'Currently, we only accept Cash on Delivery (COD). Digital payment options are coming soon.'
  },
  {
    id: '4',
    category: 'service',
    question: 'What if I\'m not satisfied with the service?',
    answer: 'Contact our support team immediately. We offer a satisfaction guarantee and will work to resolve any issues.'
  },
  {
    id: '5',
    category: 'warranty',
    question: 'Do services come with a warranty?',
    answer: 'Yes, most services include a 30-day service warranty. Check your service details for specific warranty terms.'
  }
];

export default function SupportCenter() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Only fetch session if auth is enabled
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true') {
      const fetchSession = async () => {
        try {
          const response = await fetch('/api/auth/session');
          if (response.ok) {
            const sessionData = await response.json();
            setSession(sessionData);
          }
        } catch (error) {
          console.error('Failed to fetch session:', error);
        }
      };
      fetchSession();
    }
  }, []);

  if (!FEATURE_FLAGS.SUPPORT_CENTER_ENABLED) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-gray-600">Support center is currently unavailable.</p>
        </div>
      </div>
    );
  }

  // Check if auth is enabled (only on client side)
  const isAuthEnabled = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true' : true;
  
  if (typeof window !== 'undefined' && !isAuthEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Authentication is currently disabled.</p>
        </div>
      </div>
    );
  }

  const categories = ['all', 'booking', 'payment', 'service', 'warranty'];
  
  const filteredFAQs = FAQS.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <QuestionMarkCircleIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Browse FAQs</h3>
            <p className="text-gray-600 mb-4">Find quick answers to common questions</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
            <p className="text-gray-600 mb-4">Get personalized help from our team</p>
            <Button 
              onClick={() => setShowContactForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Contact Us
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <DocumentTextIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">My Tickets</h3>
            <p className="text-gray-600 mb-4">View your support request history</p>
            {session ? (
              <Link href="/support/tickets">
                <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                  View Tickets
                </Button>
              </Link>
            ) : (
              <Link href="/account/login">
                <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                  Login to View
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <details key={faq.id} className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                    <div className="ml-6 flex-shrink-0">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No FAQs found matching your search criteria.
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="text-xl mb-6">Our support team is here to assist you</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="h-5 w-5" />
              <span>support@sewago.com</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-5 w-5" />
              <span>+977-1-4444444</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactFormModal 
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  );
}

function ContactFormModal({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    category: 'general',
    subject: '',
    description: '',
    bookingId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: session?.user?.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Support ticket created successfully! Ticket ID: ${result.ticket.ticketId}`);
        onClose();
      } else {
        throw new Error('Failed to create ticket');
      }
    } catch (error) {
      alert('Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Contact Support</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="booking">Booking Issue</option>
                <option value="payment">Payment Issue</option>
                <option value="service">Service Quality</option>
                <option value="technical">Technical Problem</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking ID (if applicable)
              </label>
              <input
                type="text"
                value={formData.bookingId}
                onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., BK123456"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe your issue in detail..."
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
