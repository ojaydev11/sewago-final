// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

import { Metadata } from 'next';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

import Link from 'next/link';
import SchemaMarkup from '@/components/SchemaMarkup';
import { designUtils, componentStyles } from '@/lib/design-system';

export const metadata: Metadata = {
  title: 'FAQ - SewaGo | Frequently Asked Questions',
  description: 'Find answers to common questions about SewaGo services, booking, payments, and more. Get help with your local service needs.',
  keywords: 'FAQ, frequently asked questions, SewaGo help, service questions, booking help, support',
};

const faqData = [
  {
    question: 'What is the price of electrical services?',
    answer: 'Electrical service prices start from Rs 500 for basic consultations and can go up to Rs 5,000+ for complex installations. The exact cost depends on the type of work, materials needed, and service provider rates. We offer transparent pricing with no hidden fees.'
  },
  {
    question: 'How do I book a service?',
    answer: 'Booking a service is simple! Search for the service you need on our platform, browse available providers, read their reviews and ratings, then click "Book Now" to schedule. You can choose your preferred date and time, and pay securely through our platform after service completion.'
  },
  {
    question: 'Are all service providers verified?',
    answer: 'Yes! Every service provider on SewaGo undergoes thorough background checks, skill verification, and customer review validation. We only work with trusted, professional service providers who meet our quality standards. Your safety and satisfaction are our top priorities.'
  },
  {
    question: 'What if I\'m not satisfied with the service?',
    answer: 'We offer a 30-day satisfaction guarantee on all completed work. If you\'re not happy with the service quality, contact our support team within 30 days and we\'ll work to resolve the issue. We may arrange a re-service or provide a refund depending on the situation.'
  },
  {
    question: 'Do you offer emergency services?',
    answer: 'Yes, we provide 24/7 emergency service support for urgent situations like electrical failures, plumbing emergencies, and other critical home issues. Emergency services are available round the clock, and we prioritize urgent requests to ensure your safety and comfort.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept multiple payment methods including cash on delivery, eSewa, Khalti, and credit cards. You can pay securely through our platform after service completion, ensuring you only pay for satisfactory work. No advance payment is required for most services.'
  },
  {
    question: 'How quickly can I get a service provider?',
    answer: 'Response times vary by service type and location. For urgent services, we can often connect you with a provider within 2-4 hours. Regular bookings can be scheduled for the same day or next day depending on provider availability. We always prioritize emergency requests.'
  },
  {
    question: 'Can I become a service provider?',
    answer: 'Absolutely! We\'re always looking for qualified professionals to join our platform. You can apply through our provider portal with your skills, experience, and references. We\'ll review your application within 48 hours and guide you through the verification process.'
  }
];

const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqData.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};

export default function FAQPage() {
  return (
    <>
      <SchemaMarkup schema={faqPageSchema} />
      <main className='min-h-screen relative overflow-hidden'>
        {/* Background gradient elements */}
        <div className='fixed inset-0 pointer-events-none'>
          <div className='absolute top-1/4 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float'></div>
          <div className='absolute bottom-1/4 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float' style={{animationDelay: '1s'}}></div>
        </div>
        
        {/* Hero Section */}
        <section className='relative bg-gradient-hero py-20 lg:py-32'>
          <div className={designUtils.getContainerClasses('lg')}>
            <div className='text-center space-y-8 animate-fade-up'>
              <h1 className={designUtils.getHeadingClasses('h1')}>
                Frequently Asked Questions
              </h1>
              <p className={designUtils.getTextClasses('large')}>
                Get answers to common questions about SewaGo services
              </p>
              
              {/* Modern accent line */}
              <div className='flex justify-center'>
                <div className='w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full'></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQs Section */}
        <section className={designUtils.getContainerClasses('lg')}>
          <div className='py-20'>
            <div className='max-w-4xl mx-auto space-y-6'>
              {faqData.map((faq, index) => (
                <div 
                  key={index}
                  className={componentStyles.card.base + ' p-8 animate-fade-up'}
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <h3 className='text-xl font-bold text-white mb-4'>{faq.question}</h3>
                  <p className={designUtils.getTextClasses('medium')}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Still Have Questions Section */}
        <section className={designUtils.getContainerClasses('md')}>
          <div className='text-center space-y-8 py-20'>
            <div className={componentStyles.card.base + ' p-8 max-w-2xl mx-auto'}>
              <h3 className='text-2xl font-bold text-white mb-4'>Still Have Questions?</h3>
              <p className={designUtils.getTextClasses('medium') + ' mb-6'}>
                Can't find the answer you're looking for? Our support team is here to help!
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link href="/contact" className={designUtils.getButtonClasses('primary')}>
                  Contact Support
                </Link>
                <Link href="/contact" className={designUtils.getButtonClasses('outline')}>
                  Live Chat
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Bottom accent line */}
        <div className='fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-40'></div>
      </main>
    </>
  );
}
