import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/nodemailer";

export async function POST(req: Request) {
    try {
        const { firstName, lastName, email, subject, message } = await req.json();

        if (!firstName || !lastName || !email || !subject || !message) {
            return NextResponse.json({ error: "Tous les champs sont obligatoires." }, { status: 400 });
        }

        // Envoi de l'email au support
        await sendEmail({
            to: "younessbakkali09@gmail.com",
            subject: `[Contact Support] ${subject}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb; border-bottom: 1px solid #eee; padding-bottom: 10px;">Nouveau message de contact</h2>
                    <p><strong>De :</strong> ${firstName} ${lastName} (${email})</p>
                    <p><strong>Sujet :</strong> ${subject}</p>
                    <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin-top: 20px; border: 1px solid #eee;">
                        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                    </div>
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                        Envoyé depuis le formulaire de contact de Bricole.ma
                    </p>
                </div>
            `
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact API Error:", error);
        return NextResponse.json({ error: "Une erreur est survenue lors de l'envoi de votre message." }, { status: 500 });
    }
}
