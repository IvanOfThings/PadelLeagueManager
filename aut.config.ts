import type { NextAuthConfig } from 'next-auth';
import { UserWithPassword } from './app/lib/definitions';
import prisma from './app/lib/prisma';
import { uuidV4 } from 'data-structure-typed';

export async function createUser({
  id,
  name,
  email,
}: {
  id: string;
  name: string;
  email: string;
}): Promise<UserWithPassword> {
  let user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id,
        name,
        email,
        password: '',
      },
    });
  }
  return user;
}

async function getFullUser(email: string): Promise<UserWithPassword | null> {
  try {
    console.log('Fetching user:', email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      console.log('User found:', user);
    }

    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    signIn: async ({ user, account, profile, email, credentials }) => {
      let isLoggedIn = false;
      console.log('Siginning In', profile);
      if (
        account &&
        profile &&
        account.provider === 'google' &&
        profile.email
      ) {
        isLoggedIn = !!profile.email_verified;
        let user = await getFullUser(profile.email);
        if (!user) {
          console.log('Creating user:', profile.email);
          user = await createUser({
            email: profile.email,
            name: profile.name ?? 'Jhon Doe',
            id: uuidV4(),
          });
        }
        profile.userId = user?.id;
      } else if (account && account.provider === 'credentials') {
        isLoggedIn = !!user;
      }
      return isLoggedIn;
    },
    authorized({ auth, request: { nextUrl } }) {
      console.log('authorized', auth);
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },

    async jwt({ token, user, profile }) {
      // Persist the OAuth access_token and or the use
      console.log('jwt', user, token);
      if (user) {
        token.userId = user.id;
      }
      if (profile) {
        token.userId = profile.userId;
      }
      return token;
    },
    // @ts-ignore
    async session({ session, token }) {
      console.log('session', session, token);
      // Send properties to the client, like an access_token and user id from a provider.
      if (session && token !== undefined && token.userId !== undefined) {
        session.user = {
          ...session.user,
          // @ts-ignore
          id: token.userId,
        };
      }
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
