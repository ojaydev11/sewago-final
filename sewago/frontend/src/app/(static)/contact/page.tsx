import { designUtils, componentStyles } from '@/lib/design-system';

export default function ContactPage() {
  return (
    <main className='min-h-screen bg-sg-primary relative overflow-hidden'>
      {/* Background gradient elements */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute top-1/4 right-10 w-96 h-96 bg-sg-accent2/5 rounded-full blur-3xl animate-float'></div>
        <div className='absolute bottom-1/4 left-20 w-80 h-80 bg-sg-accent1/5 rounded-full blur-3xl animate-float' style={{animationDelay: '1s'}}></div>
      </div>
      
      {/* Hero Section */}
      <section className='relative bg-gradient-hero py-20 lg:py-32'>
        <div className={designUtils.getContainerClasses('lg')}>
          <div className='text-center space-y-8 animate-fade-in'>
            <h1 className={designUtils.getHeadingClasses('h1')}>
              Get in Touch
            </h1>
            <p className={designUtils.getTextClasses('large')}>
              We'd love to hear from you. Let's start a conversation about how we can help.
            </p>
            
            {/* Futuristic accent line */}
            <div className='flex justify-center'>
              <div className='w-24 h-1 bg-gradient-accent rounded-full'></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Form Section */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='grid lg:grid-cols-2 gap-16 py-20'>
          {/* Contact Information */}
          <div className='space-y-8 animate-slide-up'>
            <div className='space-y-6'>
              <h2 className={designUtils.getHeadingClasses('h2')}>
                Let's Connect
              </h2>
              <p className={designUtils.getTextClasses('medium')}>
                Have questions about our services? Need support? 
                We're here to help you every step of the way.
              </p>
            </div>
            
            {/* Contact Methods */}
            <div className='space-y-6'>
              {[
                {
                  icon: '📧',
                  title: 'Email Us',
                  detail: 'hello@sewago.com',
                  description: 'We typically respond within 24 hours'
                },
                {
                  icon: '📱',
                  title: 'Call Us',
                  detail: '+977-9800000000',
                  description: 'Available 7 AM - 10 PM, 7 days a week'
                },
                {
                  icon: '📍',
                  title: 'Visit Us',
                  detail: 'Kathmandu, Nepal',
                  description: 'Headquarters in the heart of the city'
                }
              ].map((method, index) => (
                <div 
                  key={index}
                  className={componentStyles.card.base + ' p-6 animate-fade-in'}
                  style={{animationDelay: `${0.2 * index}s`}}
                >
                  <div className='flex items-start gap-4'>
                    <div className='w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center flex-shrink-0'>
                      <span className='text-xl'>{method.icon}</span>
                    </div>
                    <div className='space-y-2'>
                      <h3 className='text-lg font-semibold text-sg-secondary'>{method.title}</h3>
                      <p className='text-sg-accent1 font-medium'>{method.detail}</p>
                      <p className={designUtils.getTextClasses('small')}>{method.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Contact Form */}
          <div className='animate-fade-in' style={{animationDelay: '0.4s'}}>
            <div className={componentStyles.card.elevated + ' p-8'}>
              <h3 className='text-2xl font-bold text-sg-secondary mb-6'>Send us a Message</h3>
              
              <form className='space-y-6'>
                <div className='grid md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-sg-secondary mb-2'>
                      First Name
                    </label>
                    <input 
                      type='text' 
                      className='w-full px-4 py-3 bg-sg-primary/50 border border-sg-accent1/20 rounded-2xl text-sg-secondary placeholder:text-sg-secondary/50 focus:outline-none focus:border-sg-accent1/40 transition-colors'
                      placeholder='Enter your first name'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-sg-secondary mb-2'>
                      Last Name
                    </label>
                    <input 
                      type='text' 
                      className='w-full px-4 py-3 bg-sg-primary/50 border border-sg-accent1/20 rounded-2xl text-sg-secondary placeholder:text-sg-secondary/50 focus:outline-none focus:border-sg-accent1/40 transition-colors'
                      placeholder='Enter your last name'
                    />
                  </div>
                </div>
                
                <div>
                  <label className='block text-sm font-medium text-sg-secondary mb-2'>
                    Email Address
                  </label>
                  <input 
                    type='email' 
                    className='w-full px-4 py-3 bg-sg-primary/50 border border-sg-accent1/20 rounded-2xl text-sg-secondary placeholder:text-sg-secondary/50 focus:outline-none focus:border-sg-accent1/40 transition-colors'
                    placeholder='Enter your email address'
                  />
                </div>
                
                <div>
                  <label className='block text-sm font-medium text-sg-secondary mb-2'>
                    Subject
                  </label>
                  <select className='w-full px-4 py-3 bg-sg-primary/50 border border-sg-accent1/20 rounded-2xl text-sg-secondary focus:outline-none focus:border-sg-accent1/40 transition-colors'>
                    <option value=''>Select a subject</option>
                    <option value='general'>General Inquiry</option>
                    <option value='support'>Technical Support</option>
                    <option value='partnership'>Partnership</option>
                    <option value='feedback'>Feedback</option>
                  </select>
                </div>
                
                <div>
                  <label className='block text-sm font-medium text-sg-secondary mb-2'>
                    Message
                  </label>
                  <textarea 
                    rows={5}
                    className='w-full px-4 py-3 bg-sg-primary/50 border border-sg-accent1/20 rounded-2xl text-sg-secondary placeholder:text-sg-secondary/50 focus:outline-none focus:border-sg-accent1/40 transition-colors resize-none'
                    placeholder='Tell us how we can help you...'
                  ></textarea>
                </div>
                
                <button 
                  type='submit'
                  className={designUtils.getButtonClasses('primary') + ' w-full'}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className={designUtils.getContainerClasses('lg')}>
        <div className='text-center space-y-16 py-20'>
          <div className='space-y-6 animate-fade-in'>
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
                answer: 'We typically respond to all inquiries within 24 hours during business days.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We currently support cash on delivery for all our services.'
              },
              {
                question: 'Do you offer emergency services?',
                answer: 'Yes, we provide emergency service support for urgent situations.'
              },
              {
                question: 'How do I become a service provider?',
                answer: 'You can apply through our provider registration portal on the website.'
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className={componentStyles.card.base + ' p-6 text-left animate-slide-up'}
                style={{animationDelay: `${0.1 * index}s`}}
              >
                <h3 className='text-lg font-semibold text-sg-secondary mb-3'>{faq.question}</h3>
                <p className={designUtils.getTextClasses('small')}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Support Hours */}
      <section className={designUtils.getContainerClasses('md')}>
        <div className='text-center space-y-8 py-20'>
          <div className={componentStyles.card.base + ' p-8 max-w-2xl mx-auto'}>
            <h3 className='text-2xl font-bold text-sg-secondary mb-4'>Support Hours</h3>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-semibold text-sg-accent1 mb-2'>Weekdays</h4>
                <p className={designUtils.getTextClasses('small')}>7:00 AM - 10:00 PM</p>
              </div>
              <div>
                <h4 className='font-semibold text-sg-accent1 mb-2'>Weekends</h4>
                <p className={designUtils.getTextClasses('small')}>7:00 AM - 10:00 PM</p>
              </div>
            </div>
            <p className={designUtils.getTextClasses('small') + ' mt-4 text-sg-secondary/70'}>
              We're here to help you every day of the week!
            </p>
          </div>
        </div>
      </section>
      
      {/* Bottom accent line */}
      <div className='fixed bottom-0 left-0 right-0 h-1 bg-gradient-accent opacity-40'></div>
    </main>
  );
}
