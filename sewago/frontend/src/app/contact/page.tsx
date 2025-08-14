

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { designUtils, componentStyles } from '@/lib/design-system';
import Location from '@/components/Location';
import { Mail, Phone, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - SewaGo | Get in Touch for Local Services in Nepal',
  description: 'Contact SewaGo for local services in Nepal. Reach out to our team for support, questions, or to book services. Available in Kathmandu, Pokhara, and across Nepal.',
  keywords: 'contact SewaGo, local services Nepal, support, customer service, Kathmandu services, Nepal contact',
};

export default function ContactPage() {
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
              Get in Touch
            </h1>
            <p className='text-2xl sm:text-3xl text-white/90 font-light leading-relaxed animate-slide-up' style={{animationDelay: '0.2s'}}>
              We're here to help with all your local service needs
            </p>
            
            {/* Modern accent line */}
            <div className='flex justify-center'>
              <div className='w-24 h-1 bg-gradient-to-r from-accent to-primary rounded-full'></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Information */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='py-20'>
          <div className='grid lg:grid-cols-2 gap-12'>
            {/* Contact Form */}
            <div className='space-y-6'>
              <div className='space-y-4'>
                <h2 className='text-3xl font-bold text-white mb-6'>
                  Send us a Message
                </h2>
                <p className='text-white/80 text-lg'>
                  Have a question or need assistance? Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </div>
              
              <div className={componentStyles.card.base + ' p-8'}>
                <form className='space-y-6'>
                  <div className='grid md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='firstName' className='text-white font-medium'>First Name</Label>
                      <Input 
                        id='firstName' 
                        placeholder='Enter your first name'
                        className='bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='lastName' className='text-white font-medium'>Last Name</Label>
                      <Input 
                        id='lastName' 
                        placeholder='Enter your last name'
                        className='bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent'
                      />
                    </div>
                  </div>
                  
                  <div className='space-y-2'>
                    <Label htmlFor='email' className='text-white font-medium'>Email</Label>
                    <Input 
                      id='email' 
                      type='email'
                      placeholder='Enter your email address'
                      className='bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent'
                    />
                  </div>
                  
                  <div className='space-y-2'>
                    <Label htmlFor='phone' className='text-white font-medium'>Phone Number</Label>
                    <Input 
                      id='phone' 
                      type='tel'
                      placeholder='Enter your phone number'
                      className='bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent'
                    />
                  </div>
                  
                  <div className='space-y-2'>
                    <Label htmlFor='message' className='text-white font-medium'>Message</Label>
                    <Textarea 
                      id='message' 
                      rows={4}
                      placeholder='Tell us how we can help you'
                      className='bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent resize-none'
                    />
                  </div>
                  
                  <Button 
                    type='submit' 
                    className={designUtils.getButtonClasses('primary') + ' w-full'}
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
            
            {/* Contact Details */}
            <div className='space-y-8'>
              <div className='space-y-6'>
                <h2 className='text-3xl font-bold text-white mb-6'>
                  Contact Information
                </h2>
                <p className='text-white/80 text-lg'>
                  Get in touch with us through any of these channels. We're here to help 24/7.
                </p>
              </div>
              
              <div className='space-y-6'>
                <div className={componentStyles.card.base + ' p-6 flex items-start gap-4'}>
                  <div className='w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-xl flex items-center justify-center flex-shrink-0'>
                    <Mail className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold text-white mb-2'>Email Support</h3>
                    <p className='text-white/70 mb-2'>support@sewago.com</p>
                    <p className='text-white/60 text-sm'>Response within 2 hours</p>
                  </div>
                </div>
                
                <div className={componentStyles.card.base + ' p-6 flex items-start gap-4'}>
                  <div className='w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-xl flex items-center justify-center flex-shrink-0'>
                    <Phone className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold text-white mb-2'>Phone Support</h3>
                    <p className='text-white/70 mb-2'>+977-1-4XXXXXX</p>
                    <p className='text-white/60 text-sm'>Available 24/7</p>
                  </div>
                </div>
                
                <div className={componentStyles.card.base + ' p-6 flex items-start gap-4'}>
                  <div className='w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-xl flex items-center justify-center flex-shrink-0'>
                    <MessageCircle className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold text-white mb-2'>Live Chat</h3>
                    <p className='text-white/70 mb-2'>Available on website</p>
                    <p className='text-white/60 text-sm'>Instant response</p>
                  </div>
                </div>
              </div>
              
              {/* Office Location */}
              <div className={componentStyles.card.base + ' p-6'}>
                <h3 className='text-xl font-semibold text-white mb-4'>Our Office</h3>
                <Location />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='py-20'>
          <div className='text-center space-y-8 mb-16'>
            <h2 className={designUtils.getHeadingClasses('h2')}>
              Frequently Asked Questions
            </h2>
            <p className={designUtils.getTextClasses('large')}>
              Quick answers to common questions
            </p>
          </div>
          
          <div className='grid md:grid-cols-2 gap-8'>
            {[
              {
                question: 'How quickly do you respond to inquiries?',
                answer: 'We typically respond to all inquiries within 2 hours during business hours, and within 24 hours for after-hours messages.'
              },
              {
                question: 'Do you offer emergency support?',
                answer: 'Yes, we provide 24/7 emergency support for urgent service requests. Call our hotline for immediate assistance.'
              },
              {
                question: 'Can I schedule a call back?',
                answer: 'Absolutely! Fill out our contact form and select your preferred call back time. We\'ll call you at your convenience.'
              },
              {
                question: 'What information should I include in my message?',
                answer: 'Please include your name, contact details, service type, preferred date/time, and any specific requirements or questions.'
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className={componentStyles.card.base + ' p-6 animate-fade-up'}
                style={{animationDelay: `${0.1 * index}s`}}
              >
                <h3 className='text-lg font-semibold text-white mb-3'>{faq.question}</h3>
                <p className='text-white/70'>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className={designUtils.getContainerClasses('md')}>
        <div className='text-center space-y-8 py-20'>
          <div className={componentStyles.card.base + ' p-8 max-w-2xl mx-auto'}>
            <h3 className='text-2xl font-bold text-white mb-4'>Ready to Get Started?</h3>
            <p className='text-white/80 mb-6'>
              Don't wait! Get in touch with us today and let us help you with your local service needs.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link href='/services' className={designUtils.getButtonClasses('primary')}>
                Browse Services
              </Link>
              <Link href='/faq' className={designUtils.getButtonClasses('outline')}>
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
