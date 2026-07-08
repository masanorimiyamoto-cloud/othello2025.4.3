"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CATEGORIES, type JudgeResponse } from "@/lib/types";
const labels = { high: "高い", maybe: "可能性あり", low: "低い", unknown: "判定不能" };
export function JudgeForm() {
  const [file, setFile] = useState<File | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [result, setResult] = useState<JudgeResponse | null>(null);
  const url = useMemo(() => file ? URL.createObjectURL(file) : "", [file]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!file) return setError("写真を選んでください"); setError(""); setResult(null); setLoading(true); const data = new FormData(event.currentTarget); data.set("photo", file); try { const response = await fetch("/api/judge", { method: "POST", body: data }); const json = await response.json(); if (!response.ok) throw new Error(json.error || "判定に失敗しました"); setResult(json); } catch (e) { setError(e instanceof Error ? e.message : "判定に失敗しました"); } finally { setLoading(false); } }
  return <><form className="card form" onSubmit={submit}><label>判定したい物の写真<input name="photo" type="file" accept="image/*" capture="environment" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>{url && <img className="judgePreview" src={url} alt="判定する写真のプレビュー" />}<label>カテゴリ（わかる場合）<select name="category"><option value="">指定しない</option>{CATEGORIES.map((x) => <option key={x}>{x}</option>)}</select></label>{error && <p className="error" role="alert">{error}</p>}<button className="button" disabled={loading}>{loading ? "AIが写真を比べています…" : "判定する"}</button></form>{result && <section className={`card result ${result.result}`} aria-live="polite"><p className="eyebrow">自分の物の可能性</p><h2>{labels[result.result]}</h2><p><b>一致候補：</b>{result.matchedItemName || "なし"}</p><p><b>信頼度：</b>{result.confidence} / 100</p><p><b>理由：</b>{result.reason}</p><p className="warning">AI判定なので最終確認は人が行ってください。</p></section>}</>;
}
