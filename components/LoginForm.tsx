"use client";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
export function LoginForm() {
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const router = useRouter(); const search = useSearchParams();
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); const form = new FormData(event.currentTarget); const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin: form.get("pin") }) }); const data = await response.json(); if (!response.ok) { setError(data.error || "ログインできませんでした"); setLoading(false); return; } router.push(search.get("next") || "/my-items"); router.refresh(); }
  return <form className="card form" onSubmit={submit}><label>PIN<input name="pin" type="password" inputMode="numeric" autoComplete="current-password" required autoFocus /></label>{error && <p className="error" role="alert">{error}</p>}<button className="button" disabled={loading}>{loading ? "確認中…" : "ログイン"}</button></form>;
}
