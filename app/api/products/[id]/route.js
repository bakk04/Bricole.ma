import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/mongodb";
import ProductService from "@/models/ProductService";
import ArtisanProfile from "@/models/ArtisanProfile";
import Review from "@/models/Review";

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        // 1. Récupérer le service
        const product = await ProductService.findById(id).lean();
        if (!product) {
            return NextResponse.json({ success: false, message: "Service introuvable" }, { status: 404 });
        }

        // 2. Récupérer le profil de l'artisan
        const artisan = await ArtisanProfile.findOne({ userId: product.artisanId })
            .populate("userId", "name profileImage email")
            .lean();

        // 3. Récupérer les avis (reviews)
        const reviews = await Review.find({ artisanId: artisan?._id })
            .populate("clientId", "name profileImage")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // 4. Recommandations (autres services de la même catégorie)
        const recommendations = await ProductService.find({ 
            categoryId: product.categoryId, 
            _id: { $ne: id } 
        }).limit(4).lean();

        return NextResponse.json({
            success: true,
            product: {
                ...product,
                id: product._id.toString(),
            },
            artisan: artisan ? {
                id: artisan._id.toString(),
                name: artisan.userId?.name,
                image: artisan.userId?.profileImage,
                rating: artisan.rating || 4.5,
                bio: artisan.bio,
                speciality: artisan.speciality,
                city: artisan.ville,
                experience: artisan.experience
            } : null,
            reviews: reviews.map(r => ({
                id: r._id.toString(),
                client: r.clientId?.name,
                image: r.clientId?.profileImage,
                note: r.note,
                commentaire: r.commentaire,
                date: r.createdAt
            })),
            recommendations: recommendations.map(r => ({
                id: r._id.toString(),
                title: r.title,
                price: r.price,
                imageUrl: r.imageUrl,
                city: r.city
            }))
        });

    } catch (error) {
        console.error("Erreur detail produit:", error);
        return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
    }
}
