import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ArtisanProfile from "@/models/ArtisanProfile";
import ProductService from "@/models/ProductService";
import Favorite from "@/models/Favorite";
import Review from "@/models/Review";
import Interaction from "@/models/Interaction";
import Message from "@/models/Message";

async function getAuthUser() {
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
  return user;
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Non authentifié ou rôle invalide" },
        { status: 401 }
      );
    }

    const artisan = await ArtisanProfile.findOne({ userId: user._id }).lean();
    if (!artisan) {
      return NextResponse.json(
        { success: false, message: "Profil artisan introuvable" },
        { status: 404 }
      );
    }

    const [products, totalProfileViews, favoritesOnArtisan, favoritesOnProducts, reviewsAgg, unreadMessages] =
      await Promise.all([
        ProductService.find({ artisanId: artisan._id }).select("_id").lean(),
        Interaction.countDocuments({
          targetId: artisan._id,
          targetType: "ARTISAN",
          type: "VIEW",
        }),
        Favorite.countDocuments({ artisanId: artisan._id }),
        Favorite.countDocuments({
          productId: { $in: products.map((p) => p._id) },
        }),
        Review.aggregate([
          { $match: { artisanId: artisan._id } },
          {
            $group: {
              _id: null,
              avg: { $avg: "$note" },
              count: { $sum: 1 },
            },
          },
        ]),
        Message.countDocuments({
          receiverId: user._id,
          lu: false,
        }),
      ]);

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
    ]);

    const visitsPerDay = [];
    let weekViews = 0;
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = day.toISOString().slice(0, 10);
      const entry = weeklyInteractions.find((w) => w._id === key);
      const value = entry?.count ?? 0;
      visitsPerDay.push(value);
      weekViews += value;
    }

    const stats = {
      profileViews: totalProfileViews,
      totalFavs: favoritesOnArtisan + favoritesOnProducts,
      weekViews,
      visitsPerDay,
      reviewCount,
      unreadMessages,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Erreur /api/artisan/stats:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors du chargement des statistiques" },
      { status: 500 }
    );
  }
}

