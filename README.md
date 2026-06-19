# chatbot-demolition

お客様の悩み相談chatbot

空き家オーナー・実家オーナー・土地売却検討者・建替え検討者を対象に、解体から不動産売却・建替えまでをワンストップでサポートするAI対話型チャットボットです。Claude API（Anthropic）を使い、24時間自動で一次対応を行います。

## セットアップ

```bash
npm install
cp .env.example .env
```

`.env` を編集し、`ANTHROPIC_API_KEY` に自分のAPIキー（[console.anthropic.com](https://console.anthropic.com)で発行）を設定してください。APIキーはコードやコミットに含めないでください。

## 起動

```bash
npm start
```

ブラウザで http://localhost:3000 を開くと、デモページ右下のチャットアイコンからウィジェットを開けます。

## API

- `POST /api/chat` — `{ message, history }` を送るとClaudeの応答 `{ reply }` を返す。
- `POST /api/leads` — `{ name, contact, message }` を送るとリード情報を `data/leads.json` に保存する（CRM連携のスタブ。実CRMへの接続は今後のフェーズで差し替え予定）。

## セキュリティ

- APIキーやパスワードはコードに直書きせず `.env`（gitignore対象）で管理しています。
- 収集したリード情報（`data/leads.json`）もリポジトリにコミットしません。
