import { redirect } from 'next/navigation';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

// Force dynamic rendering to prevent build-time issues

export default function RootPage() {
  redirect('/en');
}
