"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function DeleteButton({ id }: { id: string }) { const [busy, setBusy] = useState(false); const router = useRouter(); return <button className="textButton danger" disabled={busy} onClick={async () => { if (!confirm("この登録品を削除しますか？")) return; setBusy(true); const res = await fetch(`/api/items/${id}`, { method: "DELETE" }); if (!res.ok) alert("削除できませんでした"); setBusy(false); router.refresh(); }}>{busy ? "削除中…" : "削除"}</button>; }
