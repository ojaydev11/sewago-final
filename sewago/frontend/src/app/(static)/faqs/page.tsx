'use client';

import { useState } from 'react';
import { 
  ChevronDownIcon,
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const faqCategories = [
  {
    id: 'general',
    title: 'General Questions',
    icon: '❓',
    color: 'from-blue-500 to-cyan-500',
    faqs: [
      {
        question: "What is SewaGo?",
        answer: "SewaGo is Nepal's premier platform that connects customers with verified local service providers. We offer a wide range of services including cleaning, electrical work, plumbing, gardening, and more."
      },
      {
        question: "How does SewaGo work?",
        answer: "Simply browse our services, select what you need, book with a verified provider, and enjoy quality service. We handle everything from verification to payment processing."
      },
      {
        question: "Is SewaGo available in my area?",
        answer: "We currently serve major cities across Nepal including Kathmandu, Pokhara, Lalitpur, Bhaktapur, and more. We're expanding rapidly to cover more areas."
      },
      {
        question: "What languages do you support?",
        answer: "We support both English and Nepali languages to serve our diverse community better."
      }
    ]
  },
  {
    id: 'booking',
    title: 'Booking & Services',
    icon: '📅',
    color: 'from-green-500 to-emerald-500',
    faqs: [
      {
        question: "How do I book a service?",
        answer: "Browse our services, select the one you need, choose your preferred provider, and complete the booking. You'll receive confirmation and provider details immediately."
      },
      {
        question: "Can I schedule services in advance?",
        answer: "Yes! You can book services up to 30 days in advance. This is especially useful for regular maintenance or planned projects."
      },
      {
        question: "What if I need to cancel or reschedule?",
        answer: "You can cancel or reschedule up to 24 hours before the service time without any charges. Late cancellations may incur a small fee."
      },
      {
        question: "Do you offer emergency services?",
        answer: "Yes, we offer 24/7 emergency services for critical issues like electrical problems, plumbing emergencies, and security issues."
      },
      {
        question: "Can I request custom services?",
        answer: "Absolutely! If you don't see what you need, contact us and we'll help arrange custom services from our network of professionals."
      }
    ]
  },
  {
    id: 'providers',
    title: 'Service Providers',
    icon: '👷',
    color: 'from-purple-500 to-pink-500',
    faqs: [
      {
        question: "Are your service providers verified?",
        answer: "Yes! All providers undergo thorough background checks, skill verification, and reference checks. We only work with trusted, qualified professionals."
      },
      {
        question: "What qualifications do providers have?",
        answer: "Our providers have relevant certifications, licenses where required, and proven experience. We verify their credentials and track their performance."
      },
      {
        question: "How do you ensure quality?",
        answer: "We monitor provider performance, collect customer feedback, and maintain strict quality standards. Providers must maintain high ratings to stay on our platform."
      },
      {
        question: "Can I choose my provider?",
        answer: "Yes! You can view provider profiles, ratings, and reviews before booking. You can also request specific providers if you've worked with them before."
      },
      {
        question: "What if I'm not satisfied with the service?",
        answer: "We offer a satisfaction guarantee. If you're not happy, contact us within 24 hours and we'll resolve the issue or provide a refund."
      }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Pricing',
    icon: '💳',
    color: 'from-yellow-500 to-orange-500',
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept cash, digital wallets (eSewa, Khalti), bank transfers, and major credit cards. All online payments are secure and encrypted."
      },
      {
        question: "How are prices determined?",
        answer: "Prices are set by providers based on service type, complexity, and market rates. We ensure competitive pricing and transparency."
      },
      {
        question: "Are there any hidden fees?",
        answer: "No hidden fees! All costs are clearly displayed upfront. You'll see the total price including any applicable taxes before confirming your booking."
      },
      {
        question: "Do you offer discounts or packages?",
        answer: "Yes! We offer various discounts for first-time users, regular customers, and package deals for multiple services. Check our promotions page for current offers."
      },
      {
        question: "Is payment secure?",
        answer: "Absolutely! We use industry-standard encryption and secure payment gateways. Your payment information is never stored on our servers."
      }
    ]
  },
  {
    id: 'support',
    title: 'Customer Support',
    icon: '🆘',
    color: 'from-red-500 to-pink-500',
    faqs: [
      {
        question: "How can I contact customer support?",
        answer: "You can reach us via phone, email, live chat, or WhatsApp. We're available 24/7 for urgent issues and during business hours for general inquiries."
      },
      {
        question: "What are your support hours?",
        answer: "Our customer support team is available Monday-Friday 9:00 AM - 6:00 PM, Saturday 10:00 AM - 4:00 PM. Emergency support is available 24/7."
      },
      {
        question: "How quickly do you respond to inquiries?",
        answer: "We aim to respond to all inquiries within 2 hours during business hours. Emergency issues are addressed immediately."
      },
      {
        question: "Can I get support in Nepali?",
        answer: "Yes! Our support team is fluent in both English and Nepali. We're proud to serve our community in their preferred language."
      }
    ]
  },
  {
    id: 'providers-join',
    title: 'Join as Provider',
    icon: '🚀',
    color: 'from-indigo-500 to-blue-500',
    faqs: [
      {
        question: "How do I become a service provider?",
        answer: "Visit our provider registration page, fill out the application form, submit required documents, and our team will guide you through the verification process."
      },
      {
        question: "What documents do I need?",
        answer: "You'll need ID proof, address proof, relevant certifications/licenses, and references. We'll guide you through the specific requirements for your service category."
      },
      {
        question: "How long does verification take?",
        answer: "Verification typically takes 3-5 business days. We'll keep you updated throughout the process and notify you once approved."
      },
      {
        question: "What are the benefits of joining?",
        answer: "Access to a large customer base, secure payments, business tools, training opportunities, and support to grow your business."
      },
      {
        question: "Is there a fee to join?",
        answer: "There's a small one-time registration fee and a small commission on completed services. This helps us maintain quality and provide support."
      }
    ]
  }
];

