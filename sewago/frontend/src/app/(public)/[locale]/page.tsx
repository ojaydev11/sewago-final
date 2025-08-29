import EnhancedHero from '@/components/EnhancedHero';
import EnhancedNavbar from '@/components/EnhancedNavbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import { 
  FeaturesSection, 
  HowItWorksSection, 
  TestimonialsSection, 
  ServiceHighlightsSection, 
  CTASection 
} from '@/components/HomepageSections';
import SchemaMarkup from '@/components/SchemaMarkup';
import { homepageSchema } from '@/lib/schema';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <SchemaMarkup schema={homepageSchema} />
      
      {/* Enhanced Navigation */}
      <EnhancedNavbar />
      
      <main className='min-h-screen relative overflow-hidden'>
        {/* Enhanced Hero Section */}
        <EnhancedHero />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* How It Works Section */}
        <HowItWorksSection />
        
        {/* Service Highlights Section */}
        <ServiceHighlightsSection />
        
        {/* Testimonials Section */}
        <TestimonialsSection />
        
        {/* Call to Action Section */}
        <CTASection />
      </main>
      
      {/* Enhanced Footer */}
      <EnhancedFooter />
    </>
  );
}
