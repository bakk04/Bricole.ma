import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        try {
          await connectDB();
          
          // Chercher si l'utilisateur existe déjà
          const userExists = await User.findOne({ email: user.email });

          if (!userExists) {
            // Créer un nouvel utilisateur avec le rôle CLIENT par défaut
            await User.create({
              email: user.email,
              name: user.name, // Nom de Google
              image: user.image, // Image de Google
              role: "CLIENT",
              status: "ACTIVE",
            });
          }
          return true;
        } catch (error) {
          console.error("Error checking/creating user during Google Login:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
      // Ajouter l'ID et le rôle de l'utilisateur à la session pour un usage facile côté client
      await connectDB();
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        session.user.id = user._id.toString();
        session.user.role = user.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST };
