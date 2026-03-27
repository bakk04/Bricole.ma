import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectDB();

          const email = user?.email?.toLowerCase().trim();
          if (!email) {
            return true;
          }

          let existingUser = await User.findOne({ email });

          if (!existingUser) {
            existingUser = await User.create({
              email,
              name:
                user.name ||
                profile?.name ||
                (email.includes("@") ? email.split("@")[0] : email),
              image: user.image || profile?.picture || null,
              role: "CLIENT",
              status: "ACTIVE",
            });
          } else {
            const updates = {};

            if (!existingUser.name && user.name) {
              updates.name = user.name;
            }

            const newImage = user.image || profile?.picture;
            if (!existingUser.image && newImage) {
              updates.image = newImage;
            }

            if (!existingUser.role) {
              updates.role = "CLIENT";
            }

            if (Object.keys(updates).length > 0) {
              existingUser.set(updates);
              await existingUser.save();
            }
          }

          user.id = existingUser._id.toString();
          user.role = existingUser.role || "CLIENT";
          user.image =
            existingUser.image || user.image || profile?.picture || null;
        } catch (err) {
          console.error("Erreur lors du signIn Google:", err);
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || token.sub;
        token.role = user.role || "CLIENT";
        token.image = user.image;
        // Jeton de navigation unique par session
        token.urlToken = crypto.randomBytes(8).toString('hex');
      }

      // Générer un token JWT applicatif (différent des tokens Google)
      if (process.env.JWT_SECRET && token.id) {
        try {
          token.bricoleToken = jwt.sign(
            { userId: token.id, role: token.role || "CLIENT" },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
          );
        } catch (e) {
          console.error("Erreur de génération du bricoleToken:", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.image;
        session.user.urlToken = token.urlToken; // Transmis au client
        if (token.bricoleToken) {
          session.user.bricoleToken = token.bricoleToken;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Si l'utilisateur venait de /login avec Google, on le renvoie vers /profile avec un token court
      const isCallbackToProfile =
        url.startsWith(baseUrl) &&
        (url === `${baseUrl}/` || url.startsWith(`${baseUrl}/login`));

      if (isCallbackToProfile) {
        // On ne peut pas lire le token ici, donc on redirige simplement vers /profile
        // Le token court (bricoleToken) est disponible côté client via useSession()
        return `${baseUrl}/profile`;
      }

      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes
  },
  pages: { signIn: "/login" },
};
