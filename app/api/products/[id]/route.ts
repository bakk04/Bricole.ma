import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ProductService from "@/models/ProductService";
import ArtisanProfile from "@/models/ArtisanProfile";
import Review from "@/models/Review";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { id } = await params;

        // 1. Récupérer le service
        const product: any = await ProductService.findById(id).populate("categoryId", "nom").lean();
        if (!product) {
            return NextResponse.json({ success: false, message: "Service introuvable" }, { status: 404 });
        }

        // 2. Récupérer le profil de l'artisan
        const artisan: any = await ArtisanProfile.findOne({ userId: product.artisanId })
            .populate("userId", "name profileImage email")
            .lean();

        // 3. Récupérer les avis (reviews)
        const reviews: any[] = await Review.find({ artisanId: artisan?._id })
            .populate("clientId", "name profileImage")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // 4. Recommandations (autres services de la même catégorie)
        const recommendations: any[] = await ProductService.find({ 
            categoryId: product.categoryId, 
            _id: { $ne: id } 
        }).limit(4).lean();

        return NextResponse.json({
            success: true,
            product: {
                ...product,
                id: product._id.toString(),
                title: product.titre,
                price: product.prix,
                imageUrl: product.images?.[0] || null,
                categoryName: product.categoryId?.nom || "Service",
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
                title: r.titre,
                price: r.prix,
                imageUrl: r.images?.[0] || null,
                city: r.ville
            }))
        });

    } catch (error) {
        console.error("Erreur detail produit:", error);
        return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
    }
}
