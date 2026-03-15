import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    settings: {
      pushNotifications: true,
      emailMarketing: false,
      shareLocation: true,
      publicProfile: true,
      darkMode: false,
      instantMessages: true
    }
  });
}

export async function PATCH() {
  return NextResponse.json({ success: true });
}
