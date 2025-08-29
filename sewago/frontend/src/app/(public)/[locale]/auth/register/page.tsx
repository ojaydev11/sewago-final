import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Sign Up - SewaGo | Local Services in Nepal',
  description: 'Create your SewaGo account to access local services, book professionals, and connect with verified service providers across Nepal.',
  keywords: 'sign up, register, create account, SewaGo, local services Nepal, new user',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
