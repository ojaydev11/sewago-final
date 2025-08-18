import NextAuth from 'next-auth';
import type { NextAuthOptions, Session, User as NextAuthUser } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from './db';

type SewagoUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const user = await db.user.findUnique({ where: { email: credentials.email } });
          if (!user) return null;
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isPasswordValid) return null;
          const typed: SewagoUser = {
            id: user.id,
            email: user.email,
            name: user.name ?? null,
            role: (user as unknown as { role?: string }).role ?? 'user',
          };
          return typed as unknown as NextAuthUser;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as Partial<SewagoUser>;
        if (u.role) {
          (token as { role?: string }).role = u.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const s = session as Session & { user: { id?: string; role?: string } };
        s.user.id = (token.sub ?? '') as string;
        s.user.role = (token as { role?: string }).role ?? 'user';
      }
      return session;
    }
  },
  pages: { signIn: '/auth/login' },
  secret: process.env.AUTH_SECRET || 'fallback-secret-for-development',
};

export const auth = () => getServerSession(authOptions);
export const nextAuthHandler = NextAuth(authOptions);


