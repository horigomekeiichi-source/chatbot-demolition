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
- `src/services/claudeClient.js` — Anthropic SDKのクライアントとシステムプロンプトを保持。`sendMessage(history, userMessage)` がClaudeへのメッセージ送信を抽象化する唯一の場所。モデルやプロンプトの変更はここに集約する。
- `src/services/leadStore.js` — リード（問い合わせ者）情報を読み書きする。**CRM連携の差し替え点**：実CRM（HubSpot等）に接続する際はこのモジュールのインターフェース（`saveLead`）を保ったまま実装を入れ替える。保存先は `process.env.VERCEL` の有無で分岐（ローカル/Render: `data/leads.json`、Vercel: `/tmp/leads.json`、いずれも永続化されない前提のスタブ）。
- `src/routes/chat.js` — `POST /api/chat`。`claudeClient.sendMessage` を呼ぶだけの薄いハンドラ。
- `src/routes/leads.js` — `POST /api/leads`。`leadStore.saveLead` を呼ぶだけの薄いハンドラ。
- `public/widget.js` — フロントエンドのチャットUI。会話履歴をブラウザ側で保持し、`/api/chat` にPOSTする。サーバー側はステートレス（会話履歴を保存しない）。`public/` はVercelでは静的ファイルとして自動配信される。

### セキュリティ方針

- APIキー・パスワードはコードに直書きしない。`.env`（`.gitignore`対象）で管理し、`.env.example` をテンプレートとして使う。
- 収集したリード情報（`data/leads.json` / Vercelでは `/tmp/leads.json`）はリポジトリにコミットしない（`.gitignore`対象）。他人のデータに無断でアクセスしない。

## Deployment

**Vercel**にデプロイする（GitHub Pagesは静的ホスティングのみのため使用不可）。`vercel.json` の rewrites で `/api/*` を `api/index.js`（Expressアプリ）にルーティングし、`public/` 配下はVercelが静的ファイルとして自動配信する。`ANTHROPIC_API_KEY` はVercelダッシュボードの環境変数で設定し、コード・リポジトリには含めない。手順は [README.md](README.md) の「公開（Vercelへのデプロイ）」を参照。Vercelのサーバーレス関数はプロジェクトディレクトリが読み取り専用のため、`data/leads.json` への書き込みは行えず `leadStore.js` が `/tmp` にフォールバックする（いずれも永続化されない）。

## Git Workflow Rules

- Every time code is changed, push the change to GitHub. Do not leave changes committed only locally — after committing, push to the remote.
