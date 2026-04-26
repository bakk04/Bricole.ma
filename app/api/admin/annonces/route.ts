import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Category from "@/models/Category";
import Annonce from "@/models/Annonce";
import ProductService from "@/models/ProductService";
import ArtisanProfile from "@/models/ArtisanProfile";

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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    await connectDB();

    const query: any = {};
    if (search) {
      query.$or = [
        { titre: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { ville: { $regex: search, $options: "i" } },
      ];
    }

    // 1. Récupérer les Annonces (Missions clients)
    const [clientAnnonces, totalAnnonces] = await Promise.all([
      Annonce.find(query)
        .populate({ path: "clientId", model: User, select: "name email" })
        .populate({ path: "categoryId", model: Category, select: "nom" })
        .sort({ createdAt: -1 })
        .lean(),
      Annonce.countDocuments(query)
    ]);

    // 2. Récupérer les Services (Annonces artisans)
    const [artisanServices, totalServices] = await Promise.all([
      ProductService.find(query)
        .populate({ path: "artisanId", model: ArtisanProfile, populate: { path: "userId", model: User, select: "name" } })
        .populate({ path: "categoryId", model: Category, select: "nom" })
        .sort({ createdAt: -1 })
        .lean(),
      ProductService.countDocuments(query)
    ]);

    // Combiner les deux types pour l'admin
    const combined = [
        ...clientAnnonces.map((a: any) => ({
            ...a,
            id: a._id.toString(),
            type: "MISSION",
            ownerName: a.clientId?.name || "Client",
            categoryName: a.categoryId?.nom || "Non classé"
        })),
        ...artisanServices.map((s: any) => ({
            ...s,
            id: s._id.toString(),
            type: "SERVICE",
            ownerName: s.artisanId?.nomComplet || s.artisanId?.userId?.name || "Artisan",
            categoryName: s.categoryId?.nom || "Non classé"
        }))
    ];

    // Tri global par date de création
    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination manuelle du tableau combiné
    const paginated = combined.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      annonces: paginated,
      pagination: {
        total: totalAnnonces + totalServices,
        page,
        limit,
        pages: Math.ceil((totalAnnonces + totalServices) / limit)
      }
    });
  } catch (error: any) {
    console.error("Annonces Admin API Error:", error);
    return NextResponse.json({ success: false, message: "Erreur lors du chargement des annonces" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    try {
        const ctx = await getAuthAdmin();
        if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status || 500 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const type = searchParams.get("type"); // MISSION or SERVICE

        if (!id) return NextResponse.json({ success: false, message: "ID requis" }, { status: 400 });

        await connectDB();
        
        if (type === "SERVICE") {
            await ProductService.findByIdAndDelete(id);
        } else {
            await Annonce.findByIdAndDelete(id);
        }

        return NextResponse.json({ success: true, message: "Supprimé avec succès" });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
