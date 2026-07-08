import Link from "next/link";
import { Nav } from "@/components/Nav";
import { DeleteButton } from "@/components/DeleteButton";
import { listItems } from "@/lib/storage";
export const dynamic = "force-dynamic";
export default async function ItemsPage() { const items = await listItems(); return <><main className="container"><div className="heading"><div><p className="eyebrow">登録済み</p><h1>自分の物</h1></div><Link className="button small" href="/my-items/new">＋ 新しく登録</Link></div>{items.length === 0 ? <section className="card empty"><h2>まだ登録がありません</h2><p>まずは特徴がわかる写真を登録しましょう。</p><Link className="button" href="/my-items/new">最初の物を登録</Link></section> : <div className="itemList">{items.map((item) => <article className="card item" key={item.id}>{item.photos[0] && <img src={`/api/photos?pathname=${encodeURIComponent(item.photos[0].pathname)}`} alt={`${item.name}の登録写真`} />}<div className="itemBody"><span className="tag">{item.category}</span><h2>{item.name}</h2><p>{item.memo || "メモなし"}</p><small>写真 {item.photos.length}枚・{new Date(item.createdAt).toLocaleDateString("ja-JP")}</small><DeleteButton id={item.id} /></div></article>)}</div>}</main><Nav /></>; }
