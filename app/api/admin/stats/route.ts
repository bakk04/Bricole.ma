import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ArtisanProfile from "@/models/ArtisanProfile";
import Annonce from "@/models/Annonce";
import Category from "@/models/Category";

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

export async function GET() {
  try {
    const ctx = await getAuthAdmin();
    if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status });

    await connectDB();

    const [
      totalUsers,
      totalArtisans,
      totalClients,
      totalAnnonces,
      newUsersLast30Days,
      annoncesByStatut,
      topCategories
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "ARTISAN" }),
      User.countDocuments({ role: "CLIENT" }),
      Annonce.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      Annonce.aggregate([
        { $group: { _id: "$statut", count: { $sum: 1 } } }
      ]),
      Annonce.aggregate([
        { $group: { _id: "$categoryId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "categories", // Collection Mongoose par défaut est minuscule pluralisée
            localField: "_id",
            foreignField: "_id",
            as: "category"
          }
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ["$category.nom", "Non classé"] }, count: 1 } }
      ])
    ]);

    // Format annoncesByStatut
    const annoncesStats = {
      OPEN: 0,
      IN_PROGRESS: 0,
      CLOSED: 0
    };
    annoncesByStatut.forEach((item: any) => {
      if (item._id in annoncesStats) {
        (annoncesStats as any)[item._id] = item.count;
      }
    });

    // Generate recent registration trend (last 7 days)
    const registrationsTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const count = await User.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      registrationsTrend.push(count);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalArtisans,
        totalClients,
        totalAnnonces,
        newUsersLast30Days,
        annoncesStats,
        topCategories,
        registrationsTrend
      }
    });
  } catch (error: any) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
