import { NextRequest, NextResponse } from "next/server";
import { readPhoto } from "@/lib/storage";
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname"); if (!pathname) return NextResponse.json({ error: "写真が指定されていません" }, { status: 400 });
  const result = await readPhoto(pathname); if (!result || result.statusCode !== 200) return NextResponse.json({ error: "写真が見つかりません" }, { status: 404 });
  return new NextResponse(result.stream, { headers: { "Content-Type": result.blob.contentType, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" } });
}
