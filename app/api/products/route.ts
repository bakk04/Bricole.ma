import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ProductService from "@/models/ProductService";
import "@/models/Category"; // Nécessaire pour le populate
import "@/models/ArtisanProfile"; // Nécessaire pour le populate

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const query: any = {};
    if (categoryId && categoryId !== "all") {
      query.categoryId = categoryId;
    }

    // Récupérer les 10 derniers services de manière optimisée
    const products = await ProductService.find(query)
        .populate({
          path: "categoryId",
          select: "nom slug"
        })
        .populate({
          path: "artisanId",
          select: "ville estVerifie nomComplet"
        })
        .sort({ createdAt: -1 })
        .limit(12) // Augmenter légèrement pour une meilleure grille
        .select("-description") // Exclure la description pour alléger le JSON (non utilisée dans la grille)
        .lean();

    const formatted = products.map((p: any) => ({
      id: p._id.toString(),
      title: p.titre || "Sans titre",
      description: p.description || "",
      price: p.prix || 0,
      city: p.artisanId?.ville || "Maroc",
      // Utilisation de la première image (base64 ou URL)
      imageUrl: p.images?.[0] || "/images/default-service.jpg",
      categoryId: p.categoryId?._id?.toString() || "autre",
      categoryName: p.categoryId?.nom || "Autre",
      isVerified: p.artisanId?.estVerifie || false,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({
      success: true,
      products: formatted
    });

  } catch (error) {
    console.error("Erreur /api/products:", error);
    return NextResponse.json(
        { success: false, message: "Erreur lors du chargement des services" },
        { status: 500 }
    );
  }
}
