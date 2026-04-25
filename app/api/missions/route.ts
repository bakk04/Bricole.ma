import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Mission from "@/models/Mission";
import ArtisanProfile from "@/models/ArtisanProfile";
import ProductService from "@/models/ProductService";
import User from "@/models/User";
import { getSessionUser } from "@/lib/session";
import { sendEmail } from "@/lib/nodemailer";

export const dynamic = "force-dynamic";

// Get user missions (as client or artisan)
export async function GET() {
    try {
        const user = await getSessionUser();
        if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

        await connectDB();

        // Si l'utilisateur est un artisan, on cherche aussi les missions qui lui sont assignées
        const artisan = await ArtisanProfile.findOne({ userId: user.id });

        const query = artisan 
            ? { $or: [{ clientId: user.id }, { artisanId: artisan._id }] }
            : { clientId: user.id };

        const missions = await Mission.find(query)
            .populate("clientId", "name prenom email profileImage")
            .populate("productId", "titre images")
            .populate({
                path: "artisanId",
                populate: { path: "userId", select: "name profileImage" }
            })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, missions });
    } catch (error) {
        console.error("GET Missions Error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// Create a new mission (Booking)
export async function POST(req: NextRequest) {
    try {
        const user = await getSessionUser();
        if (!user) return NextResponse.json({ error: "Vous devez être connecté pour réserver." }, { status: 401 });

        const { productId, artisanId, titre, prix, message } = await req.json();

        if (!productId || !artisanId || !titre || !prix) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        await connectDB();

        const mission = await Mission.create({
            clientId: user.id,
            artisanId,
            productId,
            titre,
            prix,
            message,
            statut: "PENDING"
        });

        // ── Envoyer un email à l'artisan ──
        try {
            const artisanProfile = await ArtisanProfile.findById(artisanId).populate("userId");
            if (artisanProfile && artisanProfile.userId && (artisanProfile.userId as any).email) {
                const artisanEmail = (artisanProfile.userId as any).email;
                const clientName = user.email; // Faute de mieux si on n'a pas le nom complet ici

                await sendEmail({
                    to: artisanEmail,
                    subject: `Nouvelle demande de service : ${titre}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #1478f1;">Nouvelle mission sur Bricole.ma !</h2>
                            <p>Bonjour ${artisanProfile.nomComplet || 'Artisan'},</p>
                            <p>Vous avez reçu une nouvelle demande de réservation pour votre service <strong>${titre}</strong>.</p>
                            <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin: 20px 0;">
                                <p><strong>Prix proposé :</strong> ${prix} DH</p>
                                <p><strong>Message du client :</strong> ${message || 'Aucun message'}</p>
                            </div>
                            <p>Connectez-vous à votre tableau de bord pour accepter ou refuser cette mission.</p>
                            <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 12px 25px; background: #1478f1; color: #fff; text-decoration: none; border-radius: 50px; font-weight: bold;">Voir mon tableau de bord</a>
                        </div>
                    `
                });
            }
        } catch (emailErr) {
            console.error("Email notification failed:", emailErr);
            // On ne bloque pas la création de la mission si l'email échoue
        }

        return NextResponse.json({ success: true, missionId: mission._id });
    } catch (error) {
        console.error("POST Mission Error:", error);
        return NextResponse.json({ error: "Erreur lors de la réservation." }, { status: 500 });
    }
}
