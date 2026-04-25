import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ProductService from "@/models/ProductService";
import Category from "@/models/Category";
import { normalizeQuery } from "@/lib/search-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    await connectDB();

    const normalized = normalizeQuery(q);

    // Search in Categories
    const categories = await Category.find({
      nom: { $regex: normalized, $options: "i" }
    })
    .limit(3)
    .select("nom")
    .lean();

    // Search in Product Titles
    const products = await ProductService.find({
      titre: { $regex: normalized, $options: "i" },
      statut: "ACTIVE"
    })
    .limit(5)
    .select("titre")
    .lean();

    const suggestions = [
      ...categories.map((c: any) => ({ type: "category", text: c.nom })),
      ...products.map((p: any) => ({ type: "product", text: p.titre }))
    ].slice(0, 5);

    return NextResponse.json({
      success: true,
      suggestions,
      normalized: normalized !== q.toLowerCase().trim() ? normalized : null
    });

  } catch (error) {
    console.error("Erreur /api/suggestions:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors du chargement des suggestions" },
      { status: 500 }
    );
  }
}
