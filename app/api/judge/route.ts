import { NextResponse } from "next/server";
import { MAX_FILE_BYTES } from "@/lib/config";
import { compareWithOpenAI } from "@/lib/openai";
import { listItems, photoDataUrl, saveJudgement, savePhoto } from "@/lib/storage";
import { CATEGORIES, type Category, type Judgement } from "@/lib/types";
export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI判定は未設定です。OPENAI_API_KEY を設定してください" }, { status: 503 });
    const form = await request.formData(); const file = form.get("photo"); const rawCategory = String(form.get("category") ?? "");
    if (!(file instanceof File) || !file.type.startsWith("image/") || file.size > MAX_FILE_BYTES) return NextResponse.json({ error: "8MB以下の判定写真を選んでください" }, { status: 400 });
    if (!CATEGORIES.includes(rawCategory as Category)) return NextResponse.json({ error: "比較するジャンルを選んでください" }, { status: 400 });
    const category = rawCategory as Category;
    const all = await listItems(); const candidates = all.filter((x) => x.category === category);
    if (!candidates.length) return NextResponse.json({ error: "このジャンルの登録品がありません" }, { status: 400 });
    const captured = await savePhoto(file, "judgements"); const result = await compareWithOpenAI(await photoDataUrl(captured), candidates);
    const judgement: Judgement = { id: crypto.randomUUID(), capturedPhotoUrl: captured.url, capturedPhotoPathname: captured.pathname, ...result }; await saveJudgement(judgement); return NextResponse.json(result);
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "判定に失敗しました" }, { status: 500 }); }
}
