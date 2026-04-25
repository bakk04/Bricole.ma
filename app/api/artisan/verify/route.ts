import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ArtisanProfile from "@/models/ArtisanProfile";
import tesseract from "node-tesseract-ocr";

export const dynamic = "force-dynamic";

async function getAuthUser() {
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
      } catch (err) {
        console.error("JWT Error:", err);
      }
    }
  }

  if (!userId) return { error: "Non authentifié", status: 401 };
  const user = await User.findById(userId).lean();
  if (!user || user.role !== "ARTISAN") return { error: "Accès réservé aux artisans", status: 403 };
  return { user };
}

export async function POST(req: Request) {
  try {
    const ctx = await getAuthUser();
    if (ctx.error) return NextResponse.json({ success: false, message: ctx.error }, { status: ctx.status });

    const formData = await req.formData();
    const recto = formData.get("recto") as File;
    const verso = formData.get("verso") as File;

    if (!recto || !verso) {
      return NextResponse.json({ success: false, message: "Les deux faces de la CIN sont requises" }, { status: 400 });
    }

    // Convert file to Buffer for Tesseract
    const arrayBuffer = await recto.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // OCR with Native Tesseract
    console.log("Starting OCR analysis (Native)...");
    
    const config = {
      lang: "eng",
      oem: 1,
      psm: 3,
    };

    const text = await tesseract.recognize(buffer, config);

    console.log("OCR Extracted Text:", text);

    // Regex for Moroccan CIN: 1-2 letters + 4-6 digits
    // Example: AB123456, C123456, BK9876
    const cinRegex = /([A-Z]{1,2}[0-9]{4,6})/i;
    const match = text.match(cinRegex);

    if (!match) {
      return NextResponse.json({ 
        success: false, 
        message: "Impossible d'extraire le numéro de CIN. Veuillez assurer que la photo est nette." 
      }, { status: 422 });
    }

    const cinNumber = match[0].toUpperCase();

    // Update profile
    const profile = await ArtisanProfile.findOneAndUpdate(
      { userId: ctx.user._id },
      { 
        estVerifie: true,
        $set: { "verificationMetadata.cin": cinNumber, "verificationMetadata.verifiedAt": new Date() } 
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Vérification réussie !",
      cin: cinNumber,
      profile
    });

  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, message: "Erreur lors du traitement de la vérification" }, { status: 500 });
  }
}
