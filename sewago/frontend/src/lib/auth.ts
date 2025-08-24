import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getMongoClient } from './mongodb';
import { User } from '../models/User';

export const authOptions = {
  // Only use MongoDB adapter if database is available
  adapter: process.env.MONGODB_URI ? MongoDBAdapter(getMongoClient()!) : undefined,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Skip database check if not available (demo mode)
          if (!process.env.MONGODB_URI) {
            console.warn('MongoDB not configured, skipping authentication');
            return null;
          }

          const user = await User.findOne({ email: credentials.email });
          
          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.hash);
          
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.role = token.role;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
  pages: {
    signIn: '/account/login',
  },
  secret: process.env.AUTH_SECRET || 'fallback-secret-for-demo',
};

export default NextAuth(authOptions);

// Helper functions for server-side auth
export async function getSession() {
  const { getServerSession } = await import('next-auth');
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session?.user) {
    const { redirect } = await import('next/navigation');
    redirect('/account/login');
  }
  
  return session.user;
}

export async function requireRole(role: string) {
  const user = await requireAuth();
  
  if (user.role !== role) {
    const { redirect } = await import('next/navigation');
    redirect('/');
  }
  
  return user;
}

export async function requireProvider() {
  return await requireRole('provider');
}

export async function requireCustomer() {
  return await requireRole('customer');
}


