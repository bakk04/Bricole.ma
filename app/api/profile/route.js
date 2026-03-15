import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import redis from "@/lib/redis";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
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
      return NextResponse.json(
        { success: false, message: "Non authentifié" },
        { status: 401 }
      );
    }

    let sessionData = await redis.get(`session:${token}`);

    if (!sessionData) {
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return NextResponse.json(
          { success: false, message: "Token invalide ou expiré" },
          { status: 401 }
        );
      }

      await connectDB();
      const user = await User.findById(decoded.userId).lean();

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Utilisateur introuvable" },
          { status: 404 }
        );
      }

      sessionData = {
        userId: user._id.toString(),
        email: user.email,
        name: user.name || `${user.prenom || ""} ${user.nom || ""}`.trim() || user.email,
        role: user.role || "CLIENT",
        profileImage: user.profileImage || user.image || null,
        phone: user.telephone || user.phone || null,
        city: user.ville || user.city || null,
        createdAt: user.createdAt || new Date(),
      };

      await redis.set(
        `session:${token}`,
        JSON.stringify(sessionData),
        "EX",
        3600
      );
    } else {
      sessionData = JSON.parse(sessionData);
    }

    return NextResponse.json({
      success: true,
      user: sessionData
    });
  } catch (error) {
    console.error("Erreur /api/profile:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}
