import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Sign In - SewaGo | Local Services in Nepal',
  description: 'Sign in to your SewaGo account to book local services, manage bookings, and connect with verified service providers in Nepal.',
  keywords: 'sign in, login, SewaGo, local services Nepal, account access',
};

export default function LoginPage() {
  return <LoginForm />;
}
