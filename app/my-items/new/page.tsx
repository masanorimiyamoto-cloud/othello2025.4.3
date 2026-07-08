import Link from "next/link";
import { ItemForm } from "@/components/ItemForm";
import { Nav } from "@/components/Nav";
export default function NewItemPage() { return <><main className="narrow"><Link className="back" href="/my-items">← 一覧へ</Link><p className="eyebrow">写真で記録</p><h1>自分の物を登録</h1><ItemForm /></main><Nav /></>; }
