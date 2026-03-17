import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { resend } from "@/lib/resend";
import crypto from "crypto";

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
    const verificationToken = crypto.randomBytes(32).toString("hex");

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
      status: "PENDING",
      isVerified: false,
      verificationToken,
    });

    // Envoi de l'email de vérification
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify?token=${verificationToken}`;

    const isProduction = process.env.NODE_ENV === "production";
    const devRecipientOverride = process.env.RESEND_DEV_EMAIL;
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || "Bricole.ma <onboarding@resend.dev>";

    // En local / dev, on peut rediriger tous les emails vers une adresse de test
    // (par exemple votre propre adresse) pour respecter les limitations de Resend.
    const recipientEmail =
      !isProduction && devRecipientOverride
        ? devRecipientOverride
        : normalizedEmail;

    const isTestModeRecipient = recipientEmail !== normalizedEmail;

    console.log(
      "[Register] Préparation de l'email de vérification:",
      JSON.stringify(
        {
          to: recipientEmail,
          forUser: normalizedEmail,
          env: isProduction ? "production" : "development",
          override: isTestModeRecipient,
        },
        null,
        2
      )
    );

    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: fromAddress,
        to: recipientEmail,
        subject: "Activez votre compte Bricole.ma",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f1f5f9;">
              <h1 style="color: #3b82f6; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.025em;">bricole<span style="color: #0f172a;">.ma</span></h1>
            </div>
            
            <div style="padding: 10px 0;">
              <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 16px; text-align: center;">Bienvenue sur Bricole.ma !</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Bonjour <strong>${prenom}</strong>, merci de rejoindre la plus grande communauté d'artisans au Maroc. Votre compte a été créé avec succès, mais il doit être activé pour être opérationnel.
              </p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${verificationUrl}" style="background-color: #3b82f6; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.2);">
                  Vérifier mon adresse e-mail
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; margin-bottom: 24px; text-align: center;">
                Ce lien est valable pendant 24 heures.
              </p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #f1f5f9; margin-top: 20px;">
              <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.5;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
                <span style="color: #3b82f6; word-break: break-all;">${verificationUrl}</span>
              </p>
            </div>
            
            <div style="margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #f1f5f9;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                &copy; ${new Date().getFullYear()} Bricole.ma. Tous droits réservés.
              </p>
              <p style="color: #cbd5e1; font-size: 11px; margin-top: 8px;">
                Ceci est un message automatique, merci de ne pas y répondre.
              </p>
            </div>
          </div>
        `
      });

      if (emailError) {
        // Erreur côté API Resend
        if (emailError.statusCode === 403) {
          // Cas typique : environnement de test sans domaine vérifié
          console.warn(
            "[Register] Limitation Resend (403 - mode test / domaine non vérifié).",
            {
              to: recipientEmail,
              forUser: normalizedEmail,
            }
          );
        } else {
          console.error("[Register] Erreur API Resend:", emailError);
        }
      } else if (emailData) {
        console.log(
          "[Register] Email de vérification envoyé avec succès:",
          {
            id: emailData.id,
            to: recipientEmail,
            forUser: normalizedEmail,
            testOverride: isTestModeRecipient,
          }
        );
      }
    } catch (err) {
      console.error("[Register] Exception lors de l'envoi de l'email:", err);
    }

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
