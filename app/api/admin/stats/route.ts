import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
// IMPORT TOUS LES MODÈLES EN PREMIER POUR ÉVITER LES ERREURS DE POPULATION
import "@/models/User";
import "@/models/Category";
import "@/models/ArtisanProfile";
import "@/models/Annonce";
import "@/models/ProductService";

import User from "@/models/User";
import ArtisanProfile from "@/models/ArtisanProfile";
import Annonce from "@/models/Annonce";
import Category from "@/models/Category";
import ProductService from "@/models/ProductService";

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

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await User.findById(decoded.userId).lean();
      if (!user || user.role !== "ADMIN") {
        return { error: "Accès réservé aux administrateurs", status: 403 };
      }
      return { user };
    } catch (err) {
      return { error: "Session invalide", status: 401 };
    }
  } catch (err) {
    return { error: "Erreur d'authentification", status: 500 };
  }
}

export async function GET() {
  try {
    const ctx = await getAuthAdmin();
    if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status || 500 });

    await connectDB();

    // 1. Compteurs de base
    const [
      totalUsers,
      totalArtisans,
      totalAnnonces,
      totalProducts,
      newUsersLast30Days
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "ARTISAN" }),
      Annonce.countDocuments(),
      ProductService.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
    ]);

    // 2. Répartition des annonces (Missions clients)
    const annoncesByStatut = await Annonce.aggregate([
      { $group: { _id: "$statut", count: { $sum: 1 } } }
    ]);

    const annoncesStats = { OPEN: 0, IN_PROGRESS: 0, CLOSED: 0 };
    annoncesByStatut.forEach((item: any) => {
      if (item._id in annoncesStats) (annoncesStats as any)[item._id] = item.count;
    });

    // 3. Top Catégories (basé sur les services des artisans)
    const topCategoriesRaw = await ProductService.aggregate([
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const populatedTopCategories = await Promise.all(
        topCategoriesRaw.map(async (item) => {
            const cat = await Category.findById(item._id).lean();
            return { name: cat?.nom || "Non classé", count: item.count };
        })
    );

    // 4. Activité récente (Users + Annonces + Services)
    const [recentUsers, recentAnnonces, recentProducts] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(3).lean(),
      Annonce.find().populate({ path: "categoryId", model: Category }).sort({ createdAt: -1 }).limit(3).lean(),
      ProductService.find().populate({ path: "categoryId", model: Category }).sort({ createdAt: -1 }).limit(3).lean()
    ]);

    const recentActivity: any[] = [];
    recentUsers.forEach((u: any) => recentActivity.push({ type: "user", title: `${u.name || u.email} inscrit`, sub: `${u.role}`, createdAt: u.createdAt, status: u.status || "ACTIVE" }));
    recentAnnonces.forEach((a: any) => recentActivity.push({ type: "annonce", title: `Mission créée`, sub: `${a.titre}`, createdAt: a.createdAt, status: a.statut || "OPEN" }));
    recentProducts.forEach((p: any) => recentActivity.push({ type: "service", title: `Nouveau service`, sub: `${p.titre}`, createdAt: p.createdAt, status: "ACTIVE" }));
    recentActivity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 5. Trend Inscriptions
    const registrationsTrend = [];
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(); 
      dayDate.setDate(dayDate.getDate() - i); 
      const start = new Date(dayDate.setHours(0,0,0,0));
      const end = new Date(dayDate.setHours(23,59,59,999));
      const count = await User.countDocuments({ createdAt: { $gte: start, $lte: end } });
      registrationsTrend.push(count);
    }

    // 6. Top Artisans (Vérifiés avec meilleures notes)
    const topArtisansList = await ArtisanProfile.find({ estVerifie: true })
        .populate({ path: "metierId", model: Category })
        .sort({ noteMoyenne: -1 })
        .limit(4)
        .lean();

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalArtisans,
        totalAnnonces: totalAnnonces + totalProducts,
        newUsersLast30Days,
        annoncesStats,
        topCategories: populatedTopCategories,
        registrationsTrend,
        recentActivity: recentActivity.slice(0, 6),
        totalClients: totalUsers - totalArtisans,
        topArtisans: topArtisansList.map((art: any) => ({
            id: art._id.toString(),
            name: art.nomComplet,
            job: art.metierId?.nom || "Artisan",
            stars: art.noteMoyenne || 0
        }))
      }
    });
  } catch (error: any) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json({ success: false, message: "Erreur lors du calcul des statistiques" }, { status: 500 });
  }
}
