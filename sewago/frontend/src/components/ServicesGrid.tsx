import Link from 'next/link';
import ServiceCard from './ServiceCard';
import { Wrench, ShowerHead, Sparkles, GraduationCap } from 'lucide-react';

const items = [
  { label: 'Electrician', slug: 'electrician', icon: <Wrench/>, color: 'from-blue-600 to-purple-600' },
  { label: 'Plumber', slug: 'plumber', icon: <ShowerHead/>, color: 'from-green-600 to-blue-600' },
  { label: 'Cleaner', slug: 'cleaner', icon: <Sparkles/>, color: 'from-purple-600 to-pink-600' },
  { label: 'Tutor', slug: 'tutor', icon: <GraduationCap/>, color: 'from-orange-600 to-red-600' }
];

export default function ServicesGrid() {
  return (
    <section className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 space-y-16'>
      {/* Enhanced section header */}
      <div className='text-center space-y-6 animate-fade-up'>
        <h2 className='text-4xl sm:text-5xl font-black text-white leading-tight'>
          Browse Services
        </h2>
        <p className='text-xl text-white/80 font-light max-w-2xl mx-auto leading-relaxed'>
          Discover our comprehensive range of professional services designed for the modern world
        </p>
        
        {/* Futuristic accent line */}
        <div className='flex justify-center'>
          <div className='w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full'></div>
        </div>
      </div>
      
      {/* Enhanced grid layout with improved spacing */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12'>
        {items.map((item, index) => (
          <Link 
            key={item.slug} 
            href={`/services/${item.slug}/book`} 
            className='block group animate-slide-up'
            style={{animationDelay: `${0.2 * index}s`}}
          >
            <ServiceCard 
              icon={item.icon} 
              label={item.label}
              gradientClass={item.color}
            />
          </Link>
        ))}
      </div>
      
      {/* Bottom accent section */}
      <div className='text-center pt-8'>
        <div className='inline-flex items-center gap-3 text-white/60 text-sm font-mono'>
          <div className='w-2 h-2 bg-blue-400 rounded-full animate-pulse'></div>
          <span>More services coming soon</span>
          <div className='w-2 h-2 bg-purple-400 rounded-full animate-pulse' style={{animationDelay: '0.5s'}}></div>
        </div>
      </div>
    </section>
  );
}
