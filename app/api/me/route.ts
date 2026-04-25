import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import redis from "@/lib/redis";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

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

    let sessionDataRaw = await redis.get(`session:${token}`);
    let sessionData: any = null;

    if (!sessionDataRaw) {
      let decoded: any;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!);
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
        userId: (user._id as any).toString(),
        email: user.email,
        name: user.name || `${user.prenom || ""} ${user.nom || ""}`.trim(),
        role: user.role || "CLIENT",
        profileImage: (user as any).profileImage || (user as any).image || null,
        urlToken: decoded.urlToken || null, // Si présent dans le JWT
      };

      await redis.set(
        `session:${token}`,
        JSON.stringify(sessionData),
        "EX",
        30 * 24 * 60 * 60 // 30 days session in Redis
      );
    } else {
      try {
        sessionData = typeof sessionDataRaw === 'string' ? JSON.parse(sessionDataRaw) : sessionDataRaw;
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

    return NextResponse.json(sessionData, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      }
    });
  } catch (error) {
    console.error("Erreur /api/me:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la vérification de la session" },
      { status: 500 }
    );
  }
}
