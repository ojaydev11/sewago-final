import { Metadata } from 'next';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Star, Clock, Shield, Users, CheckCircle } from 'lucide-react';
import { designUtils, componentStyles } from '@/lib/design-system';
import SchemaMarkup from '@/components/SchemaMarkup';

export const metadata: Metadata = {
  title: 'Local Services in Kathmandu - SewaGo | Electrician, Plumber, Cleaner, Tutor',
  description: 'Find trusted local service providers in Kathmandu, Nepal. Professional electricians, plumbers, cleaners, and tutors available in Thamel, Lalitpur, Bhaktapur, and surrounding areas. Book verified professionals today.',
  keywords: 'services Kathmandu, electrician Kathmandu, plumber Kathmandu, cleaner Kathmandu, tutor Kathmandu, local services Nepal, Thamel services, Lalitpur services, Bhaktapur services',
};

const kathmanduSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "SewaGo - Local Services in Kathmandu",
  "description": "Professional local services in Kathmandu, Nepal including electrical work, plumbing, cleaning, and tutoring",
  "url": "https://sewago.com/services-in-kathmandu",
  "telephone": "+977-9800000000",
  "email": "hello@sewago.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Thamel, Kathmandu",
    "addressLocality": "Kathmandu",
    "addressRegion": "Bagmati",
    "postalCode": "44600",
    "addressCountry": "NP"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 27.7172,
    "longitude": 85.3240
  },
  "areaServed": {
    "@type": "City",
    "name": "Kathmandu"
  },
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": 27.7172,
      "longitude": 85.3240
    },
    "geoRadius": "25000"
  }
};

const popularAreas = [
  { name: 'Thamel', description: 'Tourist hub with diverse service needs', icon: '🏪' },
  { name: 'Lalitpur', description: 'Traditional Newari architecture services', icon: '🏛️' },
  { name: 'Bhaktapur', description: 'Heritage site maintenance and services', icon: '🏺' },
  { name: 'Patan', description: 'Modern and traditional service requirements', icon: '🏢' },
  { name: 'Baneshwor', description: 'Business district services', icon: '💼' },
  { name: 'Koteshwor', description: 'Residential area service providers', icon: '🏠' }
];

const services = [
  {
    name: 'Electrical Services',
    description: 'Professional electrical work for homes and businesses in Kathmandu',
    icon: '⚡',
    features: ['Wiring & Installation', 'Repairs & Maintenance', 'Emergency Services', 'Safety Inspections'],
    price: 'From Rs 500'
  },
  {
    name: 'Plumbing Services',
    description: 'Expert plumbing solutions for Kathmandu homes and offices',
    icon: '🔧',
    features: ['Pipe Repairs', 'Installation', 'Drain Cleaning', '24/7 Emergency'],
    price: 'From Rs 800'
  },
  {
    name: 'Cleaning Services',
    description: 'Comprehensive cleaning for Kathmandu residences and businesses',
    icon: '🧹',
    features: ['House Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Festival Cleaning'],
    price: 'From Rs 1,000'
  },
  {
    name: 'Tutoring Services',
    description: 'Qualified tutors for all subjects in Kathmandu',
    icon: '📚',
    features: ['Academic Support', 'Test Preparation', 'Language Learning', 'Home Tutoring'],
    price: 'From Rs 1,500'
  }
];

