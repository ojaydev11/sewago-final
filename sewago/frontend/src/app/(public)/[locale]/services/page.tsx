import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { getServices } from '@/lib/services';
import ServiceGrid from '@/components/services/ServiceGrid';
import ServiceGridSkeleton from '@/components/services/ServiceGridSkeleton';
import { designUtils, componentStyles } from '@/lib/design-system';

export const metadata: Metadata = {
  title: 'Local Services in Nepal - SewaGo | Electrician, Plumber, Cleaner, Tutor',
  description: 'Find trusted local service providers in Nepal for electrical work, plumbing, cleaning, tutoring and more. Book verified professionals for your home and business needs. Available in Kathmandu, Pokhara, Lalitpur and across Nepal.',
  keywords: 'local services Nepal, electrician Kathmandu, plumber Pokhara, cleaner Lalitpur, tutor Nepal, home services, professional services, verified providers, SewaGo, सेवागो, स्थानीय सेवाहरू',
};

// Separate async component for services data
async function ServicesData() {
  const services = await getServices();
  return <ServiceGrid services={services} />;
}

export default function ServicesPage() {
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
              Professional Services
            </h1>
            <p className={designUtils.getTextClasses('large')}>
              Connect with verified local professionals across Nepal
            </p>
            
            {/* Modern accent line */}
            <div className='flex justify-center'>
              <div className='w-24 h-1 bg-gradient-to-r from-accent to-primary rounded-full'></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Services Introduction */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='py-16'>
          <div className='max-w-4xl mx-auto text-center space-y-6'>
            <h2 className='text-3xl font-bold text-white mb-6'>
              Trusted Local Services for Every Home in Nepal
            </h2>
            <p className='text-lg text-white/90 leading-relaxed'>
              From the bustling streets of Kathmandu to the serene valleys of Pokhara, SewaGo connects you with verified professionals who understand local needs and cultural preferences. Whether you need an electrician for your home in Lalitpur, a plumber in Bhaktapur, or a tutor for your children in Patan, we ensure quality service delivery with local expertise.
            </p>
            <p className='text-lg text-white/90 leading-relaxed'>
              Our service providers are not just skilled professionals - they're your neighbors who understand the unique challenges of Nepali homes, from traditional Newari architecture to modern apartments. They speak your language, respect local customs, and provide services that fit perfectly with the Nepali way of life.
            </p>
          </div>
        </div>
      </section>
      
      {/* Services Grid with Suspense */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='py-16'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-white mb-4'>
              Our Services
            </h2>
            <p className='text-lg text-white/80 max-w-2xl mx-auto'>
              Professional services tailored for Nepali homes and businesses
            </p>
          </div>
          
          <Suspense fallback={<ServiceGridSkeleton />}>
            <ServicesData />
          </Suspense>
        </div>
      </section>
      
      {/* Local Expertise Section */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='py-16'>
          <div className='max-w-6xl mx-auto'>
            <div className='grid lg:grid-cols-2 gap-12 items-center'>
              <div className='space-y-6'>
                <h2 className='text-3xl font-bold text-white'>
                  Why Choose Local Nepali Professionals?
                </h2>
                <div className='space-y-4'>
                  <div className='flex items-start gap-3'>
                    <div className='w-6 h-6 bg-accent rounded-full flex-shrink-0 mt-1'></div>
                    <div>
                      <h3 className='font-semibold text-white mb-1'>Cultural Understanding</h3>
                      <p className='text-white/80'>Our providers understand Nepali customs, festivals, and daily routines, ensuring services fit seamlessly into your lifestyle.</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-6 h-6 bg-accent rounded-full flex-shrink-0 mt-1'></div>
                    <div>
                      <h3 className='font-semibold text-white mb-1'>Local Knowledge</h3>
                      <p className='text-white/80'>From traditional Newari homes to modern apartments, they know the unique characteristics of Nepali architecture and infrastructure.</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-6 h-6 bg-accent rounded-full flex-shrink-0 mt-1'></div>
                    <div>
                      <h3 className='font-semibold text-white mb-1'>Language & Communication</h3>
                      <p className='text-white/80'>Clear communication in Nepali, Newari, or English ensures you're always understood and your requirements are met precisely.</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-6 h-6 bg-accent rounded-full flex-shrink-0 mt-1'></div>
                    <div>
                      <h3 className='font-semibold text-white mb-1'>Community Trust</h3>
                      <p className='text-white/80'>Our providers are part of your community, building long-term relationships based on trust, reliability, and local reputation.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className='relative'>
                <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8'>
                  <h3 className='text-2xl font-bold text-white mb-6'>
                    Local Service Excellence
                  </h3>
                  <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0'>
                        <span className='text-white font-bold text-sm'>1</span>
                      </div>
                      <div>
                        <h4 className='font-semibold text-white'>Verified Professionals</h4>
                        <p className='text-white/70 text-sm'>All providers undergo background checks and skill verification</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0'>
                        <span className='text-white font-bold text-sm'>2</span>
                      </div>
                      <div>
                        <h4 className='font-semibold text-white'>Local Expertise</h4>
                        <p className='text-white/70 text-sm'>Deep understanding of Nepali homes and infrastructure</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0'>
                        <span className='text-white font-bold text-sm'>3</span>
                      </div>
                      <div>
                        <h4 className='font-semibold text-white'>Cultural Sensitivity</h4>
                        <p className='text-white/70 text-sm'>Respect for local customs and traditions</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className='absolute -top-4 -right-4 w-8 h-8 bg-accent rounded-full opacity-60 animate-pulse'></div>
                <div className='absolute -bottom-4 -left-4 w-6 h-6 bg-primary rounded-full opacity-60 animate-pulse' style={{animationDelay: '0.5s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className={designUtils.getContainerClasses('md')}>
        <div className='text-center space-y-8 py-20'>
          <div className={componentStyles.card.base + ' p-8 max-w-2xl mx-auto'}>
            <h3 className='text-2xl font-bold text-white mb-4'>Ready to Get Started?</h3>
            <p className='text-white/80 mb-6'>
              Connect with trusted local professionals today and experience the difference that local expertise makes.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link href='/contact' className={designUtils.getButtonClasses('primary')}>
                Contact Us
              </Link>
              <Link href='/faqs' className={designUtils.getButtonClasses('outline')}>
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Bottom accent line */}
      <div className='fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-40'></div>
    </main>
  );
}


