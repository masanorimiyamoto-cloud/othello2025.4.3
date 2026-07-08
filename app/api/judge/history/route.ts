import { NextResponse } from "next/server";
import { listHistory } from "@/lib/storage";
export async function GET() { return NextResponse.json(await listHistory()); }
