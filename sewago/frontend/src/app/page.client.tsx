'use client';
import ClientOnly from "../components/ClientOnly";

export default function PageClient() {
  return (
    <ClientOnly>
      <main className='min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700'>
        {/* Background gradient elements */}
        <div className='fixed inset-0 pointer-events-none'>
          <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl'></div>
          <div className='absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl'></div>
          <div className='absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl'></div>
        </div>
        
        {/* Content */}
        <div className='relative z-10 flex items-center justify-center min-h-screen'>
          <div className='text-center text-white p-8'>
            <h1 className='text-6xl font-black mb-6 leading-tight'>
              SewaGo
            </h1>
            <p className='text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto'>
              Local Services in Nepal - Connect with verified service providers
            </p>
            <div className='space-y-4'>
              <p className='text-lg text-white/80'>
                Professional electricians, plumbers, cleaners, and tutors
              </p>
              <p className='text-lg text-white/80'>
                Available in Kathmandu, Pokhara, and across Nepal
              </p>
            </div>
            
            {/* Service categories */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto'>
              <div className='bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300'>
                <div className='text-3xl mb-3'>🔧</div>
                <h3 className='font-semibold'>Electrician</h3>
              </div>
              <div className='bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300'>
                <div className='text-3xl mb-3'>🚿</div>
                <h3 className='font-semibold'>Plumber</h3>
              </div>
              <div className='bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300'>
                <div className='text-3xl mb-3'>✨</div>
                <h3 className='font-semibold'>Cleaner</h3>
              </div>
              <div className='bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300'>
                <div className='text-3xl mb-3'>🎓</div>
                <h3 className='font-semibold'>Tutor</h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className='fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-40'></div>
      </main>
    </ClientOnly>
  );
}
