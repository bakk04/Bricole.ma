import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Proposition from "@/models/Proposition";
import Annonce from "@/models/Annonce";

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

    // On récupère les propositions de l'artisan
    const propositions = await Proposition.find({ artisanId: user._id })
      .populate("annonceId", "titre ville statut")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      propositions: propositions.map(p => ({
        id: p._id,
        annonceTitre: p.annonceId?.titre || "Mission supprimée",
        ville: p.annonceId?.ville,
        statutAnnonce: p.annonceId?.statut,
        message: p.message,
        prixPropose: p.prixPropose,
        statut: p.statut, // PENDING, ACCEPTED, REJECTED
        createdAt: p.createdAt
      }))
    });
  } catch (error) {
    console.error("Error fetching propositions:", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
