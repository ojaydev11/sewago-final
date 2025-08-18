import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { api } from '@/lib/api';

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
  }
  
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

// Force Vercel to pick up latest changes - NextAuth TypeScript issues resolved
// Build timestamp: 2025-08-18 11:45:00 UTC - Force fresh deployment
export const { handlers, auth, signIn, signOut } = NextAuth({
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
          const resp = await api.post('/auth/login', {
            emailOrPhone: credentials.email,
            password: credentials.password,
          });
          const data = resp.data as { accessToken?: string; user?: { id: string; name?: string; role: string } };
          if (!data?.user?.id) return null;
          return {
            id: data.user.id,
            email: credentials.email,
            name: data.user.name ?? credentials.email,
            role: data.user.role,
          } as any;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/account/login',
  },
  secret: process.env.AUTH_SECRET || 'fallback-secret-for-development',
});