export default function FAQsPage() {
  const [openCategory, setOpenCategory] = useState('general');
  const [openFaqs, setOpenFaqs] = useState<{ [key: string]: boolean }>({});

  const toggleCategory = (categoryId: string) => {
    setOpenCategory(openCategory === categoryId ? '' : categoryId);
  };

  const toggleFaq = (faqIndex: number) => {
    setOpenFaqs(prev => ({
      ...prev,
      [faqIndex]: !prev[faqIndex]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <QuestionMarkCircleIcon className="w-4 h-4 mr-2" />
              <span>Frequently Asked Questions</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              How Can We <span className="text-gradient-secondary">Help?</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Find answers to common questions about our services, booking process, 
              and how SewaGo works. Can't find what you're looking for? Contact us! 🇳🇵
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for answers..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white transition-all duration-300"
              />
              <QuestionMarkCircleIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {faqCategories.map((category) => (
              <div key={category.id} className="mb-12">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-bold text-gray-800">{category.title}</h2>
                      <p className="text-gray-600">{category.faqs.length} questions</p>
                    </div>
                  </div>
                  
                  <div className={`w-8 h-8 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center text-white transition-transform duration-300 ${
                    openCategory === category.id ? 'rotate-180' : ''
                  }`}>
                    {openCategory === category.id ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {/* Category FAQs */}
                {openCategory === category.id && (
                  <div className="mt-6 space-y-4 animate-fade-in-up">
                    {category.faqs.map((faq, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                        <button
                          onClick={() => toggleFaq(index)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                        >
                          <h3 className="text-lg font-semibold text-gray-800 pr-4">
                            {faq.question}
                          </h3>
                          <div className={`w-6 h-6 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center text-white flex-shrink-0 transition-transform duration-300 ${
                            openFaqs[index] ? 'rotate-180' : ''
                          }`}>
                            {openFaqs[index] ? (
                              <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                        
                        {openFaqs[index] && (
                          <div className="px-6 pb-4 animate-fade-in-up">
                            <p className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
              <ChatBubbleLeftRightIcon className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-6">
              Still Have Questions?
            </h2>
            
            <p className="text-xl text-white/90 mb-8">
              Can't find the answer you're looking for? Our friendly support team is here to help! 
              Reach out to us and we'll get back to you as soon as possible.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Contact Support
              </a>
              <a
                href="tel:+977-1-4XXXXXX"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
              >
                Call Us Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Quick <span className="text-gradient-primary">Tips</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Make the most of SewaGo with these helpful tips
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                title: "Search Smart",
                description: "Use specific keywords to find exactly what you need. Try 'deep cleaning' instead of just 'cleaning'."
              },
              {
                icon: "⭐",
                title: "Check Reviews",
                description: "Always read provider reviews and ratings before booking. This helps ensure quality service."
              },
              {
                icon: "📱",
                title: "Book in Advance",
                description: "For popular services, book 2-3 days in advance to secure your preferred time slot."
              }
            ].map((tip, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl group-hover:scale-110 transition-transform duration-300">
                  {tip.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{tip.title}</h3>
                <p className="text-gray-600 leading-relaxed">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


