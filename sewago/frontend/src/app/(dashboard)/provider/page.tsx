'use client';

<<<<<<< HEAD
=======
// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
export default function ProviderPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading provider page...</p>
      </div>
    </div>
  );
}
