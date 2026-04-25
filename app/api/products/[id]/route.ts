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
        // On essaie d'abord par _id (si artisanId est une ref vers le profil)
        // Puis par userId (au cas où la donnée serait stockée avec l'ID user)
        let artisan: any = await ArtisanProfile.findById(product.artisanId)
            .populate("userId", "name profileImage email")
            .populate("metierId", "nom")
            .lean();

        if (!artisan) {
            artisan = await ArtisanProfile.findOne({ userId: product.artisanId })
                .populate("userId", "name profileImage email")
                .populate("metierId", "nom")
                .lean();
        }

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
                userId: artisan.userId?._id?.toString(),
                // Fallback en cascade pour le nom
                name: artisan.nomComplet || artisan.userId?.name || "Artisan Expert",
                image: artisan.photoProfil || artisan.userId?.profileImage,
                rating: artisan.rating || artisan.noteMoyenne || 4.5,
                bio: artisan.description || artisan.bio,
                speciality: artisan.speciality || artisan.metierId?.nom || "Artisan",
                city: artisan.ville || "Maroc",
                experience: artisan.experience,
                isVerified: artisan.estVerifie || false,
                phone: artisan.telephone
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
