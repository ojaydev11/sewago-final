
import Link from 'next/link';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-slate-400" />
        </div>
        
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Page Not Found</h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. 
          It might have been moved or doesn't exist.
        </p>
        
        <div className="space-y-4">
          <Link href="/" className="btn-primary inline-flex items-center">
            <HomeIcon className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          <div>
            <Link href="/services" className="text-primary hover:underline">
              Browse Services
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
