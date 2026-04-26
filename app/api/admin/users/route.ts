import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

async function getAuthAdmin() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;

    if (!userId) {
      const cookieStore = await cookies();
      const headerStore = await headers();
      const authCookie = cookieStore.get("auth_token");
      const authHeader = headerStore.get("authorization");
      const token = authCookie?.value || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
          userId = decoded.userId;
        } catch (err) {}
      }
    }

    if (!userId) return { error: "Non authentifié", status: 401 };

    const user = await User.findById(userId).lean();
    if (!user || user.role !== "ADMIN") {
      return { error: "Accès réservé aux administrateurs", status: 403 };
    }

    return { user };
  } catch (err) {
    return { error: "Erreur d'authentification", status: 500 };
  }
}

export async function GET(req: Request) {
  try {
    const ctx = await getAuthAdmin();
    if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    await connectDB();

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { prenom: { $regex: search, $options: "i" } },
        { nom: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    try {
        const ctx = await getAuthAdmin();
        if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status });

        const body = await req.json();
        const { userId, status, role } = body;

        if (!userId) return NextResponse.json({ success: false, message: "ID utilisateur requis" }, { status: 400 });

        await connectDB();
        const updatedUser = await User.findByIdAndUpdate(userId, { 
            ...(status && { status }),
            ...(role && { role })
        }, { new: true });

        if (!updatedUser) return NextResponse.json({ success: false, message: "Utilisateur non trouvé" }, { status: 404 });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const ctx = await getAuthAdmin();
        if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status });

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) return NextResponse.json({ success: false, message: "ID utilisateur requis" }, { status: 400 });

        await connectDB();
        
        // Supprimer l'utilisateur
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) return NextResponse.json({ success: false, message: "Utilisateur non trouvé" }, { status: 404 });

        // Optionnel: Supprimer aussi son profil artisan s'il existe
        const ArtisanProfile = (await import("@/models/ArtisanProfile")).default;
        await ArtisanProfile.findOneAndDelete({ userId: userId });

        return NextResponse.json({ success: true, message: "Utilisateur et profil associés supprimés" });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
