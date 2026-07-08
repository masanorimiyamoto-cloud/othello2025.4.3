import { DEFAULT_OPENAI_MODEL, MAX_COMPARE_PHOTOS } from "./config";
import type { Item, JudgeResponse } from "./types";
import { photoDataUrl } from "./storage";

export async function compareWithOpenAI(captured: string, items: Item[]): Promise<JudgeResponse> {
  const content: Array<Record<string, unknown>> = [
    {
      type: "input_text",
      text: `撮影写真が登録品のどれに近いかを比較してください。
同一メーカー・同一色のスニーカーや似た物を見分ける前提で、全体の印象だけで判断しないでください。
特にロゴの形・位置・角度、縫い目、素材の目、ソールパターン、かかと、履きジワ、傷、汚れ、シール、紐の通し方、左右差、メモに書かれた特徴を重視してください。
ブランド名やカテゴリが同じだけでは一致としないでください。固有特徴が確認できない場合、結果はunknownまたはlowにしてください。
候補:
${items.map((x) => `${x.id}: ${x.name} / ${x.category} / ${x.memo || "メモなし"} / 写真${x.photos.length}枚`).join("\n")}
最も近い1件を選び、理由は一致した特徴と異なる特徴を日本語で簡潔に書いてください。`,
    },
    { type: "input_text", text: "判定したい撮影写真:" },
    { type: "input_image", image_url: captured, detail: "high" },
  ];
  for (const item of items) {
    content.push({ type: "input_text", text: `登録候補 ${item.id}: ${item.name} / ${item.category} / ${item.memo || "メモなし"}` });
    for (const [index, photo] of item.photos.slice(0, MAX_COMPARE_PHOTOS).entries()) {
      content.push({ type: "input_text", text: `登録候補 ${item.id} の写真 ${index + 1}:` });
      content.push({ type: "input_image", image_url: await photoDataUrl(photo), detail: "high" });
    }
  }
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL, input: [{ role: "user", content }], text: { format: { type: "json_schema", name: "item_judgement", strict: true, schema: { type: "object", additionalProperties: false, required: ["result", "matchedItemId", "matchedItemName", "confidence", "reason"], properties: { result: { type: "string", enum: ["high", "maybe", "low", "unknown"] }, matchedItemId: { type: ["string", "null"] }, matchedItemName: { type: ["string", "null"] }, confidence: { type: "integer", minimum: 0, maximum: 100 }, reason: { type: "string" } } } } } }) });
  if (!response.ok) throw new Error(`AI判定に失敗しました (${response.status})`);
  const data = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  const text = data.output_text ?? data.output?.flatMap((x) => x.content ?? []).find((x) => x.text)?.text;
  if (!text) throw new Error("AIから判定結果を取得できませんでした");
  const parsed = JSON.parse(text) as Omit<JudgeResponse, "checkedAt">;
  if (parsed.matchedItemId && !items.some((x) => x.id === parsed.matchedItemId)) { parsed.matchedItemId = null; parsed.matchedItemName = null; }
  return { ...parsed, confidence: Math.max(0, Math.min(100, Math.round(parsed.confidence))), checkedAt: new Date().toISOString() };
}
