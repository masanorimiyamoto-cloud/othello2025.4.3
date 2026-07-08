import Link from "next/link";
export function Nav() { return <nav className="nav" aria-label="自分の物判定メニュー"><Link href="/my-items">登録品</Link><Link href="/my-items/new">登録する</Link><Link href="/judge">判定する</Link><Link href="/judge/history">履歴</Link></nav>; }
