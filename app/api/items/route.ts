import { NextResponse } from "next/server";
import { CATEGORIES, type Category, type Item } from "@/lib/types";
import { MAX_FILE_BYTES } from "@/lib/config";
import { listItems, saveItem, savePhoto } from "@/lib/storage";
export async function GET() { return NextResponse.json(await listItems()); }
export async function POST(request: Request) {
  try {
    const form = await request.formData(); const name = String(form.get("name") ?? "").trim(); const category = String(form.get("category") ?? "") as Category; const memo = String(form.get("memo") ?? "").trim(); const files = form.getAll("photos").filter((x): x is File => x instanceof File && x.size > 0);
    if (!name || !CATEGORIES.includes(category) || files.length === 0) return NextResponse.json({ error: "名前、カテゴリ、写真を入力してください" }, { status: 400 });
    if (files.length > 6) return NextResponse.json({ error: "写真は6枚までです" }, { status: 400 });
    if (files.some((f) => !f.type.startsWith("image/") || f.size > MAX_FILE_BYTES)) return NextResponse.json({ error: "画像は1枚8MB以下にしてください" }, { status: 400 });
    const id = crypto.randomUUID(); const now = new Date().toISOString(); const photos = await Promise.all(files.map((f) => savePhoto(f, id))); const item: Item = { id, name: name.slice(0, 80), category, memo: memo.slice(0, 500), photos, createdAt: now, updatedAt: now }; await saveItem(item); return NextResponse.json(item, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "登録に失敗しました" }, { status: 500 }); }
}
