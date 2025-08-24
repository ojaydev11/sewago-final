import Hero from '@/components/Hero';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

import SearchBar from '@/components/SearchBar';
import ServicesGrid from '@/components/ServicesGrid';
import CounterBar from '@/components/CounterBar';
import CustomerReviews from '@/components/CustomerReviews';
import TrustIndicators from '@/components/TrustIndicators';
import SchemaMarkup from '@/components/SchemaMarkup';
import VerifiedReviewsCarousel from '@/components/VerifiedReviewsCarousel';
import CategoriesGrid from '@/components/CategoriesGrid';
import { homepageSchema } from '@/lib/schema';

export default function Home() {
  return (
    <>
      <SchemaMarkup schema={homepageSchema} />
      <main className='min-h-screen relative overflow-hidden'>
        {/* Background gradient elements */}
        <div className='fixed inset-0 pointer-events-none'>
          <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl'></div>
          <div className='absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl'></div>
          <div className='absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl'></div>
        </div>
        
        {/* Content */}
        <div className='relative z-10'>
          <Hero />
          
          {/* Search section with enhanced positioning */}
          <div className='relative z-20 bg-transparent'>
            <SearchBar />
          </div>
          
          {/* Services section with improved spacing */}
          <div className='relative z-10 bg-transparent'>
            <ServicesGrid />
          </div>
          
          {/* Trust Layer - CounterBar (replaces LiveCounters) */}
          <div className='relative z-10'>
            <CounterBar />
          </div>
          
          {/* Trust Layer - Verified Reviews Carousel */}
          <div className='relative z-10 bg-transparent'>
            <VerifiedReviewsCarousel />
          </div>
          
          {/* Service Categories Grid */}
          <div className='relative z-10 bg-transparent'>
            <CategoriesGrid />
          </div>
          
          {/* Trust Layer - Customer Reviews */}
          <div className='relative z-10 bg-transparent'>
            <CustomerReviews />
          </div>
          
          {/* Trust Layer - Trust Indicators */}
          <div className='relative z-10 bg-white'>
            <TrustIndicators variant="default" />
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className='fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-40'></div>
      </main>
    </>
  );
}
