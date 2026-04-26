import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionUser } from "@/lib/session";
import redis from "@/lib/redis";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    settings: {
      pushNotifications: true,
      emailMarketing: false,
      shareLocation: true,
      publicProfile: true,
      darkMode: false,
      instantMessages: true
    }
  });
}

export async function PUT(req: Request) {
  try {
    const userSession = await getSessionUser();
    if (!userSession) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, city } = body;

    await connectDB();
    const user = await User.findById(userSession.id);
    if (!user) {
      return NextResponse.json({ success: false, error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (name) user.name = name;
    if (phone) user.telephone = phone;
    if (city) user.ville = city;

    await user.save();

    // --- MISE À JOUR DU CACHE REDIS POUR QUE LES CHANGEMENTS SOIENT INSTANTANÉS ---
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (token) {
            await redis.del(`session:${token}`);
        }
    } catch (redisErr) {
        console.error("Redis session invalidation failed:", redisErr);
    }

    return NextResponse.json({ 
        success: true, 
        user: {
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "CLIENT",
            profileImage: user.profileImage || user.image || null,
            phone: user.telephone || null,
            city: user.ville || null,
            createdAt: user.createdAt,
        }
    });
  } catch (error) {
    console.error("PUT Profile Settings Error:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH() {
  return NextResponse.json({ success: true });
}