export default function ServicesInKathmanduPage() {
  return (
    <>
      <SchemaMarkup schema={kathmanduSchema} />
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
              <div className='space-y-4'>
                <h1 className={designUtils.getHeadingClasses('h1')}>
                  Local Services in Kathmandu
                </h1>
                <p className='text-2xl sm:text-3xl text-white/90 font-light leading-relaxed animate-slide-up' style={{animationDelay: '0.2s'}}>
                  Professional Services for Every Home in Kathmandu Valley
                </p>
              </div>
              
              {/* Location Badge */}
              <div className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-6 py-3'>
                <MapPin className='w-5 h-5 text-accent' />
                <span className='text-white font-medium'>Available in Kathmandu, Lalitpur, Bhaktapur</span>
              </div>
              
              {/* Modern accent line */}
              <div className='flex justify-center'>
                <div className='w-24 h-1 bg-gradient-to-r from-accent to-primary rounded-full'></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Services Overview */}
        <section className={designUtils.getContainerClasses('lg')}>
          <div className='py-20'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl font-bold text-white mb-4'>
                Professional Services in Kathmandu
              </h2>
              <p className='text-lg text-white/80 max-w-3xl mx-auto'>
                From the historic streets of Thamel to the modern developments in Baneshwor, 
                our verified professionals serve every corner of Kathmandu Valley with local expertise.
              </p>
            </div>
            
            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {services.map((service, index) => (
                <Card 
                  key={index} 
                  className={componentStyles.card.base + ' p-6 text-center hover:scale-105 transition-transform duration-300'}
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <CardHeader className='pb-4'>
                    <div className='w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <span className='text-3xl'>{service.icon}</span>
                    </div>
                    <CardTitle className='text-xl text-white'>{service.name}</CardTitle>
                    <CardDescription className='text-white/80'>
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className='flex items-center gap-2 text-sm text-white/80'>
                          <CheckCircle className='w-4 h-4 text-accent flex-shrink-0' />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className='pt-4'>
                      <span className='text-lg font-bold text-accent'>{service.price}</span>
                    </div>
                    <Button className='w-full bg-gradient-to-r from-primary to-accent text-white hover:from-primary-light hover:to-accent-light'>
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Popular Areas in Kathmandu */}
        <section className={designUtils.getContainerClasses('lg')}>
          <div className='py-20'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl font-bold text-white mb-4'>
                Popular Service Areas in Kathmandu
              </h2>
              <p className='text-lg text-white/80 max-w-3xl mx-auto'>
                Our service providers are available throughout Kathmandu Valley, 
                serving both traditional neighborhoods and modern developments.
              </p>
            </div>
            
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {popularAreas.map((area, index) => (
                <div 
                  key={index}
                  className={componentStyles.card.base + ' p-6 text-center hover:scale-105 transition-transform duration-300'}
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <div className='w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <span className='text-3xl'>{area.icon}</span>
                  </div>
                  <h3 className='text-xl font-bold text-white mb-2'>{area.name}</h3>
                  <p className='text-white/80 text-sm mb-4'>{area.description}</p>
                  <Link href={`/services?location=${area.name.toLowerCase()}`}>
                    <Button variant="outline" className='w-full border-white/30 text-white hover:bg-white/20'>
                      View Services
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Why Choose Local Kathmandu Services */}
        <section className={designUtils.getContainerClasses('lg')}>
          <div className='py-20'>
            <div className='max-w-6xl mx-auto'>
              <div className='grid lg:grid-cols-2 gap-12 items-center'>
                <div className='space-y-6'>
                  <h2 className='text-3xl font-bold text-white'>
                    Why Choose Local Kathmandu Service Providers?
                  </h2>
                  <div className='space-y-4'>
                    <div className='flex items-start gap-3'>
                      <div className='w-6 h-6 bg-accent rounded-full flex-shrink-0 mt-1'></div>
                      <div>
                        <h3 className='font-semibold text-white mb-1'>Local Knowledge</h3>
                        <p className='text-white/80'>Understanding of Kathmandu's unique infrastructure, from traditional Newari homes to modern apartments.</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3'>
                      <div className='w-6 h-6 bg-accent rounded-full flex-shrink-0 mt-1'></div>
                      <div>
                        <h3 className='font-semibold text-white mb-1'>Cultural Sensitivity</h3>
                        <p className='text-white/80'>Respect for local customs, festivals, and daily routines that are unique to Kathmandu Valley.</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3'>
                      <div className='w-6 h-6 bg-accent rounded-full flex-shrink-0 mt-1'></div>
                      <div>
                        <h3 className='font-semibold text-white mb-1'>Quick Response</h3>
                        <p className='text-white/80'>Fast service delivery within Kathmandu Valley, often within 2-4 hours for urgent requests.</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3'>
                      <div className='w-6 h-6 bg-accent rounded-full flex-shrink-0 mt-1'></div>
                      <div>
                        <h3 className='font-semibold text-white mb-1'>Community Trust</h3>
                        <p className='text-white/80'>Local professionals who are part of your community and invested in maintaining their reputation.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={componentStyles.card.base + ' p-8 text-center'}>
                  <h3 className='text-2xl font-bold text-white mb-6'>
                    Kathmandu Valley Coverage
                  </h3>
                  <div className='space-y-3 text-sm'>
                    <div className='text-white/80'>• Kathmandu Metropolitan City</div>
                    <div className='text-white/80'>• Lalitpur Metropolitan City</div>
                    <div className='text-white/80'>• Bhaktapur Municipality</div>
                    <div className='text-white/80'>• Kirtipur Municipality</div>
                    <div className='text-white/80'>• Madhyapur Thimi Municipality</div>
                    <div className='text-white/80'>• And surrounding areas</div>
                  </div>
                  <div className='mt-6 p-4 bg-accent/20 rounded-lg'>
                    <p className='text-white/90 text-sm'>
                      <strong>Emergency Services:</strong> Available 24/7 across Kathmandu Valley
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className={designUtils.getContainerClasses('md')}>
          <div className='text-center space-y-8 py-20'>
            <div className={componentStyles.card.base + ' p-8 max-w-2xl mx-auto'}>
              <h3 className='text-2xl font-bold text-white mb-4'>
                Ready to Book a Service in Kathmandu?
              </h3>
              <p className='text-white/80 mb-6'>
                Join thousands of Kathmandu residents who trust SewaGo for their daily service needs. 
                Experience the convenience of local, verified professionals at your doorstep.
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
    </>
  );
}
