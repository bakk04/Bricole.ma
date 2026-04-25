import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Mock stats for now
  return NextResponse.json({
    success: true,
    stats: {
      requests: 0,
      favorites: 0,
      completed: 0,
      avgRating: 0
    }
  });
}
