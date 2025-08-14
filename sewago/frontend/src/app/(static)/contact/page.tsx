import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { designUtils, componentStyles } from '@/lib/design-system';
import Location from '@/components/Location';

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
              
              <Card className={componentStyles.card.base + ' p-8'}>
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
                    <Label htmlFor='subject' className='text-white font-medium'>Subject</Label>
                    <Input 
                      id='subject' 
                      placeholder='What is this about?'
                      className='bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent'
                    />
                  </div>
                  
                  <div className='space-y-2'>
                    <Label htmlFor='message' className='text-white font-medium'>Message</Label>
                    <Textarea 
                      id='message' 
                      placeholder='Tell us more about your inquiry...'
                      rows={5}
                      className='bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent resize-none'
                    />
                  </div>
                  
                  <Button 
                    type='submit' 
                    className='w-full bg-gradient-to-r from-primary to-accent text-white hover:from-primary-light hover:to-accent-light py-3 text-lg'
                  >
                    <Send className='w-5 h-5 mr-2' />
                    Send Message
                  </Button>
                </form>
              </Card>
            </div>
            
            {/* Contact Details */}
            <div className='space-y-6'>
              <div className='space-y-4'>
                <h2 className='text-3xl font-bold text-white mb-6'>
                  Contact Information
                </h2>
                <p className='text-white/80 text-lg'>
                  Reach out to us through any of these channels. We're here to help 24/7.
                </p>
              </div>
              
              <div className='space-y-4'>
                <div className='flex items-start gap-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg'>
                  <div className='w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0'>
                    <Phone className='w-6 h-6 text-accent' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-white mb-1'>Phone</h3>
                    <p className='text-white/80'>
                      <a href='tel:+9779800000000' className='hover:text-accent transition-colors'>
                        +977-9800000000
                      </a>
                    </p>
                    <p className='text-white/60 text-sm'>Available 24/7 for emergencies</p>
                  </div>
                </div>
                
                <div className='flex items-start gap-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg'>
                  <div className='w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0'>
                    <Mail className='w-6 h-6 text-accent' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-white mb-1'>Email</h3>
                    <p className='text-white/80'>
                      <a href='mailto:hello@sewago.com' className='hover:text-accent transition-colors'>
                        hello@sewago.com
                      </a>
                    </p>
                    <p className='text-white/60 text-sm'>Response within 24 hours</p>
                  </div>
                </div>
                
                <div className='flex items-start gap-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg'>
                  <div className='w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0'>
                    <Clock className='w-6 h-6 text-accent' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-white mb-1'>Business Hours</h3>
                    <p className='text-white/80'>
                      Monday - Friday: 7:00 AM - 10:00 PM<br />
                      Saturday - Sunday: 7:00 AM - 10:00 PM
                    </p>
                    <p className='text-accent font-medium text-sm'>24/7 Emergency Support Available</p>
                  </div>
                </div>
                
                <div className='flex items-start gap-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg'>
                  <div className='w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0'>
                    <MessageCircle className='w-6 h-6 text-accent' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-white mb-1'>Live Chat</h3>
                    <p className='text-white/80'>Available during business hours</p>
                    <Button variant="outline" className='mt-2 border-white/30 text-white hover:bg-white/20'>
                      Start Chat
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Location Section */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='py-20'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold text-white mb-4'>
              Find Us
            </h2>
            <p className='text-lg text-white/80 max-w-2xl mx-auto'>
              Visit our office in Kathmandu or explore our service areas across Nepal
            </p>
          </div>
          
          <Location />
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='py-20'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold text-white mb-4'>
              Frequently Asked Questions
            </h2>
            <p className='text-lg text-white/80 max-w-2xl mx-auto'>
              Quick answers to common questions about our services
            </p>
          </div>
          
          <div className='grid md:grid-cols-2 gap-6 max-w-4xl mx-auto'>
            {[
              {
                question: 'How quickly can I get a response?',
                answer: 'We typically respond to all inquiries within 24 hours. For urgent matters, you can call our 24/7 support line.'
              },
              {
                question: 'Do you provide services outside Kathmandu?',
                answer: 'Yes! We provide services across Nepal including Pokhara, Lalitpur, Bhaktapur, and many other cities.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept cash, eSewa, Khalti, and credit cards. Payment is made after service completion.'
              },
              {
                question: 'How do I report an issue with a service?',
                answer: 'Contact us immediately through phone, email, or our support channels. We have a 30-day satisfaction guarantee.'
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className={componentStyles.card.base + ' p-6 animate-fade-up'}
                style={{animationDelay: `${0.1 * index}s`}}
              >
                <h3 className='text-xl font-bold text-white mb-3'>{faq.question}</h3>
                <p className='text-white/80'>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className={designUtils.getContainerClasses('md')}>
        <div className='text-center space-y-8 py-20'>
          <div className={componentStyles.card.base + ' p-8 max-w-2xl mx-auto'}>
            <h3 className='text-2xl font-bold text-white mb-4'>
              Ready to Get Started?
            </h3>
            <p className='text-white/80 mb-6'>
              Don't wait! Contact us today and experience the SewaGo difference. 
              Our team is ready to help you with all your local service needs.
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
      <div className='fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-primary opacity-40'></div>
    </main>
  );
}
