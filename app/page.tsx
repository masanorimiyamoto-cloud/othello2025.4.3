import Link from "next/link";
export default function Home() { return <main className="container home"><p className="eyebrow">持ち物を写真で確認</p><h1>MyItemScan</h1><p>傘や靴を登録して、あとから撮った物が自分の物かAIと一緒に確認できます。</p><Link className="button" href="/my-items">MyItemScanを開く</Link></main>; }
