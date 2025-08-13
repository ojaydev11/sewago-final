'use client';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <HomeIcon className="h-12 w-12" />
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h1>
            <p className="mt-2 text-sm text-gray-600">
              Sorry, we couldn't find the page you're looking for.
            </p>
            <div className="mt-6 flex flex-col space-y-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                Go Home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
