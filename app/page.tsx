import Link from "next/link";
export default function Home() { return <main className="container home"><p className="eyebrow">自分の物を写真で照合</p><h1>MyItemScan</h1><p>スマホに登録した持ち物の写真をもとに、撮影した対象物が自分の物に近いかをAIで照合できます。</p><Link className="button" href="/my-items">MyItemScanを開く</Link></main>; }
