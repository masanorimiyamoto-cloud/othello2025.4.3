import { DEFAULT_OPENAI_MODEL, MAX_COMPARE_PHOTOS } from "./config";
import type { Item, JudgeResponse } from "./types";
import { photoDataUrl } from "./storage";

export async function compareWithOpenAI(captured: string, items: Item[]): Promise<JudgeResponse> {
  const content: Array<Record<string, unknown>> = [
    {
      type: "input_text",
      text: `撮影写真の対象物が、登録候補の中にある「自分の物」と同じ個体かを判定してください。
目的は、登録候補の中から該当品があるかを探すことです。ただし、該当品がない場合は無理に最も近い候補を選ばず、matchedItemId と matchedItemName を null にしてください。

判定基準:
- high: 固有特徴が複数一致し、矛盾する違いが見当たらない。同じ個体と見てよい。
- maybe: 一致する固有特徴があるが、角度・写り・一部欠落により断定しきれない。
- low: 同じジャンル・色・形・ブランド・モデルに見えるだけで、個体を示す特徴が一致しない。または候補と違う特徴がある。
- unknown: 写真が不鮮明、重要な部分が見えない、候補写真と比較できる特徴が少なすぎる。

重視する特徴:
- 靴なら、ソールパターン、かかと、履きジワ、縫い目、ロゴの形・位置・角度、紐の通し方、左右差、傷、汚れ、シール、穴や切れ込み、色の濃淡を比較してください。
- かばん・傘・小物なら、持ち手、金具、ファスナー、縫い目、柄、色の配置、傷や汚れを比較してください。
- メモに固有の特徴があれば強く考慮してください。

注意:
- 同じジャンル・同じ色・同じブランド・似た形だけでは一致にしないでください。
- 候補の中で一番似ていても、個体の一致根拠が弱ければ low または unknown にしてください。
- high または maybe のときだけ matchedItemId と matchedItemName に該当候補を入れてください。
候補:
${items.map((x) => `${x.id}: ${x.name} / ${x.category} / ${x.memo || "メモなし"} / 写真${x.photos.length}枚`).join("\n")}
理由は「一致した特徴」と「異なる特徴または不足している特徴」を日本語で簡潔に書いてください。`,
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
