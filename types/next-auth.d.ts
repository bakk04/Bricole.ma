import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Extends the built-in session.user object
   */
  interface Session {
    user: {
      urlToken?: string;
      role?: string;
      image?: string;
      profileImage?: string;
    } & DefaultSession["user"]
  }

  /**
   * Extends the built-in user object
   */
  interface User {
    urlToken?: string;
    role?: string;
  }
}
