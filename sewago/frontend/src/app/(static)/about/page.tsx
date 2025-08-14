
import { designUtils, componentStyles } from '@/lib/design-system';

export default function AboutPage() {
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
              About SewaGo
            </h1>
            <p className={designUtils.getTextClasses('large')}>
              Revolutionizing local services with cutting-edge technology and human-centered design
            </p>
            
            {/* Futuristic accent line */}
            <div className='flex justify-center'>
              <div className='w-24 h-1 bg-gradient-accent rounded-full'></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='grid lg:grid-cols-2 gap-16 items-center py-20'>
          <div className='space-y-6 animate-slide-up'>
            <h2 className={designUtils.getHeadingClasses('h2')}>
              Our Mission
            </h2>
            <p className={designUtils.getTextClasses('medium')}>
              To connect local service providers with customers through an intuitive, 
              AI-powered platform that makes finding and booking services effortless.
            </p>
            <p className={designUtils.getTextClasses('medium')}>
              We believe in empowering local businesses while providing customers 
              with reliable, professional services at their fingertips.
            </p>
          </div>
          
          <div className='relative animate-fade-in' style={{animationDelay: '0.3s'}}>
            <div className={componentStyles.card.elevated + ' p-8 text-center'}>
              <div className='w-20 h-20 bg-gradient-accent rounded-2xl mx-auto mb-6 flex items-center justify-center'>
                <span className='text-3xl'>🎯</span>
              </div>
              <h3 className='text-2xl font-bold text-sg-secondary mb-4'>Vision</h3>
              <p className={designUtils.getTextClasses('small')}>
                To become the leading platform for local services in Nepal, 
                setting new standards for quality and convenience.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='text-center space-y-16 py-20'>
          <div className='space-y-6 animate-fade-in'>
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
                description: 'Building lasting relationships through transparency and consistent service delivery.'
              },
              {
                icon: '💡',
                title: 'Innovation',
                description: 'Continuously improving our platform with cutting-edge technology and user feedback.'
              },
              {
                icon: '🌱',
                title: 'Community Growth',
                description: 'Supporting local businesses and fostering economic development in our communities.'
              }
            ].map((value, index) => (
              <div 
                key={index}
                className={componentStyles.card.base + ' p-8 text-center animate-slide-up'}
                style={{animationDelay: `${0.2 * index}s`}}
              >
                <div className='w-16 h-16 bg-gradient-accent rounded-2xl mx-auto mb-6 flex items-center justify-center'>
                  <span className='text-2xl'>{value.icon}</span>
                </div>
                <h3 className='text-xl font-bold text-sg-secondary mb-4'>{value.title}</h3>
                <p className={designUtils.getTextClasses('small')}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='text-center space-y-16 py-20'>
          <div className='space-y-6 animate-fade-in'>
            <h2 className={designUtils.getHeadingClasses('h2')}>
              Meet Our Team
            </h2>
            <p className={designUtils.getTextClasses('large')}>
              Passionate professionals dedicated to transforming local services
            </p>
          </div>
          
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {[
              {
                name: 'Development Team',
                role: 'Engineering Excellence',
                description: 'Building robust, scalable solutions that power our platform.'
              },
              {
                name: 'Design Team',
                role: 'User Experience',
                description: 'Creating intuitive interfaces that delight our users.'
              },
              {
                name: 'Business Team',
                role: 'Strategic Growth',
                description: 'Expanding our reach and building partnerships.'
              }
            ].map((member, index) => (
              <div 
                key={index}
                className={componentStyles.card.base + ' p-6 text-center animate-slide-up'}
                style={{animationDelay: `${0.3 * index}s`}}
              >
                <div className='w-16 h-16 bg-gradient-accent rounded-full mx-auto mb-4 flex items-center justify-center'>
                  <span className='text-xl font-bold text-sg-secondary'>👥</span>
                </div>
                <h3 className='text-lg font-bold text-sg-secondary mb-2'>{member.name}</h3>
                <p className='text-sm text-sg-accent1 font-medium mb-3'>{member.role}</p>
                <p className={designUtils.getTextClasses('small')}>{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className={designUtils.getContainerClasses('md')}>
        <div className='text-center space-y-8 py-20'>
          <div className='space-y-6 animate-fade-in'>
            <h2 className={designUtils.getHeadingClasses('h3')}>
              Join Us on This Journey
            </h2>
            <p className={designUtils.getTextClasses('medium')}>
              Whether you're a service provider or customer, we'd love to have you 
              be part of the SewaGo community.
            </p>
          </div>
          
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button className={designUtils.getButtonClasses('primary')}>
              Get Started Today
            </button>
            <button className={designUtils.getButtonClasses('outline')}>
              Learn More
            </button>
          </div>
        </div>
      </section>
      
      {/* Bottom accent line */}
      <div className='fixed bottom-0 left-0 right-0 h-1 bg-gradient-accent opacity-40'></div>
    </main>
  );
}
