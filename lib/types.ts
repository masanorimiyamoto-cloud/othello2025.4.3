export const CATEGORIES = ["傘", "靴", "かばん", "服", "道具", "その他"] as const;
export type Category = (typeof CATEGORIES)[number];
export type Photo = { id: string; url: string; pathname: string; createdAt: string };
export type Item = { id: string; name: string; category: Category; memo: string; photos: Photo[]; createdAt: string; updatedAt: string };
export type JudgeResult = "high" | "maybe" | "low" | "unknown";
export type Judgement = { id: string; capturedPhotoUrl: string; capturedPhotoPathname: string; result: JudgeResult; matchedItemId: string | null; matchedItemName: string | null; confidence: number; reason: string; checkedAt: string };
export type JudgeResponse = Omit<Judgement, "id" | "capturedPhotoUrl" | "capturedPhotoPathname">;
