import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const path = req.nextUrl.pathname;

  // Définir les routes protégées
  const isProtectedRoute = path.startsWith("/profile") || path.startsWith("/dashboard");

  if (isProtectedRoute) {
    // 1. Vérifier la session NextAuth
    const session = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // 2. Vérifier le cookie personnalisé auth_token
    const authToken = req.cookies.get("auth_token")?.value;

    if (!session && !authToken) {
      // Rediriger vers login si aucune session n'est trouvée
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    "/profile/:path*",
    "/dashboard/:path*",
    "/api/artisan/:path*", // Optionnel : protéger aussi les APIs sensibles
  ],
};
