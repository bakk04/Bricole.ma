import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token manquant." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Token invalide ou expiré." },
        { status: 400 }
      );
    }

    // Activer l'utilisateur
    user.isVerified = true;
    user.status = "ACTIVE";
    user.verificationToken = undefined; // On supprime le token après usage
    await user.save();

    return NextResponse.json(
      { success: true, message: "Compte vérifié avec succès." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la vérification." },
      { status: 500 }
    );
  }
}
