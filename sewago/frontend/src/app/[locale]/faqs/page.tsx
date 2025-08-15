'use client';



import { designUtils, componentStyles } from '@/lib/design-system';

export default function FAQsPage() {
  const faqs = [
    {
      question: 'What services does SewaGo offer?',
      answer: 'SewaGo offers a wide range of local services including electrical work, plumbing, cleaning, tutoring, and more. We\'re constantly adding new service categories to meet your needs.'
    },
    {
      question: 'How do I book a service?',
      answer: 'Booking a service is simple! Search for the service you need, browse available providers, read reviews, and book directly through our platform. You can schedule services at times that work for you.'
    },
    {
      question: 'Are all service providers verified?',
      answer: 'Yes! Every service provider on SewaGo undergoes thorough background checks, skill verification, and customer review validation. We only work with trusted, professional service providers.'
    },
    {
      question: 'What if I\'m not satisfied with the service?',
      answer: 'We offer a 30-day satisfaction guarantee on all completed work. If you\'re not happy with the service, contact our support team and we\'ll work to resolve the issue.'
    },
    {
      question: 'How do you handle payments?',
      answer: 'We offer secure payment processing through our platform. You can pay online or choose cash on delivery for most services. All payments are protected and secure.'
    },
    {
      question: 'Do you offer emergency services?',
      answer: 'Yes, we provide 24/7 emergency service support for urgent situations like electrical failures, plumbing emergencies, and other critical home issues.'
    },
    {
      question: 'Can I become a service provider?',
      answer: 'Absolutely! We\'re always looking for qualified professionals to join our platform. You can apply through our provider portal, and we\'ll review your application within 48 hours.'
    },
    {
      question: 'What areas do you serve?',
      answer: 'We currently serve the greater Kathmandu Valley area with plans to expand to other major cities in Nepal. Check our service area map for current coverage.'
    }
  ];

  return (
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
              Find answers to common questions about SewaGo services
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
            {faqs.map((faq, index) => (
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
      <div className='fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-40'></div>
    </main>
  );
}


