import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import ArtisanProfile from "@/models/ArtisanProfile";
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
    const filter = searchParams.get("filter") || "all"; // all | pending | verified

    await connectDB();

    const query: any = {};
    if (filter === "pending") query.estVerifie = false;
    if (filter === "verified") query.estVerifie = true;

    const artisans = await ArtisanProfile.find(query)
      .populate("userId", "name email profileImage")
      .populate("metierId", "nom")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      artisans
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
        const { artisanId, estVerifie } = body;

        if (!artisanId) return NextResponse.json({ success: false, message: "ID artisan requis" }, { status: 400 });

        await connectDB();
        const updated = await ArtisanProfile.findByIdAndUpdate(artisanId, { estVerifie }, { new: true });

        if (!updated) return NextResponse.json({ success: false, message: "Profil artisan non trouvé" }, { status: 404 });

        return NextResponse.json({ success: true, artisan: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
