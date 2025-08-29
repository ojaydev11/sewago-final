import { redirect } from 'next/navigation';
import { isDemoEnabled, getDemoRoutes } from '@/config/demo';

// This page will be built but will redirect appropriately
export default function ReviewSystemPage() {
  // If demos are disabled, redirect to home page
  if (!isDemoEnabled()) {
    redirect('/');
  }
  
  // If demos are enabled, redirect to the demo
  redirect(getDemoRoutes().reviewSystemDemo);
}

// Prevent static generation when demos are disabled
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
