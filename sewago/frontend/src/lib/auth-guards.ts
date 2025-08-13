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
