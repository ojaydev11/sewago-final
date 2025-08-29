'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || null;

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'missing_params':
        return 'Payment verification failed due to missing parameters.';
      case 'verification_failed':
        return 'Payment verification failed. The transaction could not be confirmed.';
      case 'server_error':
        return 'A server error occurred while processing your payment.';
      default:
        return 'Your payment could not be completed. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>
        
        <p className="text-gray-600 mb-6">
          {getErrorMessage(error)}
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <p className="text-yellow-800 font-medium">Important</p>
              <p className="text-yellow-700">
                If money was deducted from your account, it will be automatically refunded within 5-7 business days.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Link 
            href="/services"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Payment Again
          </Link>
          
          <Link 
            href="/contact"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Contact Support
          </Link>
          
          <Link 
            href="/"
            className="block w-full text-gray-500 py-2 px-4 hover:text-gray-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>📞 Call: +977-1-XXXXXXX</p>
            <p>📧 Email: support@sewago.app</p>
            <p>💬 Live Chat: Available 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
}
