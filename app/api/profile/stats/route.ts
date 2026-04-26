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

    const [requestsCount, completedCount, favoritesCount] = await Promise.all([
      Mission.countDocuments({ clientId: user.id }),
      Mission.countDocuments({ clientId: user.id, statut: "ACCEPTED" }),
      Favorite.countDocuments({ clientId: user.id }) // Correction ici : clientId au lieu de userId
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        requests: requestsCount,
        favorites: favoritesCount,
        completed: completedCount,
        avgRating: 0
      }
    });
  } catch (error) {
    console.error("GET Profile Stats Error:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
