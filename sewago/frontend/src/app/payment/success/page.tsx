'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Suspense } from 'react';

function Inner() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Small delay to show the success animation
    setTimeout(() => setLoading(false), 1500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. Your service provider will be notified shortly.
        </p>
        
        {bookingId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Booking Reference</p>
            <p className="font-mono text-sm text-gray-900">{bookingId}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <Link 
            href={bookingId ? `/dashboard/user` : '/'}
            className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            View My Bookings
          </Link>
          
          <Link 
            href="/"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Book Another Service
          </Link>
        </div>
        
        <p className="text-xs text-gray-500 mt-6">
          You will receive a confirmation message shortly. If you need help, contact our support team.
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-green-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div><p className="text-gray-600">Confirming your payment...</p></div></div>}>
      <Inner />
    </Suspense>
  );
}
