// Temporarily render homepage directly instead of redirecting to avoid locale issues
import Hero from '@/components/Hero';
import SearchBar from '@/components/SearchBar';
import ServicesGrid from '@/components/ServicesGrid';
import CounterBar from '@/components/CounterBar';
import CustomerReviews from '@/components/CustomerReviews';
import TrustIndicators from '@/components/TrustIndicators';
import SchemaMarkup from '@/components/SchemaMarkup';
import VerifiedReviewsCarousel from '@/components/VerifiedReviewsCarousel';
import CategoriesGrid from '@/components/CategoriesGrid';
import { homepageSchema } from '@/lib/schema';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

export default function RootPage() {
  return (
    <>
      {/* BINARY-DISABLE B.2: Remove SchemaMarkup to isolate #419 */}
      {/* <SchemaMarkup schema={homepageSchema} /> */}
      <main className='min-h-screen relative overflow-hidden'>
        {/* Background gradient elements */}
        <div className='fixed inset-0 pointer-events-none'>
          <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl'></div>
          <div className='absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl'></div>
          <div className='absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl'></div>
        </div>
        
        {/* Content */}
        <div className='relative z-10'>
          {/* BINARY-DISABLE B.1: Temporarily disable Hero to isolate #419 */}
          {/* <Hero /> */}
          
          {/* Search section with enhanced positioning */}
          <div className='relative z-20 bg-transparent'>
            <SearchBar />
          </div>
          
          {/* Services section with improved spacing */}
          <div className='relative z-10 bg-transparent'>
            <ServicesGrid />
          </div>
          
          {/* BINARY-DISABLE B.3: Remove CounterBar to isolate #419 */}
          {/* <div className='relative z-10'>
            <CounterBar />
          </div> */}
          
          {/* Other components temporarily disabled to isolate runtime errors */}
          {/* <div className='relative z-10 bg-transparent'>
            <VerifiedReviewsCarousel />
          </div>
          
          <div className='relative z-10 bg-transparent'>
            <CategoriesGrid />
          </div>
          
          <div className='relative z-10 bg-transparent'>
            <CustomerReviews />
          </div> */}
          
          {/* BINARY-DISABLE B.4: Remove TrustIndicators to isolate #419 */}
          {/* <div className='relative z-10 bg-white'>
            <TrustIndicators variant="default" />
          </div> */}
        </div>
        
        {/* Bottom accent line */}
        <div className='fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-40'></div>
      </main>
    </>
  );
}
