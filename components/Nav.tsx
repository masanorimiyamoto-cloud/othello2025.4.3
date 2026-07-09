import Link from "next/link";
const items = [
  { href: "/my-items", label: "登録品" },
  { href: "/my-items/new", label: "登録" },
  { href: "/judge", label: "判定" },
  { href: "/judge/history", label: "履歴" },
] as const;
export function Nav() { return <nav className="nav" aria-label="自分の物判定メニュー">{items.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>; }
