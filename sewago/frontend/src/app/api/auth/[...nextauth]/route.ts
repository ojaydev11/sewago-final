import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import bcrypt from 'bcryptjs';
import { dbConnect, getMongoClient } from '@/lib/mongodb';
import { User } from '@/models/User';
import { mockStore } from '@/lib/mockStore';

const mongoClient = getMongoClient();

const handler = NextAuth({
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
          const connection = await dbConnect();
          
          if (connection) {
            // Use MongoDB
            const user = await User.findOne({ email: credentials.email });
            if (!user) return null;
            
            const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
            if (!isPasswordValid) return null;
            
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
            };
          } else {
            // Use mock store
            const user = await mockStore.findOne({ email: credentials.email });
            if (!user) return null;
            
            // For demo purposes, accept any password in mock mode
            if (credentials.password === 'demo123') {
              return {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
              };
            }
            
            return null;
          }
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  adapter: mongoClient ? MongoDBAdapter(mongoClient) : undefined,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Type assertion for custom user properties
        const customUser = user as any;
        token.role = customUser.role;
        token.id = customUser.id;
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
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
