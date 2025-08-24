import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface AuthGuardOptions {
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

export async function requireAuth(options: AuthGuardOptions = {}) {
  const {
    requireAuth = true,
    allowedRoles = [],
    redirectTo = '/auth/login'
  } = options;

  const session = await getServerSession(authOptions);

  // If auth is required but no session exists
  if (requireAuth && !session) {
    redirect(redirectTo);
  }

  // If specific roles are required
  if (allowedRoles.length > 0 && session?.user?.role) {
    if (!allowedRoles.includes(session.user.role)) {
      // Redirect based on role
      switch (session.user.role) {
        case 'Admin':
          redirect('/admin');
        case 'Provider':
          redirect('/provider');
        case 'Customer':
          redirect('/dashboard');
        default:
          redirect('/');
      }
    }
  }

  return session;
}

export async function requireCustomer() {
  return requireAuth({
    requireAuth: true,
    allowedRoles: ['Customer'],
    redirectTo: '/auth/login'
  });
}

export async function requireProvider() {
  return requireAuth({
    requireAuth: true,
    allowedRoles: ['Provider'],
    redirectTo: '/auth/login'
  });
}

export async function requireAdmin() {
  return requireAuth({
    requireAuth: true,
    allowedRoles: ['Admin'],
    redirectTo: '/auth/login'
  });
}

export async function requireAnyRole() {
  return requireAuth({
    requireAuth: true,
    allowedRoles: ['Customer', 'Provider', 'Admin'],
    redirectTo: '/auth/login'
  });
}

export async function optionalAuth() {
  return requireAuth({
    requireAuth: false
  });
}

// Higher-order function for API route protection
export function withAuth(
  handler: (req: Request, context: { params?: any }) => Promise<Response>,
  options: AuthGuardOptions = {}
) {
  return async (req: Request, context: { params?: any }) => {
    try {
      const session = await getServerSession(authOptions);
      
      // Check authentication requirements
      const {
        requireAuth = true,
        allowedRoles = []
      } = options;

      if (requireAuth && !session) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }), 
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Check role requirements
      if (allowedRoles.length > 0 && session?.user?.role) {
        if (!allowedRoles.includes(session.user.role)) {
          return new Response(
            JSON.stringify({ error: 'Insufficient permissions' }), 
            { 
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }

      // Add session to request context
      (req as any).user = session?.user;
      
      return handler(req, context);
    } catch (error) {
      console.error('Auth guard error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}

// Export withAuth as the default auth function for compatibility
export { withAuth as default };
