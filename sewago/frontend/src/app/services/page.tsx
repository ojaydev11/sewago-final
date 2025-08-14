import { designUtils, componentStyles } from '@/lib/design-system';
import Link from 'next/link';

export default function ServicesPage() {
  const serviceCategories = [
    {
      icon: '🔌',
      title: 'Electrical Services',
      description: 'Professional electrical work including installations, repairs, and maintenance',
      services: ['Wiring', 'Installations', 'Repairs', 'Maintenance'],
      color: 'from-sg-accent1 to-sg-accent2'
    },
    {
      icon: '🚿',
      title: 'Plumbing Services',
      description: 'Expert plumbing solutions for homes and businesses',
      services: ['Repairs', 'Installations', 'Maintenance', 'Emergency'],
      color: 'from-sg-river to-sg-accent2'
    },
    {
      icon: '✨',
      title: 'Cleaning Services',
      description: 'Comprehensive cleaning solutions for all your needs',
      services: ['House Cleaning', 'Deep Cleaning', 'Office Cleaning', 'Post-Construction'],
      color: 'from-sg-accent1 to-sg-river'
    },
    {
      icon: '🎓',
      title: 'Tutoring Services',
      description: 'Qualified tutors for all subjects and age groups',
      services: ['Academic Tutoring', 'Test Preparation', 'Language Learning', 'Skill Development'],
      color: 'from-sg-accent2 to-sg-accent1'
    }
  ];

  return (
    <main className='min-h-screen bg-sg-primary relative overflow-hidden'>
      {/* Background gradient elements */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute top-1/4 right-10 w-96 h-96 bg-sg-accent1/5 rounded-full blur-3xl animate-float'></div>
        <div className='absolute bottom-1/4 left-20 w-80 h-80 bg-sg-accent2/5 rounded-full blur-3xl animate-float' style={{animationDelay: '1s'}}></div>
      </div>
      
      {/* Hero Section */}
      <section className='relative bg-gradient-hero py-20 lg:py-32'>
        <div className={designUtils.getContainerClasses('lg')}>
          <div className='text-center space-y-8 animate-fade-in'>
            <h1 className={designUtils.getHeadingClasses('h1')}>
              Our Services
            </h1>
            <p className={designUtils.getTextClasses('large')}>
              Discover our comprehensive range of professional services designed to meet all your needs
            </p>
            
            {/* Futuristic accent line */}
            <div className='flex justify-center'>
              <div className='w-24 h-1 bg-gradient-accent rounded-full'></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Service Categories */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='space-y-20 py-20'>
          {serviceCategories.map((category, index) => (
            <div key={index} className='space-y-8 animate-fade-in' style={{animationDelay: `${0.2 * index}s`}}>
              <div className='text-center space-y-6'>
                <h2 className={designUtils.getHeadingClasses('h2')}>
                  {category.title}
                </h2>
                <p className={designUtils.getTextClasses('medium')}>
                  {category.description}
                </p>
              </div>
              
              <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {category.services.map((service, serviceIndex) => (
                  <div 
                    key={serviceIndex}
                    className={componentStyles.card.base + ' p-6 text-center group hover:scale-105 transition-transform duration-300'}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <span className='text-2xl'>{category.icon}</span>
                    </div>
                    <h3 className='text-lg font-semibold text-sg-secondary mb-2'>{service}</h3>
                    <p className={designUtils.getTextClasses('small')}>
                      Professional {service.toLowerCase()} services
                    </p>
                  </div>
                ))}
              </div>
              
              <div className='text-center'>
                <Link 
                  href={`/services/${category.title.toLowerCase().replace(' ', '-')}/book`}
                  className={designUtils.getButtonClasses('outline')}
                >
                  Book {category.title}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Why Choose Us */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='text-center space-y-16 py-20'>
          <div className='space-y-6 animate-fade-in'>
            <h2 className={designUtils.getHeadingClasses('h2')}>
              Why Choose SewaGo?
            </h2>
            <p className={designUtils.getTextClasses('large')}>
              We're committed to providing the best service experience
            </p>
          </div>
          
          <div className='grid md:grid-cols-3 gap-8'>
            {[
              {
                icon: '✅',
                title: 'Verified Professionals',
                description: 'All our service providers undergo thorough background checks and skill verification.'
              },
              {
                icon: '💰',
                title: 'Transparent Pricing',
                description: 'No hidden fees. All costs are clearly communicated upfront before service begins.'
              },
              {
                icon: '🛡️',
                title: 'Quality Guarantee',
                description: '30-day satisfaction guarantee on all completed work.'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={componentStyles.card.base + ' p-8 text-center animate-slide-up'}
                style={{animationDelay: `${0.2 * index}s`}}
              >
                <div className='w-16 h-16 bg-gradient-accent rounded-2xl mx-auto mb-6 flex items-center justify-center'>
                  <span className='text-2xl'>{feature.icon}</span>
                </div>
                <h3 className='text-xl font-bold text-sg-secondary mb-4'>{feature.title}</h3>
                <p className={designUtils.getTextClasses('small')}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='text-center space-y-16 py-20'>
          <div className='space-y-6 animate-fade-in'>
            <h2 className={designUtils.getHeadingClasses('h2')}>
              How It Works
            </h2>
            <p className={designUtils.getTextClasses('large')}>
              Getting started is simple and straightforward
            </p>
          </div>
          
          <div className='grid md:grid-cols-4 gap-8'>
            {[
              {
                step: '1',
                title: 'Search',
                description: 'Find the service you need from our comprehensive catalog'
              },
              {
                step: '2',
                title: 'Choose',
                description: 'Browse providers, read reviews, and select the best match'
              },
              {
                step: '3',
                title: 'Book',
                description: 'Schedule your service at a time that works for you'
              },
              {
                step: '4',
                title: 'Enjoy',
                description: 'Relax while our professionals deliver quality service'
              }
            ].map((step, index) => (
              <div 
                key={index}
                className='relative animate-slide-up'
                style={{animationDelay: `${0.1 * index}s`}}
              >
                <div className={componentStyles.card.base + ' p-6 text-center'}>
                  <div className='w-16 h-16 bg-gradient-accent rounded-full mx-auto mb-4 flex items-center justify-center'>
                    <span className='text-2xl font-bold text-sg-secondary'>{step.step}</span>
                  </div>
                  <h3 className='text-lg font-semibold text-sg-secondary mb-3'>{step.title}</h3>
                  <p className={designUtils.getTextClasses('small')}>{step.description}</p>
                </div>
                
                {/* Connector line */}
                {index < 3 && (
                  <div className='hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-accent transform -translate-y-1/2'></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className={designUtils.getContainerClasses('md')}>
        <div className='text-center space-y-8 py-20'>
          <div className={componentStyles.card.base + ' p-8 max-w-2xl mx-auto'}>
            <h3 className='text-2xl font-bold text-sg-secondary mb-4'>Ready to Get Started?</h3>
            <p className={designUtils.getTextClasses('medium') + ' mb-6'}>
              Join thousands of satisfied customers who trust SewaGo for their service needs
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link href='/search' className={designUtils.getButtonClasses('primary')}>
                Find Services
              </Link>
              <Link href='/contact' className={designUtils.getButtonClasses('outline')}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Bottom accent line */}
      <div className='fixed bottom-0 left-0 right-0 h-1 bg-gradient-accent opacity-40'></div>
    </main>
  );
}


