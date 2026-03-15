import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import redis from "@/lib/redis";

export async function GET() {
  try {
    await connectDB();

    // Essaie d'abord de lire depuis le cache
    const cached = await redis.get("categories:all");
    if (cached) {
      return NextResponse.json({
        success: true,
        categories: JSON.parse(cached),
      });
    }

    const categories = await Category.find({}).sort({ nom: 1 }).lean();

    await redis.set(
      "categories:all",
      JSON.stringify(categories),
      "EX",
      60 * 10 // 10 minutes
    );

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Erreur /api/categories:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors du chargement des catégories" },
      { status: 500 }
    );
  }
}

