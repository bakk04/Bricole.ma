import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import redis from "@/lib/redis";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (token) {
      await redis.del(`session:${token}`);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
