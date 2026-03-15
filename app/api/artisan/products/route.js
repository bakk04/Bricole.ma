import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ArtisanProfile from "@/models/ArtisanProfile";
import ProductService from "@/models/ProductService";
import Favorite from "@/models/Favorite";
import Interaction from "@/models/Interaction";

async function getAuthArtisan() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const authCookie = cookieStore.get("auth_token");
  const authHeader = headerStore.get("authorization");

  const tokenFromHeader =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

  const token = authCookie?.value || tokenFromHeader;

  if (!token) return null;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }

  await connectDB();
  const user = await User.findById(decoded.userId).lean();
  if (!user || user.role !== "ARTISAN") return null;

  const artisan = await ArtisanProfile.findOne({ userId: user._id }).lean();
  if (!artisan) return null;

  return { user, artisan };
}

export async function GET() {
  try {
    const ctx = await getAuthArtisan();
    if (!ctx) {
      return NextResponse.json(
        { success: false, message: "Non authentifié ou artisan introuvable" },
        { status: 401 }
      );
    }

    const { artisan } = ctx;

    const products = await ProductService.find({ artisanId: artisan._id })
      .populate("categoryId")
      .lean();

    const [favCounts, viewCounts] = await Promise.all([
      Promise.all(
        products.map((p) =>
          Favorite.countDocuments({ productId: p._id })
        )
      ),
      Promise.all(
        products.map((p) =>
          Interaction.countDocuments({
            targetId: p._id,
            targetType: "PRODUCT",
            type: "VIEW",
          })
        )
      ),
    ]);

    const enriched = products.map((p, idx) => ({
      ...p,
      favCount: favCounts[idx] || 0,
      viewCount: viewCounts[idx] || 0,
      statut: p.statut || "ACTIVE",
    }));

    return NextResponse.json({
      success: true,
      products: enriched,
    });
  } catch (error) {
    console.error("Erreur /api/artisan/products [GET]:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors du chargement des services" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const ctx = await getAuthArtisan();
    if (!ctx) {
      return NextResponse.json(
        { success: false, message: "Non authentifié ou artisan introuvable" },
        { status: 401 }
      );
    }

    const { artisan } = ctx;
    const body = await request.json();

    const { titre, description, prix, categoryId, images = [] } = body;

    if (!titre || !prix || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Titre, prix et catégorie sont obligatoires" },
        { status: 400 }
      );
    }

    await connectDB();

    const created = await ProductService.create({
      artisanId: artisan._id,
      categoryId,
      titre,
      description: description || "",
      prix,
      images,
    });

    const product = await ProductService.findById(created._id)
      .populate("categoryId")
      .lean();

    return NextResponse.json(
      {
        success: true,
        product: {
          ...product,
          favCount: 0,
          viewCount: 0,
          statut: product.statut || "ACTIVE",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur /api/artisan/products [POST]:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la création du service" },
      { status: 500 }
    );
  }
}

