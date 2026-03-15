import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import redis from "@/lib/redis";
import { uploadImage } from "@/lib/cloudinary";

const client = new MongoClient(process.env.MONGODB_URI);

async function getUserFromToken(req) {
  const authHeader = req.headers.get("authorization");
  const tokenFromHeader =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

  const cookieHeader = req.headers.get("cookie") || "";
  const cookieMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const tokenFromCookie = cookieMatch ? cookieMatch[1] : null;

  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return { error: "Non authentifié", status: 401 };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return { error: "Token invalide ou expiré", status: 401 };
  }

  await client.connect();
  const db = client.db(process.env.DB_NAME);
  const users = db.collection("Users");

  const user = await users.findOne({ _id: new ObjectId(decoded.userId) });
  if (!user) {
    return { error: "Utilisateur introuvable", status: 404 };
  }

  return { user, token };
}

export async function POST(req) {
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

    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const users = db.collection("Users");

    await users.updateOne(
      { _id: user._id },
      { $set: { profileImage: uploaded.url } }
    );

    const updatedUser = {
      userId: user._id,
      email: user.email,
      name: user.name || `${user.prenom || ""} ${user.nom || ""}`.trim(),
      role: user.role || "CLIENT",
      profileImage: uploaded.url,
    };

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

