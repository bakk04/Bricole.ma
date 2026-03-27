import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const parts = path.split("/");
  
  // Le sid est maintenant dans le segment d'URL : /profile/[sid] ou /dashboard/[sid]
  // parts[0] est "", parts[1] est "profile" ou "dashboard", parts[2] est le sid
  const urlSid = parts[2];

  // Définir les routes protégées
  const isProtectedRoute = path.startsWith("/profile") || path.startsWith("/dashboard");

  if (isProtectedRoute) {
    // 1. Vérifier la session NextAuth
    const nextAuthToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // 2. Vérifier le cookie personnalisé auth_token (JWT custom)
    const customAuthToken = req.cookies.get("auth_token")?.value;

    let sessionUrlToken = null;

    if (nextAuthToken) {
        sessionUrlToken = nextAuthToken.urlToken;
    } else if (customAuthToken) {
        try {
            // Utiliser 'jose' qui est compatible Edge Runtime au lieu de 'jsonwebtoken'
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload } = await jwtVerify(customAuthToken, secret);
            sessionUrlToken = payload.urlToken;
        } catch (e) {
            console.error("Middleware JWT verification error:", e);
        }
    }

    // Rediriger vers login si aucune session n'est trouvée
    if (!sessionUrlToken) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }

    // Validation du jeton dans l'URL (style ChatGPT)
    if (urlSid !== sessionUrlToken) {
      // Si le jeton est absent ou incorrect dans le segment d'URL, on redirige vers l'URL propre avec le bon jeton
      // Ex: /profile -> /profile/[sessionUrlToken]
      const targetPath = `/${parts[1]}/${sessionUrlToken}`;
      const signedUrl = new URL(targetPath, req.url);
      
      // Conserver les paramètres additionnels s'ils existent
      req.nextUrl.searchParams.forEach((value, key) => {
        signedUrl.searchParams.set(key, value);
      });
      
      return NextResponse.redirect(signedUrl);
    }
  }

  return NextResponse.next();
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    "/profile/:path*",
    "/dashboard/:path*",
    "/api/artisan/:path*",
  ],
};
