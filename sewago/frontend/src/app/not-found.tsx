'use client';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-sg-text mb-2">Page not found</h1>
      <p className="text-sg-text/70 mb-6">The page you are looking for does not exist.</p>
      <Link 
        href="/" 
        className="bg-sg-primary text-white px-4 py-2 rounded-xl"
      >
        Back to home
      </Link>
    </div>
  )
}
