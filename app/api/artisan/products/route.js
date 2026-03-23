import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ArtisanProfile from "@/models/ArtisanProfile";
import ProductService from "@/models/ProductService";
import Favorite from "@/models/Favorite";
import Interaction from "@/models/Interaction";
import Category from "@/models/Category"; // Import explicite en haut

async function getAuthArtisan() {
  try {
    await connectDB();
    
    // 1. Essayer NextAuth Session
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;
    
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

    let artisan = await ArtisanProfile.findOne({ userId: user._id }).lean();
    
    if (!artisan) {
      console.log(`Auto-creating ArtisanProfile for user ${user._id}`);
      
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

export async function GET() {
  try {
    const ctx = await getAuthArtisan();
    if (ctx.error) {
      return NextResponse.json(
        { success: false, message: ctx.error },
        { status: ctx.status }
      );
    }

    const { artisan } = ctx;
    await connectDB();

    const products = await ProductService.find({ artisanId: artisan._id })
      .populate("categoryId")
      .sort({ createdAt: -1 })
      .lean();

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: true,
        products: [],
      });
    }

    const enriched = await Promise.all(
      products.map(async (p) => {
        try {
          const [favCount, viewCount] = await Promise.all([
            Favorite.countDocuments({ productId: p._id }).catch(() => 0),
            Interaction.countDocuments({
              targetId: p._id,
              targetType: "PRODUCT",
              type: "VIEW",
            }).catch(() => 0),
          ]);

          return {
            ...p,
            id: p._id.toString(), // Assurer que l'id est une string
            favCount: favCount || 0,
            viewCount: viewCount || 0,
            statut: p.statut || "ACTIVE",
          };
        } catch (err) {
          return {
            ...p,
            id: p._id.toString(),
            favCount: 0,
            viewCount: 0,
            statut: p.statut || "ACTIVE",
          };
        }
      })
    );

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
    if (ctx.error) {
      return NextResponse.json(
        { success: false, message: ctx.error },
        { status: ctx.status }
      );
    }

    const { artisan } = ctx;
    const body = await request.json();

    let { titre, description, prix, categoryId, categoryName, images = [] } = body;

    if (!categoryId && categoryName) {
      let cat = await Category.findOne({ nom: { $regex: new RegExp(`^${categoryName}$`, "i") } });
      if (!cat) {
        cat = await Category.create({ 
          nom: categoryName, 
          description: `Services de ${categoryName}` 
        });
      }
      categoryId = cat._id;
    }

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
      description: description || titre,
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
          id: product._id.toString(),
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
