'use client';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

import { designUtils, componentStyles } from '@/lib/design-system';

export default function FAQsPage() {
  return (
    <main className='min-h-screen bg-sg-primary relative overflow-hidden'>
      {/* Background gradient elements */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute top-1/4 left-10 w-96 h-96 bg-sg-accent1/5 rounded-full blur-3xl animate-float'></div>
        <div className='absolute bottom-1/4 right-20 w-80 h-80 bg-sg-accent2/5 rounded-full blur-3xl animate-float' style={{animationDelay: '1s'}}></div>
      </div>
      
      {/* Hero Section */}
      <section className='relative bg-gradient-hero py-20 lg:py-32'>
        <div className={designUtils.getContainerClasses('lg')}>
          <div className='text-center space-y-8 animate-fade-in'>
            <h1 className={designUtils.getHeadingClasses('h1')}>
              Frequently Asked Questions
            </h1>
            <p className={designUtils.getTextClasses('large')}>
              Find answers to common questions about our services and platform
            </p>
            
            {/* Futuristic accent line */}
            <div className='flex justify-center'>
              <div className='w-24 h-1 bg-gradient-accent rounded-full'></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Categories */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='space-y-20 py-20'>
          {/* General Questions */}
          <div className='space-y-8 animate-fade-in'>
            <h2 className={designUtils.getHeadingClasses('h2') + ' text-center'}>
              General Questions
            </h2>
            <div className='grid gap-6'>
              {[
                {
                  question: 'What is SewaGo?',
                  answer: 'SewaGo is a comprehensive platform that connects customers with verified local service providers for various home and business services in Nepal.'
                },
                {
                  question: 'How does SewaGo work?',
                  answer: 'Simply search for the service you need, browse available providers, and book your appointment. Payment is made after service completion.'
                },
                {
                  question: 'Is SewaGo available in my city?',
                  answer: 'We currently serve major cities including Kathmandu, Lalitpur, Bhaktapur, and surrounding areas. Check our service areas for availability.'
                }
              ].map((faq, index) => (
                <div 
                  key={index}
                  className={componentStyles.card.base + ' p-6 animate-slide-up'}
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <h3 className='text-lg font-semibold text-sg-secondary mb-3'>{faq.question}</h3>
                  <p className={designUtils.getTextClasses('small')}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Service Questions */}
          <div className='space-y-8 animate-fade-in' style={{animationDelay: '0.2s'}}>
            <h2 className={designUtils.getHeadingClasses('h2') + ' text-center'}>
              Service Questions
            </h2>
            <div className='grid gap-6'>
              {[
                {
                  question: 'What services does SewaGo offer?',
                  answer: 'We offer a wide range of services including electrical work, plumbing, cleaning, tutoring, and many more professional services.'
                },
                {
                  question: 'How do I book a service?',
                  answer: 'Choose your service category, select a provider, pick your preferred time slot, and confirm your booking. It\'s that simple!'
                },
                {
                  question: 'Can I cancel or reschedule my booking?',
                  answer: 'Yes, you can modify your booking up to 2 hours before the scheduled time through your account dashboard.'
                },
                {
                  question: 'What if I\'m not satisfied with the service?',
                  answer: 'We offer a 30-day satisfaction guarantee. If you\'re not happy with the work, contact us and we\'ll make it right.'
                }
              ].map((faq, index) => (
                <div 
                  key={index}
                  className={componentStyles.card.base + ' p-6 animate-slide-up'}
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <h3 className='text-lg font-semibold text-sg-secondary mb-3'>{faq.question}</h3>
                  <p className={designUtils.getTextClasses('small')}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Payment Questions */}
          <div className='space-y-8 animate-fade-in' style={{animationDelay: '0.4s'}}>
            <h2 className={designUtils.getHeadingClasses('h2') + ' text-center'}>
              Payment & Pricing
            </h2>
            <div className='grid gap-6'>
              {[
                {
                  question: 'How much do services cost?',
                  answer: 'Service prices vary based on the type of work, complexity, and provider rates. All prices are clearly displayed before booking.'
                },
                {
                  question: 'What payment methods do you accept?',
                  answer: 'We currently support cash on delivery. Pay only after the service is completed to your satisfaction.'
                },
                {
                  question: 'Are there any hidden fees?',
                  answer: 'No hidden fees! All costs including materials, labor, and any additional charges are clearly communicated upfront.'
                },
                {
                  question: 'Do you offer any discounts?',
                  answer: 'Yes! New customers get 10% off their first service, and we regularly offer seasonal promotions and referral bonuses.'
                }
              ].map((faq, index) => (
                <div 
                  key={index}
                  className={componentStyles.card.base + ' p-6 animate-slide-up'}
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <h3 className='text-lg font-semibold text-sg-secondary mb-3'>{faq.question}</h3>
                  <p className={designUtils.getTextClasses('small')}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Provider Questions */}
          <div className='space-y-8 animate-fade-in' style={{animationDelay: '0.6s'}}>
            <h2 className={designUtils.getHeadingClasses('h2') + ' text-center'}>
              For Service Providers
            </h2>
            <div className='grid gap-6'>
              {[
                {
                  question: 'How do I become a service provider?',
                  answer: 'Apply through our provider portal with your skills, experience, and references. We\'ll review and verify your credentials.'
                },
                {
                  question: 'What are the requirements to join?',
                  answer: 'You need valid identification, relevant experience, references, and must pass our background and skill verification process.'
                },
                {
                  question: 'How do I get paid?',
                  answer: 'Payment is collected from customers after service completion. We handle the transaction and transfer your earnings within 48 hours.'
                },
                {
                  question: 'Can I set my own rates?',
                  answer: 'Yes, you have full control over your pricing. We provide market rate guidance to help you stay competitive.'
                }
              ].map((faq, index) => (
                <div 
                  key={index}
                  className={componentStyles.card.base + ' p-6 animate-slide-up'}
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <h3 className='text-lg font-semibold text-sg-secondary mb-3'>{faq.question}</h3>
                  <p className={designUtils.getTextClasses('small')}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Still Have Questions */}
      <section className={designUtils.getContainerClasses('md')}>
        <div className='text-center space-y-8 py-20'>
          <div className={componentStyles.card.base + ' p-8 max-w-2xl mx-auto'}>
            <h3 className='text-2xl font-bold text-sg-secondary mb-4'>Still Have Questions?</h3>
            <p className={designUtils.getTextClasses('medium') + ' mb-6'}>
              Can't find the answer you're looking for? Our support team is here to help!
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button className={designUtils.getButtonClasses('primary')}>
                Contact Support
              </button>
              <button className={designUtils.getButtonClasses('outline')}>
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Bottom accent line */}
      <div className='fixed bottom-0 left-0 right-0 h-1 bg-gradient-accent opacity-40'></div>
    </main>
  );
}


