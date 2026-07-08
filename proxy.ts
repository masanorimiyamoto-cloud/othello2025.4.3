import { NextRequest, NextResponse } from "next/server";
const COOKIE = "my_items_auth";
async function expectedToken() {
  const pin = process.env.APP_PIN ?? "";
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`my-items:${pin}`));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}
export async function proxy(request: NextRequest) {
  const valid = Boolean(process.env.APP_PIN) && request.cookies.get(COOKIE)?.value === await expectedToken();
  if (valid) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  const login = new URL("/login", request.url); login.searchParams.set("next", request.nextUrl.pathname); return NextResponse.redirect(login);
}
export const config = { matcher: ["/my-items/:path*", "/judge/:path*", "/api/items/:path*", "/api/judge/:path*", "/api/photos/:path*"] };
