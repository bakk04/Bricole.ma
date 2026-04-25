import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ArtisanProfile from "@/models/ArtisanProfile";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";

interface AuthContext {
  user?: any;
  error?: string;
  status?: number;
}

async function getAuthUser(): Promise<AuthContext> {
  await connectDB();

  // 1. NextAuth
  const session = await getServerSession(authOptions);
  let userId = (session?.user as any)?.id;

  // 2. JWT Custom
  if (!userId) {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const authCookie = cookieStore.get("auth_token");
    const authHeader = headerStore.get("authorization");

    const tokenFromHeader =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    const token = authCookie?.value || tokenFromHeader;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        userId = decoded.userId;
      } catch (err: any) {
        console.error("JWT verification failed:", err.message);
      }
    }
  }

  if (!userId) return { error: "Non authentifié", status: 401 };

  const user = await User.findById(userId).lean();
  if (!user || user.role !== "ARTISAN") {
    return { error: "Accès réservé aux artisans", status: 403 };
  }

  return { user };
}

export async function GET() {
  try {
    const ctx = await getAuthUser();
    if (ctx.error) {
      return NextResponse.json(
        { success: false, message: ctx.error },
        { status: ctx.status }
      );
    }

    const { user } = ctx;
    let profile: any = await ArtisanProfile.findOne({ userId: user._id }).lean();
    
    // Auto-création si manquant
    if (!profile) {
      let defaultCategory = await Category.findOne();
      if (!defaultCategory) {
        defaultCategory = await Category.create({ nom: "Général", description: "Default" });
      }

      const newProfile = await ArtisanProfile.create({
        userId: user._id,
        nomComplet: user.name || `${user.prenom || ""} ${user.nom || ""}`.trim() || user.email.split("@")[0],
        telephone: user.telephone || "Non spécifié",
        ville: user.ville || "Non spécifiée",
        metierId: defaultCategory._id,
        description: "Nouveau profil artisan",
        photoProfil: user.image || user.profileImage || "https://res.cloudinary.com/dr2fjkaye/image/upload/v1/default-avatar.png",
      });
      profile = newProfile.toObject();
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Erreur /api/artisan/profile:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors du chargement du profil artisan" },
      { status: 500 }
    );
  }
}
