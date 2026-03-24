import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { connectDB } from "@/lib/mongodb";
import ProductService from "@/models/ProductService";
import ArtisanProfile from "@/models/ArtisanProfile";
import Category from "@/models/Category";

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    
    const query = {};
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const products = await ProductService.find(query)
      .populate("categoryId")
      .populate("artisanId")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formatted = products.map(p => ({
      id: p._id.toString(),
      title: p.titre || "Sans titre",
      description: p.description || "",
      price: p.prix || 0,
      city: p.artisanId?.ville || "Maroc",
      imageUrl: (p.images && p.images.length > 0) ? p.images[0] : "/assets/media/listing-img/popularity-img-1.webp",
      categoryId: p.categoryId?._id?.toString() || "autre",
      categoryName: p.categoryId?.nom || "Autre"
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
