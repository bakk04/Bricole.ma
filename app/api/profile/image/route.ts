import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import redis from "@/lib/redis";
import { uploadImage } from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

async function getUserFromToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const tokenFromHeader =
    authHeader && typeof authHeader === 'string' && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

  const cookieHeader = req.headers.get("cookie") || "";
  const cookieMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const tokenFromCookie = cookieMatch ? cookieMatch[1] : null;

  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return { error: "Non authentifié", status: 401 };
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "");
  } catch (err) {
    return { error: "Token invalide ou expiré", status: 401 };
  }

  try {
    await connectDB();
    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return { error: "Utilisateur introuvable", status: 404 };
    }
    return { user, token };
  } catch (err) {
    console.error("Database connection error in getUserFromToken:", err);
    return { error: "Erreur de connexion à la base de données", status: 500 };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, token, error, status } = await getUserFromToken(req);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Image requise" },
        { status: 400 }
      );
    }

    const uploaded = await uploadImage(image, "bricole_ma/avatars");

    await connectDB();
    await User.updateOne(
      { _id: (user as any)._id },
      { $set: { profileImage: uploaded.url } }
    );

    const updatedUser = {
      userId: (user as any)._id.toString(),
      email: (user as any).email,
      name: (user as any).name || `${(user as any).prenom || ""} ${(user as any).nom || ""}`.trim() || (user as any).email,
      role: (user as any).role || "CLIENT",
      profileImage: uploaded.url,
    };

    // Mettre à jour la session dans Redis
    await redis.set(
      `session:${token}`,
      JSON.stringify(updatedUser),
      "EX",
      3600
    );

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur /api/profile/image:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'upload de l'image." },
      { status: 500 }
    );
  }
}
