import { DEFAULT_OPENAI_MODEL } from "./config";
import type { Item, JudgeResponse } from "./types";
import { photoDataUrl } from "./storage";

export async function compareWithOpenAI(captured: string, items: Item[]): Promise<JudgeResponse> {
  const content: Array<Record<string, unknown>> = [{ type: "input_text", text: `撮影写真と登録品を比較してください。1枚だけで断定せず、色・形だけでなく固有の傷、シール、柄、持ち手、靴底、ロゴ等を重視します。候補:\n${items.map((x) => `${x.id}: ${x.name} / ${x.category} / ${x.memo || "メモなし"}`).join("\n")}\n最も近い1件を選び、違いが大きい・写真不足ならunknownまたはlowにしてください。理由は日本語で簡潔に。` }, { type: "input_image", image_url: captured, detail: "high" }];
  for (const item of items) for (const photo of item.photos.slice(0, 2)) content.push({ type: "input_image", image_url: await photoDataUrl(photo), detail: "high" });
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL, input: [{ role: "user", content }], text: { format: { type: "json_schema", name: "item_judgement", strict: true, schema: { type: "object", additionalProperties: false, required: ["result", "matchedItemId", "matchedItemName", "confidence", "reason"], properties: { result: { type: "string", enum: ["high", "maybe", "low", "unknown"] }, matchedItemId: { type: ["string", "null"] }, matchedItemName: { type: ["string", "null"] }, confidence: { type: "integer", minimum: 0, maximum: 100 }, reason: { type: "string" } } } } } }) });
  if (!response.ok) throw new Error(`AI判定に失敗しました (${response.status})`);
  const data = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  const text = data.output_text ?? data.output?.flatMap((x) => x.content ?? []).find((x) => x.text)?.text;
  if (!text) throw new Error("AIから判定結果を取得できませんでした");
  const parsed = JSON.parse(text) as Omit<JudgeResponse, "checkedAt">;
  if (parsed.matchedItemId && !items.some((x) => x.id === parsed.matchedItemId)) { parsed.matchedItemId = null; parsed.matchedItemName = null; }
  return { ...parsed, confidence: Math.max(0, Math.min(100, Math.round(parsed.confidence))), checkedAt: new Date().toISOString() };
}
