import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      githubId?: string | null;
    } & DefaultSession['user'];
    accessToken: string;
  }

  interface User {
    role: string;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    id: string;
    role: string;
    accessToken: string;
    githubId?: string | null;
  }
}
