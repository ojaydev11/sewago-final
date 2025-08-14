'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, User, LogOut, Settings, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from 'next-i18next';

export default function Header() {
  // Ensure this component only runs on the client side
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation('common');
  
  // Handle loading state
  const isLoading = status === 'loading';
  
  // Don't render anything until we're on the client side
  if (!isClient) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className='w-full relative z-50'>
      {/* Background with glassmorphism */}
      <div className='absolute inset-0 glass-card border-b border-white/20'></div>
      
      <nav className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between'>
        {/* Logo with enhanced styling */}
        <Link href='/' className='flex items-center gap-4 group'>
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
          <Link href='/' className='text-white hover:text-accent transition-colors duration-200 font-medium'>
            {t('nav.home')}
          </Link>
          <Link href='/services' className='text-white hover:text-accent transition-colors duration-200 font-medium'>
            {t('nav.services')}
          </Link>
          <Link href='/about' className='text-white hover:text-accent transition-colors duration-200 font-medium'>
            {t('nav.about')}
          </Link>
          <Link href='/contact' className='text-white hover:text-accent transition-colors duration-200 font-medium'>
            {t('nav.contact')}
          </Link>
          <Link href='/faq' className='text-white hover:text-accent transition-colors duration-200 font-medium'>
            {t('nav.faq')}
          </Link>
          <Link href='/pricing' className='text-white hover:text-accent transition-colors duration-200 font-medium'>
            {t('nav.pricing')}
          </Link>
        </div>

        {/* Right side - Language Switcher and Auth */}
        <div className='flex items-center gap-4'>
          <LanguageSwitcher />
          
          {isLoading ? (
            <div className='h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 animate-pulse'></div>
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                    <AvatarFallback className="bg-white/20 text-white">
                      {session.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white/10 backdrop-blur-md border border-white/20" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{session.user?.name}</p>
                    <p className="text-xs leading-none text-white/70">{session.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem className="text-white hover:bg-white/20">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/20">
                  <Package className="mr-2 h-4 w-4" />
                  <span>My Bookings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/20">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem onClick={handleSignOut} className="text-white hover:bg-white/20">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className='flex items-center gap-3'>
              <Link href='/auth/login'>
                <Button variant="ghost" className="text-white hover:bg-white/20 border border-white/20">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link href='/auth/register'>
                <Button className="bg-gradient-to-r from-primary to-accent text-white hover:from-primary-light hover:to-accent-light">
                  {t('nav.register')}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-white/20"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className='lg:hidden absolute top-full left-0 right-0 bg-white/10 backdrop-blur-md border-b border-white/20'>
          <div className='px-4 py-6 space-y-4'>
            <Link href='/' className='block text-white hover:text-accent transition-colors duration-200 font-medium py-2'>
              {t('nav.home')}
            </Link>
            <Link href='/services' className='block text-white hover:text-accent transition-colors duration-200 font-medium py-2'>
              {t('nav.services')}
            </Link>
            <Link href='/about' className='block text-white hover:text-accent transition-colors duration-200 font-medium py-2'>
              {t('nav.about')}
            </Link>
            <Link href='/contact' className='block text-white hover:text-accent transition-colors duration-200 font-medium py-2'>
              {t('nav.contact')}
            </Link>
            <Link href='/faq' className='block text-white hover:text-accent transition-colors duration-200 font-medium py-2'>
              {t('nav.faq')}
            </Link>
            <Link href='/pricing' className='block text-white hover:text-accent transition-colors duration-200 font-medium py-2'>
              {t('nav.pricing')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
