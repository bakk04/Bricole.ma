import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import jwt from "jsonwebtoken";
import redis from "@/lib/redis";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Token manquant." },
        { status: 401 }
      );
    }

    const bricoleToken = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET non défini");
      return NextResponse.json(
        { success: false, message: "Erreur de configuration serveur." },
        { status: 500 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(bricoleToken, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Token applicatif invalide ou expiré." },
        { status: 401 }
      );
    }

    const userId = decoded.userId || decoded.id || decoded.sub;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Token applicatif invalide." },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    // Création du token JWT principal (auth_token) comme /api/login
    const authToken = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email,
        role: user.role || "CLIENT",
        urlToken: user.urlToken
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const sessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      name:
        user.name ||
        `${user.prenom || ""} ${user.nom || ""}`.trim() ||
        "Utilisateur",
      role: user.role || "CLIENT",
      profileImage: user.profileImage || user.image || null,
      phone: user.telephone || user.phone || null,
      city: user.ville || user.city || null,
      createdAt: user.createdAt || new Date(),
    };

    try {
      await redis.set(
        `session:${authToken}`,
        JSON.stringify(sessionPayload),
        "EX",
        3600 * 24 * 7
      );
    } catch (redisError) {
      console.error("Erreur Redis (google-sync):", redisError);
    }

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      token: authToken,
    });

    response.cookies.set("auth_token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erreur /api/auth/google-sync:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Erreur serveur lors de la synchronisation Google.",
      },
      { status: 500 }
    );
  }
}

