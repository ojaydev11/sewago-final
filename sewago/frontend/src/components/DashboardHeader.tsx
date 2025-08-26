'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, User, LogOut } from 'lucide-react';
// Mock auth functions - replace with actual backend integration
const useSession = () => ({ data: { user: { name: 'Mock User', email: 'mock@example.com' } } });
const signOut = async (options: any) => {};
import { useRouter } from 'next/navigation';

export default function DashboardHeader() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    // Mock sign out - replace with actual backend integration
    console.log('Sign out attempt');
    router.push('/');
  };

  return (
    <header className='w-full bg-white border-b border-gray-200 shadow-sm'>
      <nav className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between'>
        {/* Logo */}
        <Link href='/dashboard' className='flex items-center gap-3'>
          <div className='h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-accent p-0.5'>
            <div className='h-full w-full rounded-xl bg-white flex items-center justify-center'>
              <span className='text-gray-900 font-black text-lg'>S</span>
            </div>
          </div>
          <span className='text-xl font-bold text-gray-900'>
            SewaGo Dashboard
          </span>
        </Link>

        {/* Navigation Links */}
        <div className='hidden md:flex items-center gap-6'>
          <Link href='/dashboard' className='text-gray-600 hover:text-primary transition-colors duration-200 font-medium'>
            Dashboard
          </Link>
          <Link href='/bookings' className='text-gray-600 hover:text-primary transition-colors duration-200 font-medium'>
            Bookings
          </Link>
          <Link href='/settings' className='text-gray-600 hover:text-primary transition-colors duration-200 font-medium'>
            Settings
          </Link>
        </div>

        {/* User Menu */}
        <div className='flex items-center gap-4'>
          {session?.user && (
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <div className='h-8 w-8 rounded-full bg-primary flex items-center justify-center'>
                  <User className='h-4 w-4 text-white' />
                </div>
                <span className='text-sm font-medium text-gray-700 hidden sm:block'>
                  {session.user.name || session.user.email}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </nav>
    </header>
  );
}
