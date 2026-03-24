import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
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
        { error: "Non authentifié" },
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
          { error: "Token invalide ou expiré" },
          { status: 401 }
        );
      }

      await connectDB();
      const user = await User.findById(decoded.userId).lean();

      if (!user) {
        return NextResponse.json(
          { error: "Utilisateur introuvable" },
          { status: 404 }
        );
      }

      sessionData = {
        userId: user._id.toString(),
        email: user.email,
        name: user.name || `${user.prenom || ""} ${user.nom || ""}`.trim(),
        role: user.role || "CLIENT",
        profileImage: user.profileImage || user.image || null,
      };

      await redis.set(
        `session:${token}`,
        JSON.stringify(sessionData),
        "EX",
        3600
      );
    } else {
      try {
        sessionData = JSON.parse(sessionData);
      } catch {
        sessionData = null;
      }
      if (!sessionData) {
        await redis.del(`session:${token}`);
        return NextResponse.json(
          { error: "Session invalide" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Erreur /api/me:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la vérification de la session" },
      { status: 500 }
    );
  }
}
