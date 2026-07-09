import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "MyItemScan", description: "自分の持ち物の写真を登録し、撮影した対象物をAIで照合するアプリ" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ja"><body>{children}</body></html>; }
