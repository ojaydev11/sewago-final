'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mb-4">Something went wrong</h1>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          We encountered an unexpected error. Don't worry, our team has been notified.
        </p>

        <div className="space-y-4">
          <button onClick={reset} className="btn-primary inline-flex items-center">
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Try Again
          </button>
          <div>
            <Link href="/" className="text-primary hover:underline">
              Go Home
            </Link>
            <span className="text-slate-400 mx-2">•</span>
            <Link href="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}