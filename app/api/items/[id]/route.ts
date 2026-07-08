import { NextResponse } from "next/server";
import { getItem, removeItem } from "@/lib/storage";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const item = await getItem((await params).id); return item ? NextResponse.json(item) : NextResponse.json({ error: "見つかりません" }, { status: 404 }); }
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { return await removeItem((await params).id) ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "見つかりません" }, { status: 404 }); }
