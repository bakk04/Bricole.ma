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
import Review from "@/models/Review";
import Interaction from "@/models/Interaction";
import Message from "@/models/Message";
import Category from "@/models/Category";

async function getAuthUser() {
  try {
    await connectDB();

    // 1. NextAuth
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    // 2. JWT Custom
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
    if (!user || user.role !== "ARTISAN") {
      return { error: "Accès réservé aux artisans", status: 403 };
    }

    return { user };
  } catch (err) {
    console.error("getAuthUser stats error:", err);
    return { error: "Erreur d'authentification interne", status: 500 };
  }
}

export async function GET() {
  try {
    const ctx = await getAuthUser();
    if (ctx.error) {
      return NextResponse.json(
        { success: false, message: ctx.error },
        { status: ctx.status }
      );
    }

    const { user } = ctx;
    await connectDB();

    let artisan = await ArtisanProfile.findOne({ userId: user._id }).lean();
    
    // Auto-création si manquant (pour éviter le 404/500)
    if (!artisan) {
      console.log(`Auto-creating ArtisanProfile for stats, user ${user._id}`);
      let defaultCategory = await Category.findOne();
      if (!defaultCategory) {
        defaultCategory = await Category.create({ nom: "Général", description: "Default" });
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

    const [products, totalProfileViews, favoritesOnArtisan, favoritesOnProducts, reviewsAgg, unreadMessages] =
      await Promise.all([
        ProductService.find({ artisanId: artisan._id }).select("_id").lean().catch(() => []),
        Interaction.countDocuments({
          targetId: artisan._id,
          targetType: "ARTISAN",
          type: "VIEW",
        }).catch(() => 0),
        Favorite.countDocuments({ artisanId: artisan._id }).catch(() => 0),
        Favorite.countDocuments({
          productId: { $in: [] }, // Par défaut vide
        }).catch(() => 0),
        Review.aggregate([
          { $match: { artisanId: artisan._id } },
          {
            $group: {
              _id: null,
              avg: { $avg: "$note" },
              count: { $sum: 1 },
            },
          },
        ]).catch(() => []),
        Message.countDocuments({
          receiverId: user._id,
          lu: false,
        }).catch(() => 0),
      ]);

    // Re-calculer favoritesOnProducts avec les vrais IDs
    let actualFavsOnProducts = 0;
    if (products && products.length > 0) {
      actualFavsOnProducts = await Favorite.countDocuments({
        productId: { $in: products.map((p) => p._id) },
      }).catch(() => 0);
    }

    const reviewCount = reviewsAgg[0]?.count ?? 0;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyInteractions = await Interaction.aggregate([
      {
        $match: {
          targetId: artisan._id,
          targetType: "ARTISAN",
          type: "VIEW",
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]).catch(() => []);

    const visitsPerDay = [];
    let weekViews = 0;
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = day.toISOString().slice(0, 10);
      const entry = (weeklyInteractions || []).find((w) => w._id === key);
      const value = entry?.count ?? 0;
      visitsPerDay.push(value);
      weekViews += value;
    }

    const stats = {
      profileViews: totalProfileViews,
      totalFavs: favoritesOnArtisan + actualFavsOnProducts,
      weekViews,
      visitsPerDay,
      reviewCount,
      unreadMessages,
    };

    // Get last 5 interactions for activity feed
    const recentInteractions = await Interaction.find({
        $or: [
          { targetId: artisan._id, targetType: "ARTISAN" },
          { targetId: { $in: products.map(p => p._id) }, targetType: "PRODUCT" }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .catch(() => []);

    const activities = recentInteractions.map(inter => {
        let title = "Activité";
        let desc = "Une interaction a eu lieu";
        let type = inter.type; // VIEW, CLICK, FAVORITE, CONTACT
        
        if (type === "VIEW") {
            title = inter.targetType === "ARTISAN" ? "Profil consulté" : "Service consulté";
            desc = "Un client a visité votre profil ou service";
        } else if (type === "FAVORITE") {
            title = "Nouveau favori";
            desc = "Votre profil ou l'un de vos services a été ajouté aux favoris";
        } else if (type === "CONTACT") {
            title = "Tentative de contact";
            desc = "Un client a cliqué sur vos coordonnées";
        }

        return {
            title,
            desc,
            type,
            time: inter.createdAt
        };
    });

    return NextResponse.json({
      success: true,
      stats,
      activities
    });
  } catch (error) {
    console.error("Erreur /api/artisan/stats:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors du chargement des statistiques" },
      { status: 500 }
    );
  }
}
