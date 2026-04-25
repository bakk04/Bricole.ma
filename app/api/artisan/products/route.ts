import { NextResponse, NextRequest } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ArtisanProfile from "@/models/ArtisanProfile";
import ProductService from "@/models/ProductService";
import Favorite from "@/models/Favorite";
import Interaction from "@/models/Interaction";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";

interface AuthContext {
  user?: any;
  artisan?: any;
  error?: string;
  status?: number;
}

/**
 * Récupère l'artisan authentifié
 */
async function getAuthArtisan(): Promise<AuthContext> {
  try {
    await connectDB();
    
    // 1. Essayer NextAuth Session
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    
    // 2. Essayer JWT Custom (auth_token cookie ou header)
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
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
          userId = decoded.userId;
        } catch (err: any) {
          console.error("JWT verification failed:", err.message);
          return { error: `Token invalide ou expiré: ${err.message}`, status: 401 };
        }
      }
    }

    if (!userId) {
        console.warn("Aucun userId trouvé dans la session ou le header Authorization");
        return { error: "Non authentifié (Session absente et aucun token trouvé)", status: 401 };
    }

    const user = await User.findById(userId).lean();
    if (!user) {
        console.error(`Utilisateur non trouvé en DB pour ID: ${userId}`);
        return { error: "Utilisateur introuvable dans la base de données", status: 401 };
    }
    
    if (user.role !== "ARTISAN") {
      console.warn(`Tentative d'accès artisan par un utilisateur avec le rôle: ${user.role} (ID: ${userId})`);
      return { error: `Accès réservé aux artisans (Votre rôle actuel: ${user.role})`, status: 403 };
    }

    let artisan = await ArtisanProfile.findOne({ userId: user._id }).lean();
    
    if (!artisan) {
      let defaultCategory = await Category.findOne();
      if (!defaultCategory) {
          defaultCategory = await Category.create({ 
              nom: "Général", 
              description: "Catégorie par défaut" 
          });
      }

      const newArtisan = await ArtisanProfile.create({
        userId: user._id,
        nomComplet: user.name || `${user.prenom || ""} ${user.nom || ""}`.trim() || user.email.split("@")[0],
        telephone: user.telephone || "Non spécifié",
        ville: user.ville || "Non spécifiée",
        metierId: defaultCategory._id,
        description: "Nouveau profil artisan",
        photoProfil: user.image || user.profileImage || "https://res.cloudinary.com/dr2fjkaye/image/upload/v1/default-avatar.png",
      });
      
      artisan = newArtisan.toObject();
    }

    return { user, artisan };
  } catch (err) {
    console.error("Erreur getAuthArtisan:", err);
    return { error: "Erreur d'authentification interne", status: 500 };
  }
}

/**
 * GET: Liste des services de l'artisan
 */
export async function GET() {
  try {
    const ctx = await getAuthArtisan();
    if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status });

    const { artisan } = ctx;
    await connectDB();

    const products = await ProductService.find({ artisanId: artisan._id })
      .populate("categoryId")
      .sort({ createdAt: -1 })
      .lean();

    if (products.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    const productIds = products.map(p => p._id);

    // Fetch counts in bulk
    const [favCounts, viewCounts] = await Promise.all([
      Favorite.aggregate([
        { $match: { productId: { $in: productIds } } },
        { $group: { _id: "$productId", count: { $sum: 1 } } }
      ]).catch(() => []),
      Interaction.aggregate([
        { $match: { targetId: { $in: productIds }, targetType: "PRODUCT", type: "VIEW" } },
        { $group: { _id: "$targetId", count: { $sum: 1 } } }
      ]).catch(() => [])
    ]);

    const favMap = new Map(favCounts.map(f => [f._id.toString(), f.count]));
    const viewMap = new Map(viewCounts.map(v => [v._id.toString(), v.count]));

    const enriched = products.map((p: any) => ({
      ...p,
      id: p._id.toString(),
      favCount: favMap.get(p._id.toString()) || 0,
      viewCount: viewMap.get(p._id.toString()) || 0,
      statut: p.statut || "ACTIVE",
    }));

    return NextResponse.json({ success: true, products: enriched });
  } catch (error) {
    console.error("Erreur [GET] /api/artisan/products:", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST: Création d'un service
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthArtisan();
    if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status });

    const { artisan } = ctx;
    const body = await request.json();
    let { titre, description, prix, categoryId, categoryName, images = [] } = body;

    await connectDB();

    if (!categoryId && categoryName) {
      let cat = await Category.findOne({ nom: { $regex: new RegExp(`^${categoryName}$`, "i") } });
      if (!cat) cat = await Category.create({ nom: categoryName, description: `Services de ${categoryName}` });
      categoryId = cat._id;
    }

    if (!titre || !prix || !categoryId) {
      return NextResponse.json({ success: false, message: "Champs obligatoires manquants" }, { status: 400 });
    }

    const created = await ProductService.create({
      artisanId: artisan._id,
      categoryId,
      titre,
      description: description || titre,
      prix,
      images,
      statut: "ACTIVE",
    });

    const product: any = await ProductService.findById(created._id).populate("categoryId").lean();

    return NextResponse.json({
      success: true,
      product: { ...product, id: product._id.toString(), favCount: 0, viewCount: 0, statut: "ACTIVE" }
    }, { status: 201 });
  } catch (error) {
    console.error("Erreur [POST] /api/artisan/products:", error);
    return NextResponse.json({ success: false, message: "Erreur lors de la création" }, { status: 500 });
  }
}

/**
 * PUT: Mise à jour d'un service (ou toggle statut)
 */
export async function PUT(request: NextRequest) {
  try {
    const ctx = await getAuthArtisan();
    if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status });

    const { artisan } = ctx;
    const body = await request.json();
    const id = body.id || body._id;

    if (!id) return NextResponse.json({ success: false, message: "ID du service manquant" }, { status: 400 });

    await connectDB();

    // Préparer les données à mettre à jour (uniquement celles fournies)
    const updateData: any = {};
    const fields = ["titre", "description", "prix", "categoryId", "images", "statut"];
    fields.forEach(f => {
      if (body[f] !== undefined) updateData[f] = body[f];
    });

    // Cas particulier : si categoryName est fourni mais pas categoryId
    if (!body.categoryId && body.categoryName) {
        let cat = await Category.findOne({ nom: { $regex: new RegExp(`^${body.categoryName}$`, "i") } });
        if (!cat) cat = await Category.create({ nom: body.categoryName, description: `Services de ${body.categoryName}` });
        updateData.categoryId = cat._id;
    }

    const updated: any = await ProductService.findOneAndUpdate(
      { _id: id, artisanId: artisan._id },
      { $set: updateData },
      { new: true }
    ).populate("categoryId").lean();

    if (!updated) return NextResponse.json({ success: false, message: "Service introuvable" }, { status: 404 });

    return NextResponse.json({
      success: true,
      product: { ...updated, id: updated._id.toString() }
    });
  } catch (error) {
    console.error("Erreur [PUT] /api/artisan/products:", error);
    return NextResponse.json({ success: false, message: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

/**
 * DELETE: Suppression d'un service
 */
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getAuthArtisan();
    if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status });

    const { artisan } = ctx;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, message: "ID manquant" }, { status: 400 });

    await connectDB();

    const deleted = await ProductService.findOneAndDelete({
      _id: id,
      artisanId: artisan._id,
    }).lean();

    if (!deleted) return NextResponse.json({ success: false, message: "Service introuvable" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur [DELETE] /api/artisan/products:", error);
    return NextResponse.json({ success: false, message: "Erreur lors de la suppression" }, { status: 500 });
  }
}
