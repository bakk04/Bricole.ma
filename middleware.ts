import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const parts = path.split("/");
  
  // Le sid est maintenant dans le segment d'URL : /profile/[sid] ou /dashboard/[sid]
  const urlSid = parts[2];

  // Définir les routes protégées
  const isProtectedRoute = path.startsWith("/profile") || path.startsWith("/dashboard");

  if (isProtectedRoute) {
    // 1. Vérifier la session NextAuth
    const nextAuthToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    }) as any;

    // 2. Vérifier le cookie personnalisé auth_token (JWT custom)
    const customAuthToken = req.cookies.get("auth_token")?.value;

    let sessionUrlToken: string | null = null;

    if (nextAuthToken) {
        sessionUrlToken = nextAuthToken.urlToken as string;
    } else if (customAuthToken) {
        try {
            // Utiliser 'jose' qui est compatible Edge Runtime au lieu de 'jsonwebtoken'
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload } = await jwtVerify(customAuthToken, secret);
            sessionUrlToken = payload.urlToken as string;
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

    // Validation du jeton dans l'URL - Forcer la redirection vers /path/[token]
    const isUIRoute = path.startsWith("/profile") || path.startsWith("/dashboard");
    
    // Si on est sur une route UI et que le SID est absent ou incorrect
    if (isUIRoute && (!urlSid || urlSid !== sessionUrlToken)) {
      const baseDir = parts[1]; 
      const targetPath = `/${baseDir}/${sessionUrlToken}`;
      const signedUrl = new URL(targetPath, req.url);
      
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
