import { NextResponse } from "next/server";
import { AUTH_COOKIE, authToken } from "@/lib/auth";
export async function POST(request: Request) {
  const { pin } = await request.json().catch(() => ({ pin: "" })) as { pin?: string };
  if (!process.env.APP_PIN) return NextResponse.json({ error: "APP_PIN が設定されていません" }, { status: 503 });
  if (pin !== process.env.APP_PIN) return NextResponse.json({ error: "PINが違います" }, { status: 401 });
  const response = NextResponse.json({ ok: true }); response.cookies.set(AUTH_COOKIE, authToken(), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" }); return response;
}
