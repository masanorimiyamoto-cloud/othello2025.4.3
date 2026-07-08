"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/types";

const photoTips = ["全体がわかる正面・横・後ろ", "ロゴ、タグ、柄などのアップ", "傷、汚れ、シール、名前などの目印", "靴ならソール、かかと、履きジワ"];

export function ItemForm() {
  const [files, setFiles] = useState<File[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const router = useRouter();
  const urls = useMemo(() => files.map(URL.createObjectURL), [files]);
  useEffect(() => () => urls.forEach(URL.revokeObjectURL), [urls]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); if (!files.length) { setError("写真を1枚以上選んでください"); return; } setLoading(true); const data = new FormData(event.currentTarget); data.delete("photos"); files.forEach((f) => data.append("photos", f)); try { const response = await fetch("/api/items", { method: "POST", body: data }); const json = await response.json(); if (!response.ok) throw new Error(json.error || "登録に失敗しました"); router.push("/my-items"); router.refresh(); } catch (e) { setError(e instanceof Error ? e.message : "登録に失敗しました"); setLoading(false); } }
  return <form className="card form" onSubmit={submit}><label>物の名前<input name="name" maxLength={80} placeholder="例：黒い傘" required /></label><label>カテゴリ<select name="category" required>{CATEGORIES.map((x) => <option key={x}>{x}</option>)}</select></label><label>メモ<textarea name="memo" maxLength={500} rows={4} placeholder="傷、シール、名前などの特徴" /></label><label>写真（最大6枚）<input name="photos" type="file" accept="image/*" capture="environment" multiple required onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 6))} /></label><section className="hint photoTips" aria-label="登録時の推奨撮影ポイント"><b>推奨撮影ポイント</b><ul>{photoTips.map((tip) => <li key={tip}>{tip}</li>)}</ul></section>{urls.length > 0 && <div className="previews">{urls.map((url, i) => <img src={url} alt={`登録写真 ${i + 1}`} key={url} />)}</div>}{error && <p className="error" role="alert">{error}</p>}<button className="button" disabled={loading}>{loading ? "写真を登録中…" : "登録する"}</button></form>;
}
