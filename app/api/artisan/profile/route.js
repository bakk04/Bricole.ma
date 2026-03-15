import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ArtisanProfile from "@/models/ArtisanProfile";

async function getAuthUser() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const authCookie = cookieStore.get("auth_token");
  const authHeader = headerStore.get("authorization");

  const tokenFromHeader =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

  const token = authCookie?.value || tokenFromHeader;

  if (!token) {
    return null;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }

  await connectDB();
  const user = await User.findById(decoded.userId).lean();
  if (!user || user.role !== "ARTISAN") {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Non authentifié ou rôle invalide" },
        { status: 401 }
      );
    }

    const profile = await ArtisanProfile.findOne({ userId: user._id }).lean();
    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profil artisan introuvable" },
        { status: 404 }
      );
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

