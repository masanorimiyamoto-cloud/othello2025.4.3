import { Nav } from "@/components/Nav";
import { listHistory } from "@/lib/storage";
const labels = { high: "高い", maybe: "可能性あり", low: "低い", unknown: "判定不能" };
export const dynamic = "force-dynamic";
export default async function HistoryPage() { const history = await listHistory(); return <><main className="container"><p className="eyebrow">過去の確認</p><h1>判定履歴</h1>{history.length === 0 ? <p className="card empty">判定履歴はまだありません。</p> : <div className="historyList">{history.map((x) => <article className="card history" key={x.id}><img src={`/api/photos?pathname=${encodeURIComponent(x.capturedPhotoPathname)}`} alt="判定時の写真" /><div><span className={`tag ${x.result}`}>{labels[x.result]}</span><h2>{x.matchedItemName || "一致候補なし"}</h2><p>信頼度 {x.confidence} / 100</p><p>{x.reason}</p><time>{new Date(x.checkedAt).toLocaleString("ja-JP")}</time></div></article>)}</div>}</main><Nav /></>; }
