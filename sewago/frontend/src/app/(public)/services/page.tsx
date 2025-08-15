import { Metadata } from 'next';
import Link from 'next/link';
import { getServices } from '@/lib/services';
import ServiceGrid from '@/components/services/ServiceGrid';
import { designUtils, componentStyles } from '@/lib/design-system';

export const metadata: Metadata = {
  title: 'Local Services in Nepal - SewaGo | Electrician, Plumber, Cleaner, Tutor',
  description: 'Find trusted local service providers in Nepal for electrical work, plumbing, cleaning, tutoring and more. Book verified professionals for your home and business needs. Available in Kathmandu, Pokhara, Lalitpur and across Nepal.',
  keywords: 'local services Nepal, electrician Kathmandu, plumber Pokhara, cleaner Lalitpur, tutor Nepal, home services, professional services, verified providers, SewaGo, सेवागो, स्थानीय सेवाहरू',
};

export default async function ServicesPage() {
  const services = await getServices();

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
      
      {/* Services Grid */}
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
          
          <ServiceGrid services={services} />
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
                      <h3 className='font-semibold text-white mb-1'>Language Comfort</h3>
                      <p className='text-white/80'>Communicate comfortably in Nepali, Newari, or English - whatever makes you feel most at ease.</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-6 h-6 bg-accent rounded-full flex-shrink-0 mt-1'></div>
                    <div>
                      <h3 className='font-semibold text-white mb-1'>Community Trust</h3>
                      <p className='text-white/80'>Build lasting relationships with local professionals who are part of your community and invested in your satisfaction.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={componentStyles.card.base + ' p-8 text-center'}>
                <h3 className='text-2xl font-bold text-white mb-6'>
                  Available Across Nepal
                </h3>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='text-white/80'>• Kathmandu (काठमाडौं)</div>
                  <div className='text-white/80'>• Pokhara (पोखरा)</div>
                  <div className='text-white/80'>• Lalitpur (ललितपुर)</div>
                  <div className='text-white/80'>• Bhaktapur (भक्तपुर)</div>
                  <div className='text-white/80'>• Patan (पाटन)</div>
                  <div className='text-white/80'>• Biratnagar (बिराटनगर)</div>
                  <div className='text-white/80'>• Birgunj (बिरगंज)</div>
                  <div className='text-white/80'>• Dharan (धरान)</div>
                </div>
                <p className='text-white/60 text-sm mt-4'>
                  And many more cities and villages across Nepal
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Service Categories with Local Context */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='py-16'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-white mb-4'>
              Popular Service Categories
            </h2>
            <p className='text-lg text-white/80'>
              Services that Nepali families trust and rely on daily
            </p>
          </div>
          
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className={componentStyles.card.base + ' p-6 text-center hover:scale-105 transition-transform duration-300'}>
              <div className='w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>⚡</span>
              </div>
              <h3 className='text-xl font-bold text-white mb-2'>Electrical Services</h3>
              <p className='text-white/80 text-sm'>
                From traditional homes to modern apartments, our electricians handle all electrical needs with local expertise.
              </p>
            </div>
            
            <div className={componentStyles.card.base + ' p-6 text-center hover:scale-105 transition-transform duration-300'}>
              <div className='w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>🔧</span>
              </div>
              <h3 className='text-xl font-bold text-white mb-2'>Plumbing Services</h3>
              <p className='text-white/80 text-sm'>
                Expert plumbers who understand Nepali water systems, traditional bathrooms, and modern plumbing requirements.
              </p>
            </div>
            
            <div className={componentStyles.card.base + ' p-6 text-center hover:scale-105 transition-transform duration-300'}>
              <div className='w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>🧹</span>
              </div>
              <h3 className='text-xl font-bold text-white mb-2'>Cleaning Services</h3>
              <p className='text-white/80 text-sm'>
                Professional cleaning for homes, offices, and special occasions like Dashain, Tihar, and other Nepali festivals.
              </p>
            </div>
            
            <div className={componentStyles.card.base + ' p-6 text-center hover:scale-105 transition-transform duration-300'}>
              <div className='w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>📚</span>
              </div>
              <h3 className='text-xl font-bold text-white mb-2'>Tutoring Services</h3>
              <p className='text-white/80 text-sm'>
                Qualified tutors for all subjects, including Nepali language, mathematics, science, and English, following Nepali curriculum.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className={designUtils.getContainerClasses('md')}>
        <div className='text-center space-y-8 py-20'>
          <div className={componentStyles.card.base + ' p-8 max-w-2xl mx-auto'}>
            <h3 className='text-2xl font-bold text-white mb-4'>
              Ready to Experience Local Excellence?
            </h3>
            <p className='text-white/80 mb-6'>
              Join thousands of Nepali families who trust SewaGo for their daily service needs. Book a service today and experience the difference that local expertise makes.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link href='/services' className={designUtils.getButtonClasses('primary')}>
                Browse All Services
              </Link>
              <Link href='/contact' className={designUtils.getButtonClasses('outline')}>
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Bottom accent line */}
      <div className='fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-primary opacity-40'></div>
    </main>
  );
}


