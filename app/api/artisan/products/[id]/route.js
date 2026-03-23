import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ArtisanProfile from "@/models/ArtisanProfile";
import ProductService from "@/models/ProductService";

async function getAuthArtisan() {
  await connectDB();

  // 1. NextAuth Session
  const session = await getServerSession(authOptions);
  let userId = session?.user?.id;

  // 2. JWT Custom (auth_token cookie ou header)
  if (!userId) {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const authCookie = cookieStore.get("auth_token");
    const authHeader = headerStore.get("authorization");

    const tokenFromHeader =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    const token = authCookie?.value || tokenFromHeader;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        console.error("JWT verification failed:", err.message);
      }
    }
  }

  if (!userId) return { error: "Non authentifié", status: 401 };

  const user = await User.findById(userId).lean();
  if (!user) return { error: "Utilisateur introuvable", status: 401 };
  
  if (user.role !== "ARTISAN") {
    return { error: "Accès réservé aux artisans", status: 403 };
  }

  const artisan = await ArtisanProfile.findOne({ userId: user._id }).lean();
  if (!artisan) {
    return { 
      error: "Profil artisan non complété. Veuillez remplir votre profil avant de gérer vos services.", 
      status: 403 
    };
  }

  return { user, artisan };
}

export async function PUT(request, { params }) {
  try {
    const ctx = await getAuthArtisan();
    if (ctx.error) {
      return NextResponse.json(
        { success: false, message: ctx.error },
        { status: ctx.status }
      );
    }

    const { artisan } = ctx;
    const { id } = params;
    const data = await request.json();

    await connectDB();

    const updated = await ProductService.findOneAndUpdate(
      { _id: id, artisanId: artisan._id },
      {
        $set: {
          titre: data.titre,
          description: data.description,
          prix: data.prix,
          categoryId: data.categoryId,
          images: data.images ?? [],
        },
      },
      { new: true }
    )
      .populate("categoryId")
      .lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Service introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: updated,
    });
  } catch (error) {
    console.error("Erreur /api/artisan/products/[id] [PUT]:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la mise à jour du service" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const ctx = await getAuthArtisan();
    if (ctx.error) {
      return NextResponse.json(
        { success: false, message: ctx.error },
        { status: ctx.status }
      );
    }

    const { artisan } = ctx;
    const { id } = params;
    const data = await request.json();

    await connectDB();

    const updated = await ProductService.findOneAndUpdate(
      { _id: id, artisanId: artisan._id },
      { $set: data },
      { new: true }
    )
      .populate("categoryId")
      .lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Service introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: updated,
    });
  } catch (error) {
    console.error("Erreur /api/artisan/products/[id] [PATCH]:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la mise à jour du service" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const ctx = await getAuthArtisan();
    if (ctx.error) {
      return NextResponse.json(
        { success: false, message: ctx.error },
        { status: ctx.status }
      );
    }

    const { artisan } = ctx;
    const { id } = params;

    await connectDB();

    const deleted = await ProductService.findOneAndDelete({
      _id: id,
      artisanId: artisan._id,
    }).lean();

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Service introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur /api/artisan/products/[id] [DELETE]:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la suppression du service" },
      { status: 500 }
    );
  }
}
