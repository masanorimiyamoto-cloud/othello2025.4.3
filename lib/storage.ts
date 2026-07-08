import { promises as fs } from "node:fs";
import path from "node:path";
import { del, get, put } from "@vercel/blob";
import type { Item, Judgement, Photo } from "./types";

const localRoot = path.join(process.cwd(), ".data");
const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const indexes = { items: "my-items/index/items.json", history: "my-items/index/history.json" } as const;

async function readJson<T>(kind: keyof typeof indexes, fallback: T): Promise<T> {
  if (!useBlob()) {
    try { return JSON.parse(await fs.readFile(path.join(localRoot, `${kind}.json`), "utf8")) as T; } catch { return fallback; }
  }
  const response = await get(indexes[kind], { access: "private" });
  if (!response || response.statusCode !== 200) return fallback;
  return JSON.parse(await new Response(response.stream).text()) as T;
}
async function writeJson(kind: keyof typeof indexes, value: unknown) {
  // MVPではBlob上のJSON indexを使用。複数ユーザー・高頻度更新ではDB化を推奨。
  const body = JSON.stringify(value, null, 2);
  if (!useBlob()) { await fs.mkdir(localRoot, { recursive: true }); await fs.writeFile(path.join(localRoot, `${kind}.json`), body); return; }
  await put(indexes[kind], body, { access: "private", allowOverwrite: true, contentType: "application/json" });
}
export async function listItems() { return readJson<Item[]>("items", []); }
export async function getItem(id: string) { return (await listItems()).find((item) => item.id === id) ?? null; }
export async function saveItem(item: Item) { const all = await listItems(); all.unshift(item); await writeJson("items", all); }
export async function removeItem(id: string) {
  const all = await listItems(); const item = all.find((x) => x.id === id); if (!item) return false;
  if (useBlob()) await Promise.all(item.photos.map((p) => del(p.url).catch(() => undefined)));
  else await Promise.all(item.photos.map((p) => fs.unlink(path.join(localRoot, p.pathname)).catch(() => undefined)));
  await writeJson("items", all.filter((x) => x.id !== id)); return true;
}
export async function savePhoto(file: File, group: string): Promise<Photo> {
  const id = crypto.randomUUID(); const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const pathname = `photos/${group}/${id}.${ext}`; const createdAt = new Date().toISOString();
  if (useBlob()) { const blob = await put(`my-items/${pathname}`, file, { access: "private", contentType: file.type, addRandomSuffix: false }); return { id, url: blob.url, pathname: blob.pathname, createdAt }; }
  const target = path.join(localRoot, pathname); await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, Buffer.from(await file.arrayBuffer()));
  return { id, url: `/api/photos?pathname=${encodeURIComponent(pathname)}`, pathname, createdAt };
}
export async function readPhoto(pathname: string) {
  if (useBlob()) return get(pathname, { access: "private" });
  const safe = path.resolve(localRoot, pathname); if (!safe.startsWith(path.resolve(localRoot) + path.sep)) return null;
  try { const buffer = await fs.readFile(safe); return { statusCode: 200 as const, stream: new Blob([new Uint8Array(buffer)]).stream(), blob: { contentType: pathname.endsWith(".png") ? "image/png" : "image/jpeg", etag: "local" } }; } catch { return null; }
}
export async function photoDataUrl(photo: Photo) {
  const found = await readPhoto(photo.pathname); if (!found || found.statusCode !== 200) throw new Error("写真を読み込めませんでした");
  const bytes = await new Response(found.stream).arrayBuffer(); return `data:${found.blob.contentType};base64,${Buffer.from(bytes).toString("base64")}`;
}
export async function listHistory() { return readJson<Judgement[]>("history", []); }
export async function saveJudgement(j: Judgement) { const all = await listHistory(); all.unshift(j); await writeJson("history", all.slice(0, 100)); }
