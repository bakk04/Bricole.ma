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
            .populate("clientId", "name prenom email profileImage telephone")
            .populate("productId", "titre images")
            .populate({
                path: "artisanId",
                populate: { path: "userId", select: "name profileImage email" }
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
        }

        return NextResponse.json({ success: true, missionId: mission._id });
    } catch (error) {
        console.error("POST Mission Error:", error);
        return NextResponse.json({ error: "Erreur lors de la réservation." }, { status: 500 });
    }
}

// Update mission status (PATCH)
export async function PATCH(req: NextRequest) {
    try {
        const user = await getSessionUser();
        if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

        const { missionId, statut } = await req.json();
        if (!missionId || !statut) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        await connectDB();

        // Trouver la mission et vérifier les droits
        const mission = await Mission.findById(missionId).populate("clientId").populate("artisanId");
        if (!mission) {
            return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });
        }

        // Seul l'artisan peut changer le statut (ou le client pour annuler)
        // Pour simplifier ici, on vérifie si l'artisan est bien celui connecté
        const artisanProfile = await ArtisanProfile.findOne({ userId: user.id });
        
        const isArtisan = artisanProfile && mission.artisanId._id.toString() === artisanProfile._id.toString();
        const isClient = mission.clientId._id.toString() === user.id;

        if (!isArtisan && !isClient) {
            return NextResponse.json({ error: "Action non autorisée" }, { status: 403 });
        }

        mission.statut = statut;
        await mission.save();

        // ── Envoyer un email de notification au client ──
        if (isArtisan) {
            try {
                const clientEmail = (mission.clientId as any).email;
                const statusLabel = statut === "ACCEPTED" ? "acceptée ✅" : statut === "REJECTED" ? "refusée ❌" : statut;
                
                await sendEmail({
                    to: clientEmail,
                    subject: `Votre mission a été ${statusLabel}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #1478f1;">Mise à jour de votre mission</h2>
                            <p>Bonjour,</p>
                            <p>L'artisan a ${statusLabel} votre demande pour : <strong>${mission.titre}</strong>.</p>
                            <p>Vous pouvez consulter les détails dans votre espace client.</p>
                            <a href="${process.env.NEXTAUTH_URL}/explore" style="display: inline-block; padding: 12px 25px; background: #1478f1; color: #fff; text-decoration: none; border-radius: 50px; font-weight: bold;">Retour sur Bricole.ma</a>
                        </div>
                    `
                });
            } catch (err) {
                console.error("Client notification email failed:", err);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PATCH Mission Error:", error);
        return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 500 });
    }
}

// Delete mission (DELETE)
export async function DELETE(req: NextRequest) {
    try {
        const user = await getSessionUser();
        if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const missionId = searchParams.get("id");

        if (!missionId) {
            return NextResponse.json({ error: "ID manquant" }, { status: 400 });
        }

        await connectDB();
        
        // Supprimer la mission (ou passer en statut DELETED)
        await Mission.findByIdAndDelete(missionId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE Mission Error:", error);
        return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 });
    }
}
