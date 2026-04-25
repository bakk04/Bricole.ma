import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Annonce from "@/models/Annonce";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");
        const ville = searchParams.get("ville");
        const search = searchParams.get("search");

        const query: any = {};

        if (categoryId) query.categoryId = categoryId;
        if (ville) query.ville = ville;
        if (search) {
            query.$text = { $search: search };
        }

        const annonces = await Annonce.find(query)
            .populate("categoryId")
            .populate("clientId")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const formatted = annonces.map((a: any) => ({
            id: a._id.toString(),
            title: a.titre,
            description: a.description,
            budget: a.budget,
            city: a.ville,
            imageUrl: a.images?.[0] || "/default.jpg",
            categoryId: a.categoryId?._id?.toString(),
            categoryName: a.categoryId?.nom || "Autre",
            statut: a.statut,
            createdAt: a.createdAt,
        }));

        return NextResponse.json({
            success: true,
            annonces: formatted
        });

    } catch (error) {
        console.error("Erreur /api/annonces:", error);

        return NextResponse.json(
            { success: false, message: "Erreur serveur" },
            { status: 500 }
        );
    }
}
