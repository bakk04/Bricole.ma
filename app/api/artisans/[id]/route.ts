import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ArtisanProfile from "@/models/ArtisanProfile";
import ProductService from "@/models/ProductService";
import Review from "@/models/Review";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Identifiant invalide" }, { status: 400 });
        }

        // 1. Récupérer le profil
        const artisan: any = await ArtisanProfile.findById(id)
            .populate("userId", "name profileImage email")
            .populate("metierId", "nom")
            .lean();

        if (!artisan) {
            return NextResponse.json({ success: false, message: "Artisan introuvable" }, { status: 404 });
        }

        // 2. Récupérer tous les services de cet artisan
        const products = await ProductService.find({ artisanId: id, statut: "ACTIVE" })
            .populate("categoryId", "nom")
            .sort({ createdAt: -1 })
            .lean();

        // 3. Récupérer les avis
        const reviews = await Review.find({ artisanId: id })
            .populate("clientId", "name profileImage")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            artisan: {
                id: artisan._id.toString(),
                name: artisan.nomComplet || artisan.userId?.name || "Artisan Expert",
                image: artisan.photoProfil || artisan.userId?.profileImage,
                city: artisan.ville || "Maroc",
                speciality: artisan.speciality || artisan.metierId?.nom || "Artisan",
                bio: artisan.description || artisan.bio || "Aucune description disponible.",
                rating: artisan.noteMoyenne || 4.5,
                isVerified: artisan.estVerifie || false,
                experience: artisan.experience || 0,
                phone: artisan.telephone,
                createdAt: artisan.createdAt
            },
            products: products.map(p => ({
                id: p._id.toString(),
                title: p.titre,
                price: p.prix,
                imageUrl: p.images?.[0] || null,
                categoryName: p.categoryId?.nom || "Service",
            })),
            reviews: reviews.map(r => ({
                id: r._id.toString(),
                client: r.clientId?.name,
                image: r.clientId?.profileImage,
                note: r.note,
                commentaire: r.commentaire,
                date: r.createdAt
            }))
        });

    } catch (error) {
        console.error("Erreur public artisan profile:", error);
        return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
    }
}
