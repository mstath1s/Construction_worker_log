import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extended Session type to include user ID
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  /**
   * Extended User type to ensure ID is always present
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT type to include user ID
   */
  interface JWT {
    id: string;
  }
}
