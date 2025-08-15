

import { Metadata } from 'next';
import Link from 'next/link';
import { designUtils, componentStyles } from '@/lib/design-system';

export const metadata: Metadata = {
  title: 'About SewaGo - Local Services in Nepal | Our Story & Mission',
  description: 'Learn about SewaGo, Nepal\'s leading local service platform. Discover our mission to connect households with verified professionals and build stronger communities.',
  keywords: 'about SewaGo, local services Nepal, our mission, company story, verified providers, community building, SewaGo team',
};

export default function AboutPage() {
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
              About SewaGo
            </h1>
                          <p className={designUtils.getTextClasses('large')}>
              Revolutionizing local services in Nepal through technology and trust
            </p>
            
            {/* Performance Dashboard Link */}
            <div className='flex justify-center'>
              <Link 
                href='/performance' 
                className='inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-all duration-200 border border-white/20'
              >
                <span>📊</span>
                <span>View Live Performance Dashboard</span>
              </Link>
            </div>
            
            {/* Modern accent line */}
            <div className='flex justify-center mt-6'>
              <div className='w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full'></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='grid lg:grid-cols-2 gap-16 py-20 items-center'>
          <div className='space-y-6 animate-fade-up'>
            <h2 className={designUtils.getHeadingClasses('h2')}>
              Our Mission
            </h2>
            <p className={designUtils.getTextClasses('large')}>
              To connect every household in Nepal with reliable, professional service providers, 
              making quality services accessible and affordable for everyone.
            </p>
            <p className={designUtils.getTextClasses('medium')}>
              We believe that every home deserves access to professional services without the hassle 
              of searching through unreliable sources or overpaying for subpar work.
            </p>
          </div>
          
          <div className='animate-fade-up' style={{animationDelay: '0.2s'}}>
            <div className={componentStyles.card.elevated + ' p-8 text-center'}>
              <div className='w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl mx-auto mb-6 flex items-center justify-center'>
                <span className='text-4xl'>🏠</span>
              </div>
              <h3 className='text-2xl font-bold text-white mb-4'>Home Services</h3>
              <p className={designUtils.getTextClasses('small')}>
                From electrical work to cleaning, we cover all your home service needs
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='text-center space-y-16 py-20'>
          <div className='space-y-6 animate-fade-up'>
            <h2 className={designUtils.getHeadingClasses('h2')}>
              Our Values
            </h2>
            <p className={designUtils.getTextClasses('large')}>
              The principles that guide everything we do
            </p>
          </div>
          
          <div className='grid md:grid-cols-3 gap-8'>
            {[
              {
                icon: '🤝',
                title: 'Trust & Reliability',
                description: 'We verify every service provider to ensure you get quality, reliable service every time.'
              },
              {
                icon: '💎',
                title: 'Quality First',
                description: 'We never compromise on quality. Every service meets our high standards.'
              },
              {
                icon: '🌱',
                title: 'Community Growth',
                description: 'We\'re building a stronger community by supporting local service providers.'
              }
            ].map((value, index) => (
              <div 
                key={index}
                className={componentStyles.card.base + ' p-8 text-center animate-slide-up'}
                style={{animationDelay: `${0.2 * index}s`}}
              >
                <div className='w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl mx-auto mb-6 flex items-center justify-center'>
                  <span className='text-3xl'>{value.icon}</span>
                </div>
                <h3 className='text-xl font-bold text-white mb-4'>{value.title}</h3>
                <p className={designUtils.getTextClasses('small')}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Story Section */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='grid lg:grid-cols-2 gap-16 py-20 items-center'>
          <div className='animate-fade-up' style={{animationDelay: '0.4s'}}>
            <div className={componentStyles.card.elevated + ' p-8'}>
              <h3 className='text-2xl font-bold text-white mb-6'>Our Story</h3>
              <div className='space-y-4'>
                <p className={designUtils.getTextClasses('small')}>
                  Founded in 2024, SewaGo was born from a simple observation: finding reliable 
                  local services in Nepal was unnecessarily difficult and often resulted in 
                  poor quality or overpriced work.
                </p>
                <p className={designUtils.getTextClasses('small')}>
                  We set out to change this by creating a platform that connects verified 
                  professionals with customers who need their services, ensuring quality, 
                  transparency, and fair pricing for everyone involved.
                </p>
              </div>
            </div>
          </div>
          
          <div className='space-y-6 animate-fade-up' style={{animationDelay: '0.6s'}}>
            <h2 className={designUtils.getHeadingClasses('h2')}>
              Building the Future
            </h2>
            <p className={designUtils.getTextClasses('large')}>
              We're not just building a service platform; we're building a community of 
              trusted professionals and satisfied customers.
            </p>
            <p className={designUtils.getTextClasses('medium')}>
              Our vision extends beyond today's needs. We're creating an ecosystem that 
              supports local businesses, improves service quality, and makes professional 
              services accessible to every household in Nepal.
            </p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className={designUtils.getContainerClasses('md')}>
        <div className='text-center space-y-8 py-20'>
          <div className={componentStyles.card.base + ' p-8 max-w-2xl mx-auto'}>
            <h3 className='text-2xl font-bold text-white mb-4'>Join Our Mission</h3>
            <p className={designUtils.getTextClasses('medium') + ' mb-6'}>
              Whether you're looking for services or want to provide them, 
              we'd love to have you as part of the SewaGo community.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button className={designUtils.getButtonClasses('primary')}>
                Find Services
              </button>
              <button className={designUtils.getButtonClasses('outline')}>
                Become a Provider
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
