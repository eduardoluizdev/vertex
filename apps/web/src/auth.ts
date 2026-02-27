import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
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

        try {
          const apiUrl = process.env.API_URL || 'https://api.vertexhub.dev';
          const response = await fetch(
            `${apiUrl}/v1/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            },
          );

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            image: data.user.avatar,
            accessToken: data.access_token,
            githubId: data.user.githubId,
          };
        } catch {
          return null;
        }
      },
    }),
    Credentials({
      id: 'github-token',
      name: 'GitHub Token',
      credentials: {
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.token) {
          return null;
        }

        try {
          const apiUrl = process.env.API_URL || 'https://api.vertexhub.dev';
          const response = await fetch(`${apiUrl}/v1/auth/profile`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${credentials.token}`,
            },
          });

          if (!response.ok) {
            return null;
          }

          const user = await response.json();

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.avatar,
            accessToken: credentials.token as string,
            githubId: user.githubId,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
        token.githubId = (user as any).githubId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session as any).user.role = token.role;
        (session as any).user.githubId = token.githubId;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
});
