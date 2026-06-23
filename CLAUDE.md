# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI対話型チャットボット（MVP）。空き家オーナー・実家オーナー・土地売却検討者・建替え検討者向けに、解体〜不動産売却〜建替えまでをワンストップで案内し、24時間自動対応によって問い合わせ獲得・不安解消・見込み顧客育成を行う。

## Commands

```bash
npm install        # 依存インストール
cp .env.example .env  # APIキー等の設定ファイルを作成（値は自分で記入、コミットしない）
npm start           # サーバー起動（http://localhost:3000）
```

単一エンドポイントの動作確認:

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"テスト","contact":"test@example.com","message":"テスト"}'
```

## Architecture

Express製のアプリ本体（`src/app.js`）を、ローカル/Renderでは長時間稼働サーバー（`server.js`）として、Vercelではサーバーレス関数（`api/index.js`）として、同じコードのまま2通りの方式で起動できる構成。

- `src/app.js` — Express本体。CORS・JSONパーサ・静的配信・ルーティングの設定を担い、`app`（リスナーは持たない）をexportする。
- `server.js` — ローカル/Render向けエントリポイント。`src/app.js` を読み込み `app.listen()` する。
- `api/index.js` — Vercel向けエントリポイント。`src/app.js` の `app` をそのままexportし、Vercelのサーバーレス関数として実行される（`vercel.json` の rewrites で `/api/*` がここにルーティングされる）。
- `src/services/claudeClient.js` — Anthropic SDKのクライアントとシステムプロンプトを保持。`sendMessage(history, userMessage)` がClaudeへの通常メッセージ送信、`estimateFromImage(address, imageBase64, mediaType)` が画像を見せて解体費用の参考レンジを聞く処理を担う。モデルやプロンプトの変更はここに集約する。
- `src/services/leadStore.js` — リード（問い合わせ者）情報を読み書きする。**CRM連携の差し替え点**：実CRM（HubSpot等）に接続する際はこのモジュールのインターフェース（`saveLead`）を保ったまま実装を入れ替える。保存先は `process.env.VERCEL` の有無で分岐（ローカル/Render: `data/leads.json`、Vercel: `/tmp/leads.json`、いずれも永続化されない前提のスタブ）。
- `src/services/streetView.js` — Google Maps Platform の Street View Static API を呼び出し、住所からその場所の外観画像（base64）を取得する。画像が存在しない住所はエラーを投げる。`GOOGLE_MAPS_API_KEY` はサーバー側だけで使用し、ブラウザには渡さない（フロントにはStreet ViewのAPIキーを直接埋め込まない）。
- `src/routes/chat.js` — `POST /api/chat`。`claudeClient.sendMessage` を呼ぶだけの薄いハンドラ。
- `src/routes/leads.js` — `POST /api/leads`。`leadStore.saveLead` を呼ぶだけの薄いハンドラ。
- `src/routes/estimate.js` — `POST /api/estimate`。`streetView.getStreetViewImage` → `claudeClient.estimateFromImage` の順に呼び、取得した画像（data URL）と見積もりテキストを返す。
- `public/widget.js` — フロントエンドのUI。チャットの会話履歴をブラウザ側で保持し `/api/chat` にPOSTする（サーバー側はステートレス）。住所入力フォームから `/api/estimate` を呼び、返ってきた画像と見積もりテキストを表示する。`public/` はVercelでは静的ファイルとして自動配信される。

### セキュリティ方針

- APIキー・パスワードはコードに直書きしない。`.env`（`.gitignore`対象）で管理し、`.env.example` をテンプレートとして使う。`GOOGLE_MAPS_API_KEY` も同様（Street View Static API限定の制限をかけることを推奨）。
- 収集したリード情報（`data/leads.json` / Vercelでは `/tmp/leads.json`）はリポジトリにコミットしない（`.gitignore`対象）。他人のデータに無断でアクセスしない。
- `/api/estimate` が返す解体費用の見積もりは、ストリートビュー画像のみに基づくAIの目視推定であり、正式な見積もりではない（`claudeClient.js` のプロンプトでもその旨を明記させている）。表示・案内時にこの前提を省略しないこと。

## Deployment

**Vercel**にデプロイする（GitHub Pagesは静的ホスティングのみのため使用不可）。`vercel.json` の rewrites で `/api/*` を `api/index.js`（Expressアプリ）にルーティングし、`public/` 配下はVercelが静的ファイルとして自動配信する。`ANTHROPIC_API_KEY` はVercelダッシュボードの環境変数で設定し、コード・リポジトリには含めない。手順は [README.md](README.md) の「公開（Vercelへのデプロイ）」を参照。Vercelのサーバーレス関数はプロジェクトディレクトリが読み取り専用のため、`data/leads.json` への書き込みは行えず `leadStore.js` が `/tmp` にフォールバックする（いずれも永続化されない）。

## Git Workflow Rules

- Every time code is changed, push the change to GitHub. Do not leave changes committed only locally — after committing, push to the remote.
