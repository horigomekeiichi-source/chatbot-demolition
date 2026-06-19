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

## 公開（Renderへのデプロイ）

このアプリはフロントエンド（チャットウィジェット）とバックエンド（Express + Claude API）が一体のNode.jsサーバーなので、GitHub Pages（静的ホスティングのみ）では公開できません。[Render](https://render.com) の無料Webサービスにデプロイします。

1. Renderにアカウント登録し、GitHubと連携してこのリポジトリ（`chatbot-demolition`）を選択する。
2. このリポジトリ直下の `render.yaml` が自動検出され、Web Service（Node環境、`npm install` → `npm start`）が設定される。
3. デプロイ設定画面の環境変数で `ANTHROPIC_API_KEY` に自分のAPIキーを入力する（`render.yaml` には値を含めていないため、ここで手動設定が必要）。
4. デプロイ完了後、発行されたURL（例: `https://chatbot-demolition.onrender.com`）でアプリにアクセスできる。

### 注意点

- Render無料プランのディスクは再起動・再デプロイ時にリセットされるため、`data/leads.json`（リード情報のスタブ保存先）は永続化されません。実運用では実CRM連携への切り替えが必要です。
- 無料プランは一定時間アクセスがないとスリープし、次回アクセス時に起動まで数十秒かかることがあります。
