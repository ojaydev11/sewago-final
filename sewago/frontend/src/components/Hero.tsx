import ServiceHubIllustration from './ui/ServiceHubIllustration';

export default function Hero() {
  return (
    <section className='relative min-h-screen bg-gradient-hero overflow-hidden'>
      {/* Futuristic background elements */}
      <div className='absolute inset-0'>
        <div className='absolute top-20 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-float'></div>
        <div className='absolute top-40 right-20 w-24 h-24 bg-white/20 rounded-full blur-2xl animate-float' style={{animationDelay: '1s'}}></div>
        <div className='absolute bottom-40 left-1/4 w-16 h-16 bg-white/30 rounded-full blur-xl animate-float' style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32'>
        <div className='grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]'>
          {/* Left content with enhanced typography and spacing */}
          <div className='text-center lg:text-left space-y-8'>
            <div className='space-y-4'>
              <h1 className='clamp(2.5rem, 5vw + 1rem, 4.5rem) font-black text-white leading-tight animate-fade-up'>
                Reliable Services
              </h1>
              <p className='text-2xl sm:text-3xl text-white/90 font-light leading-relaxed animate-slide-up' style={{animationDelay: '0.2s'}}>
                For Every Home in Nepal
              </p>
            </div>
            
            {/* Modern subtitle */}
            <div className='space-y-3 animate-slide-up' style={{animationDelay: '0.4s'}}>
              <p className='text-lg text-white/80 font-medium'>
                Connect with verified local service providers
              </p>
              <div className='flex items-center justify-center lg:justify-start gap-2'>
                <div className='w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse-glow'></div>
                <span className='text-sm text-blue-200 font-mono'>Quality Guaranteed</span>
              </div>
            </div>
          </div>
          
          {/* Right illustration with enhanced styling */}
          <div className='hidden lg:block relative animate-fade-up' style={{animationDelay: '0.6s'}}>
            <div className='relative'>
              <ServiceHubIllustration />
              {/* Futuristic overlay elements */}
              <div className='absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse-glow'></div>
              <div className='absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse-glow' style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400'></div>
    </section>
  );
}
