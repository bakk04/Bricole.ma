import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import redis from "@/lib/redis";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getSessionUser() {
  try {
    // 1. Try NextAuth session
    const nextAuthSession = await getServerSession(authOptions);
    if (nextAuthSession?.user) {
      return {
        id: (nextAuthSession.user as any).id,
        email: nextAuthSession.user.email,
        role: (nextAuthSession.user as any).role,
      };
    }

    // 2. Try Custom JWT Token from cookies or headers
    const cookieStore = await cookies();
    const headerStore = await headers();
    const authCookie = cookieStore.get("auth_token");
    const authHeader = headerStore.get("authorization");

    const tokenFromHeader =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    const token = authCookie?.value || tokenFromHeader;

    if (!token) return null;

    // Check Redis for cached session
    const sessionDataRaw = await redis.get(`session:${token}`);
    if (sessionDataRaw) {
      const sessionData = typeof sessionDataRaw === 'string' ? JSON.parse(sessionDataRaw) : sessionDataRaw;
      return {
        id: sessionData.userId,
        email: sessionData.email,
        role: sessionData.role,
      };
    }

    // Verify JWT manually
    if (process.env.JWT_SECRET) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
        return {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role || "CLIENT",
        };
      } catch (err) {
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error("Error in getSessionUser:", error);
    return null;
  }
}
