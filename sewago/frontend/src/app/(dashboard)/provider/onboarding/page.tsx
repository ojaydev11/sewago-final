'use client';

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = 'force-dynamic';

// Mock session hook - replace with actual backend integration
const useSession = () => ({ data: { user: { name: 'Mock User', email: 'mock@example.com' } } });
