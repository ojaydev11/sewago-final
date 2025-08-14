import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import SearchBar from '@/components/SearchBar';
import ServicesGrid from '@/components/ServicesGrid';

export default function Home() {
  return (
    <main className='min-h-screen bg-sg-primary relative overflow-hidden'>
      {/* Background gradient elements */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-sg-accent1/5 rounded-full blur-3xl'></div>
        <div className='absolute bottom-1/4 right-1/4 w-80 h-80 bg-sg-accent2/5 rounded-full blur-3xl'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sg-accent1/3 rounded-full blur-3xl'></div>
      </div>
      
      {/* Content */}
      <div className='relative z-10'>
        <Navbar />
        <Hero />
        
        {/* Search section with enhanced positioning */}
        <div className='relative z-20 bg-transparent'>
          <SearchBar />
        </div>
        
        {/* Services section with improved spacing */}
        <div className='relative z-10 bg-transparent'>
          <ServicesGrid />
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className='fixed bottom-0 left-0 right-0 h-1 bg-gradient-accent opacity-40'></div>
    </main>
  );
}
