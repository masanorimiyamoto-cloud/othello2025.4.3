# MyItemScan

スマホで傘・靴・かばんなどを登録し、あとから撮影した物とAIで比較するNext.jsアプリです。登録・一覧・判定・履歴をPINで保護します。

## ローカル起動

Node.js 20.9以上を用意し、次を実行します。

```bash
npm install
copy .env.example .env.local
npm run dev
```

`.env.local` の `APP_PIN` は必ず変更してください。`BLOB_READ_WRITE_TOKEN` が空なら、画像とJSONは自動的に `.data` へ保存されます。AI判定を使うには `OPENAI_API_KEY` が必要です。

## 環境変数

- `APP_PIN`: 必須。持ち物画面へ入るPIN
- `OPENAI_API_KEY`: AI判定に必要。未設定でも登録・一覧・履歴は利用可能
- `OPENAI_MODEL`: 任意。空の場合はコード内の既定モデルを利用
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob接続トークン。ローカルでは任意

## Vercel設定

1. GitHubリポジトリをVercelプロジェクトへ接続します。
2. Storageから **Private** のVercel Blobストアを作成し、プロジェクトへ接続します。写真は公開Blobではなく認証済みAPI経由で配信します。
3. Project Settings → Environment Variables に上記4変数を設定します。少なくとも `APP_PIN` と `BLOB_READ_WRITE_TOKEN`、AI利用時は `OPENAI_API_KEY` を設定します。
4. Framework PresetをNext.js、Build Commandを `npm run build` としてデプロイします。

Blob上のJSON indexは単一利用者向けMVPです。複数利用者や更新頻度が増える本格運用では、メタデータをPostgres等へ移し、PIN認証をNextAuth/Auth.js等へ差し替えてください。

## スマホで使う流れ

1. PINでログインし「登録する」から自分の物を複数写真で登録
2. 「判定する」で確認したい物を撮影
3. AI判定結果と理由を確認し、最後は自分の目で確かめる

## 注意事項

- AI判定は100%ではなく、所有権を証明するものではありません。
- 似た物が多い場合は、全体だけでなく傷・シール・靴底などの特徴写真を増やしてください。
- 写真は個人情報に近いデータです。Blobストアを公開設定にせず、PINを他人に共有しないでください。
- 判定時は同じカテゴリを優先し、新しい登録品から最大10件、各2写真までを比較します。
