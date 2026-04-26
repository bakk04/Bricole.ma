import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import ArtisanProfile from "@/models/ArtisanProfile";
import User from "@/models/User";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";

async function getAuthAdmin() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const headerStore = await headers();
    const authCookie = cookieStore.get("auth_token");
    const authHeader = headerStore.get("authorization");
    const token = authCookie?.value || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

    if (!token) return { error: "Non authentifié", status: 401 };

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId).lean();
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
    if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status || 500 });

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all"; 

    await connectDB();

    const query: any = {};
    if (filter === "pending") query.estVerifie = false;
    if (filter === "verified") query.estVerifie = true;

    // Récupération sécurisée
    const artisans = await ArtisanProfile.find(query)
      .populate("userId", "name email profileImage")
      .populate("metierId", "nom")
      .sort({ createdAt: -1 })
      .lean();

    // Filtrage manuel pour être certain de ne pas avoir de crashs sur des IDs inexistants
    const validArtisans = artisans.filter((art: any) => art.userId);

    return NextResponse.json({
      success: true,
      artisans: validArtisans
    });
  } catch (error: any) {
    console.error("Admin Artisans API Error:", error);
    return NextResponse.json({ success: false, message: "Erreur lors de la récupération des artisans" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    try {
        const ctx = await getAuthAdmin();
        if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status || 500 });

        const body = await req.json();
        const { artisanId, estVerifie } = body;

        if (!artisanId) return NextResponse.json({ success: false, message: "ID artisan requis" }, { status: 400 });

        await connectDB();
        const updated = await ArtisanProfile.findByIdAndUpdate(artisanId, { estVerifie }, { new: true });

        return NextResponse.json({ success: true, artisan: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
