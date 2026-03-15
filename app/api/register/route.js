import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    const {
      prenom,
      nom,
      nomEntreprise,
      email,
      telephone,
      ville,
      password,
      role,
      artisanType,
      domaine,
    } = data;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email et mot de passe sont requis.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Vérifier si l'utilisateur existe déjà avec le modèle Mongoose
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Cet email est déjà utilisé.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur avec le modèle Mongoose
    const newUser = await User.create({
      prenom,
      nom,
      name: `${prenom || ""} ${nom || ""}`.trim() || email.split('@')[0],
      nomEntreprise,
      email: normalizedEmail,
      telephone,
      ville,
      password: hashedPassword,
      role: role || "CLIENT",
      artisanType,
      domaine,
      status: "ACTIVE", // On le met ACTIVE par défaut pour le test
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser._id,
          prenom: newUser.prenom,
          nom: newUser.nom,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur /api/register:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la création du compte.",
        error: error.message
      },
      { status: 500 }
    );
  }
}
