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

Express製の単一サーバー（`server.js`）が、静的フロントエンド（`public/`）とAPIルートを両方ホストする構成。

- `server.js` — Expressエントリポイント。CORS・JSONパーサ・静的配信・ルーティングの設定のみを担う。
- `src/services/claudeClient.js` — Anthropic SDKのクライアントとシステムプロンプトを保持。`sendMessage(history, userMessage)` がClaudeへのメッセージ送信を抽象化する唯一の場所。モデルやプロンプトの変更はここに集約する。
- `src/services/leadStore.js` — リード（問い合わせ者）情報を `data/leads.json` に読み書きする。**CRM連携の差し替え点**：実CRM（HubSpot等）に接続する際はこのモジュールのインターフェース（`saveLead`）を保ったまま実装を入れ替える。
- `src/routes/chat.js` — `POST /api/chat`。`claudeClient.sendMessage` を呼ぶだけの薄いハンドラ。
- `src/routes/leads.js` — `POST /api/leads`。`leadStore.saveLead` を呼ぶだけの薄いハンドラ。
- `public/widget.js` — フロントエンドのチャットUI。会話履歴をブラウザ側で保持し、`/api/chat` にPOSTする。サーバー側はステートレス（会話履歴を保存しない）。

### セキュリティ方針

- APIキー・パスワードはコードに直書きしない。`.env`（`.gitignore`対象）で管理し、`.env.example` をテンプレートとして使う。
- 収集したリード情報（`data/leads.json`）はリポジトリにコミットしない（`.gitignore`対象）。他人のデータに無断でアクセスしない。

## Git Workflow Rules

- Every time code is changed, push the change to GitHub. Do not leave changes committed only locally — after committing, push to the remote.
