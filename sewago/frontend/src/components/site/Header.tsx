'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import dynamic from 'next/dynamic';

// Load the session UI only on the client so hooks never run on the server
const AuthControls = dynamic(() => import('./AuthControls'), { ssr: false });
const LanguageSwitcher = dynamic(() => import('@/components/LanguageSwitcher'), { ssr: false });

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();

  // Helper function to create localized links
  const createLocalizedLink = (path: string) => {
    if (locale === 'en') {
      return path;
    }
    return `/${locale}${path}`;
  };

  return (
    <header className='w-full relative z-50'>
      {/* Background with better contrast */}
      <div className='absolute inset-0 bg-black/80 backdrop-blur-md border-b border-white/20'></div>
      
      <nav className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between'>
        {/* Logo with enhanced styling */}
        <Link href={createLocalizedLink('/')} className='flex items-center gap-4 group'>
          <div className='relative'>
            <div className='h-12 w-12 rounded-2xl bg-gradient-to-r from-primary to-accent p-0.5 group-hover:scale-110 transition-transform duration-300'>
              <div className='h-full w-full rounded-2xl bg-white flex items-center justify-center'>
                <span className='text-gray-900 font-black text-xl'>S</span>
              </div>
            </div>
          </div>
          <span className='text-xl font-bold text-white group-hover:text-accent transition-colors duration-300'>
            SewaGo
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden lg:flex items-center gap-8'>
          <Link href={createLocalizedLink('/')} className='text-white hover:text-accent transition-colors duration-200 font-medium text-shadow-sm'>
            {t('nav.home')}
          </Link>
          <Link href={createLocalizedLink('/services')} className='text-white hover:text-accent transition-colors duration-200 font-medium text-shadow-sm'>
            {t('nav.services')}
          </Link>
          <Link href={createLocalizedLink('/service-bundles')} className='text-white hover:text-accent transition-colors duration-200 font-medium text-shadow-sm'>
            Service Bundles
          </Link>
          <Link href={createLocalizedLink('/about')} className='text-white hover:text-accent transition-colors duration-200 font-medium text-shadow-sm'>
            {t('nav.about')}
          </Link>
          <Link href={createLocalizedLink('/contact')} className='text-white hover:text-accent transition-colors duration-200 font-medium text-shadow-sm'>
            {t('nav.contact')}
          </Link>
          <Link href={createLocalizedLink('/faqs')} className='text-white hover:text-accent transition-colors duration-200 font-medium text-shadow-sm'>
            {t('nav.faq')}
          </Link>
          <Link href={createLocalizedLink('/pricing')} className='text-white hover:text-accent transition-colors duration-200 font-medium text-shadow-sm'>
            {t('nav.pricing')}
          </Link>
        </div>

        {/* Right side - Language Switcher and Auth */}
        <div className='flex items-center gap-4'>
          <LanguageSwitcher />
          
          {/* Client-only auth UI */}
          <AuthControls />
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-white/20"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </nav>
    </header>
  );
}
