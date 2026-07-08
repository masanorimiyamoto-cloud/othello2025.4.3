import { NextResponse } from "next/server";
import { MAX_COMPARE_ITEMS, MAX_FILE_BYTES } from "@/lib/config";
import { compareWithOpenAI } from "@/lib/openai";
import { listItems, photoDataUrl, saveJudgement, savePhoto } from "@/lib/storage";
import type { Category, Judgement } from "@/lib/types";
export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI判定は未設定です。OPENAI_API_KEY を設定してください" }, { status: 503 });
    const form = await request.formData(); const file = form.get("photo"); const category = String(form.get("category") ?? "") as Category | ""; const itemId = String(form.get("itemId") ?? "").trim();
    if (!(file instanceof File) || !file.type.startsWith("image/") || file.size > MAX_FILE_BYTES) return NextResponse.json({ error: "8MB以下の判定写真を選んでください" }, { status: 400 });
    if (!itemId) return NextResponse.json({ error: "比較する登録品を選んでください" }, { status: 400 });
    const all = await listItems(); const filtered = category ? all.filter((x) => x.category === category) : all; const candidates = filtered.filter((x) => x.id === itemId).slice(0, MAX_COMPARE_ITEMS);
    if (!candidates.length) return NextResponse.json({ error: "選択した登録品が見つかりません" }, { status: 400 });
    const captured = await savePhoto(file, "judgements"); const result = await compareWithOpenAI(await photoDataUrl(captured), candidates);
    const judgement: Judgement = { id: crypto.randomUUID(), capturedPhotoUrl: captured.url, capturedPhotoPathname: captured.pathname, ...result }; await saveJudgement(judgement); return NextResponse.json(result);
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "判定に失敗しました" }, { status: 500 }); }
}
