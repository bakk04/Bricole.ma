import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Annonce from "@/models/Annonce";

export const dynamic = "force-dynamic";

async function getAuthAdmin() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;

    if (!userId) {
      const cookieStore = await cookies();
      const headerStore = await headers();
      const authCookie = cookieStore.get("auth_token");
      const authHeader = headerStore.get("authorization");
      const token = authCookie?.value || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
          userId = decoded.userId;
        } catch (err) {}
      }
    }

    if (!userId) return { error: "Non authentifié", status: 401 };

    const user = await User.findById(userId).lean();
    if (!user || user.role !== "ADMIN") {
      return { error: "Accès réservé aux administrateurs", status: 403 };
    }

    return { user };
  } catch (err) {
    return { error: "Erreur d'authentification", status: 500 };
  }
}

// Need User for the lean() or populated fields, let's import it correctly
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const ctx = await getAuthAdmin();
    if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const statut = searchParams.get("statut") || "";

    await connectDB();

    const query: any = {};
    if (search) {
      query.$or = [
        { titre: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { ville: { $regex: search, $options: "i" } },
      ];
    }
    if (statut) {
      query.statut = statut;
    }

    const [annonces, total] = await Promise.all([
      Annonce.find(query)
        .populate("clientId", "name email prenom nom")
        .populate("categoryId", "nom")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Annonce.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      annonces,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    try {
        const ctx = await getAuthAdmin();
        if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ success: false, message: "ID annonce requis" }, { status: 400 });

        await connectDB();
        const deleted = await Annonce.findByIdAndDelete(id);

        if (!deleted) return NextResponse.json({ success: false, message: "Annonce non trouvée" }, { status: 404 });

        return NextResponse.json({ success: true, message: "Annonce supprimée" });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
