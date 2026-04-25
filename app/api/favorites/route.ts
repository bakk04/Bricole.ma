import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Favorite from "@/models/Favorite";
import { getSessionUser } from "@/lib/session";
import "@/models/ProductService";
import "@/models/User";
import "@/models/ArtisanProfile";

export const dynamic = "force-dynamic";

// Get all favorites for the current user
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await connectDB();
    const favorites = await Favorite.find({ clientId: user.id })
      .populate({
        path: "productId",
        model: "ProductService"
      })
      .populate({
        path: "artisanId",
        model: "ArtisanProfile"
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, favorites });
  } catch (error) {
    console.error("Erreur GET /api/favorites:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Toggle a favorite
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { productId, artisanId } = await req.json();

    if (!productId && !artisanId) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    await connectDB();

    const query: any = { clientId: user.id };
    if (productId) query.productId = productId;
    if (artisanId) query.artisanId = artisanId;

    const existing = await Favorite.findOne(query);

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return NextResponse.json({ success: true, action: "removed" });
    } else {
      await Favorite.create({
        clientId: user.id,
        productId: productId || undefined,
        artisanId: artisanId || undefined
      });
      return NextResponse.json({ success: true, action: "added" });
    }
  } catch (error) {
    console.error("Erreur POST /api/favorites:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
