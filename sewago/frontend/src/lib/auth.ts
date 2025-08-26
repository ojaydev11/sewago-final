// Mock auth implementation - replace with actual backend integration
// All NextAuth functionality is disabled in frontend-only mode

// Mock auth options
export const authOptions = {
  // Frontend authentication disabled to prevent DB dependencies
  providers: [],
  session: { strategy: 'jwt' as const },
  callbacks: {},
  pages: { signIn: '/account/login' },
  secret: 'mock-secret',
};

// Mock NextAuth export
export default function NextAuth(options: any) {
  return {
    GET: async () => new Response('Auth disabled', { status: 404 }),
    POST: async () => new Response('Auth disabled', { status: 404 }),
  };
}

// Mock helper functions for server-side auth
export async function getSession() {
  // Always return null in frontend-only mode
  return null;
}

export async function getCurrentUser() {
  // Always return null in frontend-only mode
  return null;
}

export async function requireAuth() {
  // Always redirect to login in frontend-only mode
  const { redirect } = await import('next/navigation');
  redirect('/account/login');
}

export async function requireRole(role: string) {
  // Always redirect to login in frontend-only mode
  const { redirect } = await import('next/navigation');
  redirect('/account/login');
}

export async function requireProvider() {
  return await requireRole('provider');
}

export async function requireCustomer() {
  return await requireRole('customer');
}