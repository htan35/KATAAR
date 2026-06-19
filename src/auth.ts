import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const providers: any[] = [
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const email = (credentials.email as string).toLowerCase().trim();
      const password = credentials.password as string;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.hashedPassword) {
        throw new Error('Invalid email or password');
      }

      const isValid = await bcrypt.compare(password, user.hashedPassword);

      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNumber: user.mobileNumber,
      } as any;
    },
  })
];

// Add Google Provider if environment keys are supplied
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    newUser: '/signup',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.firstName = (user as any).firstName || '';
        token.lastName = (user as any).lastName || '';
        token.mobileNumber = (user as any).mobileNumber || '';
      }
      if (trigger === 'update' && session) {
        return { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        (session.user as any).firstName = token.firstName as string;
        (session.user as any).lastName = token.lastName as string;
        (session.user as any).mobileNumber = token.mobileNumber as string;
      }
      return session;
    },
  },
});
