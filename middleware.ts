import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const parts = path.split("/").filter(Boolean);
  
  // Routes UI protégées
  const isProfile = path.startsWith("/profile");
  const isDashboard = path.startsWith("/dashboard");
  const isAdmin = path.startsWith("/admin");
  const isApi = path.startsWith("/api/");

  const isProtectedRoute = isProfile || isDashboard || isAdmin || (isApi && (path.includes("/api/admin") || path.includes("/api/artisan")));

  if (isProtectedRoute) {
    // 1. Session NextAuth
    const nextAuthToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    }) as any;

    // 2. Cookie personnalisé
    const customAuthToken = req.cookies.get("auth_token")?.value;

    let sessionUrlToken: string | null = null;
    let userRole: string | null = null;

    if (nextAuthToken) {
        sessionUrlToken = nextAuthToken.urlToken;
        userRole = nextAuthToken.role?.toUpperCase();
    } else if (customAuthToken) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload } = await jwtVerify(customAuthToken, secret);
            sessionUrlToken = payload.urlToken as string;
            userRole = (payload.role as string)?.toUpperCase();
        } catch (e) {
            // Silently fail
        }
    }

    // Redirection vers login si aucune session n'est trouvée (sauf pour les APIs)
    if (!sessionUrlToken) {
      if (isApi) {
        // Laisser passer les APIs de login/auth
        if (path.includes("/api/login") || path.includes("/api/auth")) return NextResponse.next();
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }

    // Protection spécifique ADMIN
    if (isAdmin && userRole !== "ADMIN") {
        const target = userRole === "ARTISAN" ? `/dashboard/${sessionUrlToken}` : `/profile/${sessionUrlToken}`;
        return NextResponse.redirect(new URL(target, req.url));
    }

    // Validation du SID dans l'URL pour les routes UI
    const isUIRoute = isProfile || isDashboard || isAdmin;
    if (isUIRoute) {
        const urlSid = parts[1]; // parts[0] est 'profile'|'dashboard'|'admin'
        
        if (!urlSid || urlSid !== sessionUrlToken) {
            const baseDir = parts[0]; 
            const targetPath = `/${baseDir}/${sessionUrlToken}`;
            return NextResponse.redirect(new URL(targetPath, req.url));
        }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/artisan/:path*",
    "/api/admin/:path*",
  ],
};
