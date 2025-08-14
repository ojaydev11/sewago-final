import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Simple demo authentication for production deployment
        if (credentials?.email === 'demo@sewago.com' && credentials?.password === 'demo123') {
          return {
            id: 'demo-user-1',
            email: 'demo@sewago.com',
            name: 'Demo User',
            role: 'user',
          };
        }
        
        // Allow any email with demo123 password for testing
        if (credentials?.password === 'demo123') {
          return {
            id: `user-${Date.now()}`,
            email: credentials.email,
            name: credentials.email.split('@')[0],
            role: 'user',
          };
        }
        
        return null;
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
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-production',
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
