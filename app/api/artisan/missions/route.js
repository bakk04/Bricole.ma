import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Annonce from "@/models/Annonce";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Non authentifié" }, { status: 401 });
    }

    const user = await User.findById(session.user.id).lean();
    if (!user || user.role !== "ARTISAN") {
      return NextResponse.json({ success: false, message: "Accès réservé aux artisans" }, { status: 403 });
    }

    // On récupère les annonces ouvertes
    // On pourrait filtrer par la ville ou la catégorie de l'artisan plus tard
    const missions = await Annonce.find({ statut: "OPEN" })
      .populate("categoryId", "nom")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      success: true,
      missions: missions.map(m => ({
        id: m._id,
        titre: m.titre,
        description: m.description,
        ville: m.ville,
        budget: m.budget,
        cat: m.categoryId?.nom || "Général",
        createdAt: m.createdAt,
        images: m.images
      }))
    });
  } catch (error) {
    console.error("Error fetching missions:", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
