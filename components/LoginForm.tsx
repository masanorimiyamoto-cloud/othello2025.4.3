"use client";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
export function LoginForm() {
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const search = useSearchParams();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin: form.get("pin") }) });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) { setError(data.error || "ログインできませんでした"); setLoading(false); return; }
      window.location.assign(search.get("next") || "/my-items");
    } catch {
      setError("通信に失敗しました。もう一度お試しください");
      setLoading(false);
    }
  }
  return <form className="card form" onSubmit={submit}><label>PIN<input name="pin" type="password" inputMode="numeric" autoComplete="current-password" required autoFocus /></label>{error && <p className="error" role="alert">{error}</p>}<button className="button" disabled={loading}>{loading ? "確認中…" : "ログイン"}</button></form>;
}
