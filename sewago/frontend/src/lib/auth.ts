// Keep types local to avoid coupling to NextAuth runtime
type JwtLike = { sub?: string; role?: string };
type SessionLike = { user: { id?: string; role?: string } };
import CredentialsProvider from 'next-auth/providers/credentials';
import { api } from '@/lib/api';

// Types are augmented in src/types/next-auth.d.ts

// Force Vercel to pick up latest changes - NextAuth TypeScript issues resolved
// Build timestamp: 2025-08-18 11:45:00 UTC - Force fresh deployment
export const authOptions = {
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
          const data: { accessToken?: string; user?: { id: string; name?: string; role: string } } = resp.data;
          if (!data?.user?.id) return null;
          const result = {
            id: data.user.id,
            email: credentials.email,
            name: data.user.name ?? credentials.email,
            role: data.user.role,
          };
          return result;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JwtLike; user?: { role: string } }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: SessionLike; token: JwtLike }) {
      if (token) {
        session.user.id = (token.sub as string) ?? '';
        session.user.role = token.role as string | undefined;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'fallback-secret-for-development',
} as const;


