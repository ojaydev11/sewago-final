

import { Metadata } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import EnhancedNavbar from '@/components/EnhancedNavbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import { Phone, Mail, MapPin, MessageCircle, Clock, Users, Shield, Star, Loader2 } from 'lucide-react';
import { apiService, handleApiSuccess, handleApiError } from '@/lib/api';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Contact Us - SewaGo | Get in Touch for Local Services in Nepal',
  description: 'Contact SewaGo for local services in Nepal. Reach out to our team for support, questions, or to book services. Available in Kathmandu, Pokhara, and across Nepal.',
  keywords: 'contact SewaGo, local services Nepal, support, customer service, Kathmandu services, Nepal contact',
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    subscribeNewsletter: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiService.submitContactForm(formData);
      if (response.data) {
        handleApiSuccess(response.data.message);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          subscribeNewsletter: false,
        });
      } else {
        handleApiError(response.error || 'Failed to send message');
      }
    } catch (error) {
      handleApiError(error, 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const contactMethods = [
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak directly with our support team',
      primary: '+977-1-4XXXXXX',
      secondary: '+977-98XXXXXXXX',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Send us a detailed message',
      primary: 'support@sewago.com',
      secondary: 'info@sewago.com',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our team',
      primary: 'Available 24/7',
      secondary: 'Click to start chat',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Our office location',
      primary: 'Kathmandu, Nepal',
      secondary: 'Lalitpur, Nepal',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  const supportHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM', status: 'Open' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM', status: 'Open' },
    { day: 'Sunday', hours: '10:00 AM - 2:00 PM', status: 'Limited' },
    { day: 'Emergency Support', hours: '24/7 Available', status: 'Always Open' }
  ];

  const faqs = [
    {
      question: 'How do I book a service?',
      answer: 'You can book a service through our website or mobile app. Simply select the service you need, choose your location, and browse available providers. Book with just a few clicks!'
    },
    {
      question: 'Are all service providers verified?',
      answer: 'Yes, all our service providers undergo thorough background checks, skill verification, and customer reviews. We maintain high standards to ensure quality service delivery.'
    },
    {
      question: 'What if I\'m not satisfied with the service?',
      answer: 'We offer a satisfaction guarantee. If you\'re not happy with the service, contact us within 24 hours and we\'ll make it right or provide a full refund.'
    },
    {
      question: 'Do you offer emergency services?',
      answer: 'Yes, we provide 24/7 emergency services for urgent situations like electrical issues, plumbing emergencies, and security concerns. Emergency providers are available round the clock.'
    }
  ];

  return (
    <>
      <EnhancedNavbar />
      
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              We're here to help! Contact our team for any questions, support, 
              or feedback about our services. Your satisfaction is our priority.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Multiple Ways to Reach Us
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the contact method that works best for you. Our team is 
                available through phone, email, live chat, and in-person visits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className={`${method.bgColor} ${method.borderColor} border rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300`}
                >
                  <div className={`w-16 h-16 ${method.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <method.icon className={`w-8 h-8 ${method.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {method.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {method.description}
                  </p>
                  <div className="space-y-1">
                    <div className={`font-medium ${method.color}`}>
                      {method.primary}
                    </div>
                    <div className="text-sm text-gray-500">
                      {method.secondary}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Send Us a Message
                </h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you within 24 hours
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="complaint">Complaint</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please describe your inquiry or concern in detail..."
                  ></textarea>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="newsletter"
                    name="subscribeNewsletter"
                    checked={formData.subscribeNewsletter}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="newsletter" className="text-sm text-gray-600">
                    Subscribe to our newsletter for updates and special offers
                  </label>
                </div>

                                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 inline" />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
              </form>
            </div>
          </div>
        </section>

        {/* Support Hours */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Support Hours
              </h2>
              <p className="text-xl text-gray-600">
                We're here when you need us. Check our availability below.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {supportHours.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{schedule.day}</div>
                      <div className="text-sm text-gray-600">{schedule.hours}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      schedule.status === 'Open' ? 'bg-green-100 text-green-800' :
                      schedule.status === 'Limited' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {schedule.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Quick answers to common questions about our services
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">
                Still have questions? We're here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Live Chat
                </button>
                <button className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Trust SewaGo?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're committed to providing the best service experience for our customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Verified Providers
                </h3>
                <p className="text-gray-600">
                  All service providers undergo thorough background checks and verification
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Quality Guaranteed
                </h3>
                <p className="text-gray-600">
                  Satisfaction guaranteed or we'll make it right
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  50,000+ Happy Customers
                </h3>
                <p className="text-gray-600">
                  Trusted by families across Nepal for their service needs
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </>
  );
}
