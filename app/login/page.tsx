import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";
export default function LoginPage() { return <main className="narrow"><p className="eyebrow">写真を安全に保護</p><h1>PINを入力</h1><p>登録した持ち物を見るにはログインしてください。</p><Suspense><LoginForm /></Suspense></main>; }
