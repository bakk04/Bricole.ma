import { connectDB } from "@/lib/mongodb";
export const dynamic = "force-dynamic";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import redis from "@/lib/redis";
import { NextResponse } from "next/server";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
          { success: false, message: "Email et mot de passe sont requis." },
          { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Utilisation du modèle User avec .select("+password") car il est en select: false dans le schéma
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      console.log(`Login failed: User not found for email ${normalizedEmail}`);
      return NextResponse.json(
          { success: false, message: "Email ou mot de passe incorrect." },
          { status: 401 }
      );
    }

    if (!user.password) {
      console.log(`Login failed: User ${normalizedEmail} has no password (probably Google user)`);
      return NextResponse.json(
          { success: false, message: "Ce compte utilise la connexion Google. Veuillez vous connecter avec Google." },
          { status: 401 }
      );
    }

    // Vérification du mot de passe
    let isValid = false;
    try {
        // Cas normal: mot de passe stocké comme hash bcrypt
        isValid = await bcrypt.compare(password, user.password);
    } catch (e) {
        console.error("Erreur lors de la comparaison bcrypt:", e);
        isValid = false;
    }

    // Gestion de compatibilité: anciens comptes avec mot de passe en clair
    if (!isValid && user.password && typeof user.password === "string") {
        if (user.password === password) {
            console.warn(
                `Legacy password detected for ${normalizedEmail}, migration vers bcrypt...`
            );
            try {
                const newHash = await bcrypt.hash(password, 10);
                user.password = newHash;
                await user.save();
                isValid = true;
            } catch (migrationError) {
                console.error(
                    "Erreur lors de la migration du mot de passe legacy:",
                    migrationError
                );
                isValid = false;
            }
        }
    }

    if (!isValid) {
        console.log(`Login failed: Invalid password for ${normalizedEmail}`);
        return NextResponse.json(
            { success: false, message: "Email ou mot de passe incorrect." },
            { status: 401 }
        );
    }

    // Vérifier si le compte est activé
    if (user.status === "PENDING" || !user.isVerified) {
        return NextResponse.json(
            { 
              success: false, 
              message: "Votre compte n'est pas encore activé. Veuillez vérifier votre boîte de réception pour confirmer votre adresse e-mail.",
              isPending: true
            },
            { status: 403 }
        );
    }

    // Création du token JWT
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables");
        throw new Error("Erreur de configuration serveur.");
    }

    const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" } // Augmenté à 7 jours pour une meilleure UX
    );

    // Payload session
    const sessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name || `${user.prenom || ""} ${user.nom || ""}`.trim() || "Utilisateur",
      role: user.role || "CLIENT",
      image: user.image || user.profileImage || null,
    };

    // Stockage session dans Redis (optionnel, on gère les erreurs)
    try {
        await redis.set(
            `session:${token}`,
            JSON.stringify(sessionPayload),
            "EX",
            3600 * 24 * 7 // 7 jours
        );
    } catch (redisError) {
        console.error("Redis storage error:", redisError);
    }

    // Création réponse avec cookie
    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      token: token,
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600 * 24 * 7, // 7 jours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erreur /api/login:", error);
    return NextResponse.json(
        {
          success: false,
          message: error.message || "Erreur serveur lors de la connexion.",
        },
        { status: 500 }
    );
  }
}
