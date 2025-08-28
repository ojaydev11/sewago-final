'use client';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Mock authentication - replace with actual backend API call
      console.log('Login attempt:', { email, password });
      setError('Authentication is disabled in frontend-only mode. Please integrate with backend API.');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-xl border-0 rounded-xl">
          <div className="text-center pb-6 px-6 pt-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-lg text-gray-600 mt-2">
              Sign in to your SewaGo account
            </p>
          </div>
          <div className="space-y-6 px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 w-full rounded-md px-3 py-2 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 text-base border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 w-full rounded-md px-3 py-2 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-4 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center text-sm text-gray-600 pt-2">
                <p>Don't have an account?{' '}
                  <Link href="/auth/register" className="text-blue-500 hover:underline font-semibold transition-colors">
                    Sign up
                  </Link>
                </p>
              </div>

              {/* Demo credentials */}
              <div className="text-center text-xs text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-semibold mb-3 text-gray-700">Demo Accounts:</p>
                <div className="space-y-1 text-gray-600">
                  <p>Admin: admin@sewago.com / admin123</p>
                  <p>Provider: ram@example.com / provider123</p>
                  <p>Customer: sita@example.com / customer123</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


