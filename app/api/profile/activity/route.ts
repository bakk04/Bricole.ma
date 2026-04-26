import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Mission from "@/models/Mission";
import Favorite from "@/models/Favorite";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    await connectDB();

    // Récupérer les missions récentes et les favoris récents
    const [missions, favorites] = await Promise.all([
      Mission.find({ clientId: user.id }).sort({ createdAt: -1 }).limit(10).lean(),
      Favorite.find({ userId: user.id }).populate("productId").sort({ createdAt: -1 }).limit(10).lean()
    ]);

    // Transformer en un format d'activité unifié
    const activities: any[] = [];

    missions.forEach((m: any) => {
      activities.push({
        id: m._id.toString(),
        type: "booking",
        title: `Réservation : ${m.titre}`,
        description: `Statut : ${m.statut}`,
        createdAt: m.createdAt,
      });
    });

    favorites.forEach((f: any) => {
        if (f.productId) {
            activities.push({
                id: f._id.toString(),
                type: "favorite_added",
                title: "Service ajouté aux favoris",
                description: f.productId.titre || "Service",
                createdAt: f.createdAt,
            });
        }
    });

    // Trier par date décroissante
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      activities: activities.slice(0, 15)
    });
  } catch (error) {
    console.error("GET Profile Activity Error:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
