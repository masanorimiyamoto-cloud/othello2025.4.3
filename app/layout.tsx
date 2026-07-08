import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "MyItemScan", description: "写真で自分の持ち物かを確認するアプリ" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ja"><body>{children}</body></html>; }
