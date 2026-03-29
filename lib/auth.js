import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "@/lib/nodemailer";

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
            const name = user.name || profile?.name || (email.includes("@") ? email.split("@")[0] : email);
            
            existingUser = await User.create({
              email,
              name,
              image: user.image || profile?.picture || null,
              role: "CLIENT",
              status: "ACTIVE",
              isVerified: true,
            });

            // Envoi de l'email de bienvenue direct
            const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
            try {
              await sendEmail({
                to: email,
                subject: 'Bienvenue sur Bricole.ma !',
                html: `
                  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f1f5f9;">
                      <h1 style="color: #3b82f6; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.025em;">bricole<span style="color: #0f172a;">.ma</span></h1>
                    </div>
                    
                    <div style="padding: 10px 0;">
                      <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 16px; text-align: center;">Bienvenue sur Bricole.ma !</h2>
                      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                        Bonjour <strong>${name}</strong>, merci de rejoindre la plus grande communauté d'artisans au Maroc. Votre compte a été créé avec succès via Google et est déjà actif.
                      </p>
                      
                      <div style="text-align: center; margin: 35px 0;">
                        <a href="${baseUrl}" style="background-color: #3b82f6; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.2);">
                          Commencer à explorer
                        </a>
                      </div>
                    </div>
                    
                    <div style="margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        &copy; ${new Date().getFullYear()} Bricole.ma. Tous droits réservés.
                      </p>
                    </div>
                  </div>
                `
              });
            } catch (emailErr) {
              console.error("Erreur envoi email bienvenue Google:", emailErr);
            }
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

            // Forcer le status ACTIVE et isVerified si login Google
            if (existingUser.status !== "ACTIVE") {
              updates.status = "ACTIVE";
            }
            if (!existingUser.isVerified) {
              updates.isVerified = true;
            }

            if (Object.keys(updates).length > 0) {
              existingUser.set(updates);
              await existingUser.save();
            }
          }

          user.id = existingUser._id.toString();
          user.role = existingUser.role || "CLIENT";
          user.urlToken = existingUser.urlToken || crypto.randomBytes(8).toString('hex');
          user.image =
            existingUser.image || user.image || profile?.picture || null;
            
          // Sauvegarder l'urlToken s'il vient d'être généré
          if (!existingUser.urlToken) {
              await User.updateOne({ _id: existingUser._id }, { $set: { urlToken: user.urlToken } });
          }
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
        // Utiliser l'urlToken de l'utilisateur s'il existe (cas Google/signIn)
        token.urlToken = user.urlToken || crypto.randomBytes(8).toString('hex');
      }

      // Générer un token JWT applicatif (différent des tokens Google)
      if (process.env.JWT_SECRET && token.id) {
        try {
          token.bricoleToken = jwt.sign(
            { userId: token.id, role: token.role || "CLIENT", urlToken: token.urlToken },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
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
      // Autoriser les redirections relatives
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Autoriser les redirections vers la même origine
      try {
        const urlObj = new URL(url);
        const baseObj = new URL(baseUrl);
        if (urlObj.origin === baseObj.origin) return url;
      } catch (e) {
        // En cas d'URL invalide, fallback sur baseUrl
      }
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: { signIn: "/login" },
};
