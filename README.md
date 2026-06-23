# chatbot-demolition

お客様の悩み相談chatbot

空き家オーナー・実家オーナー・土地売却検討者・建替え検討者を対象に、解体から不動産売却・建替えまでをワンストップでサポートするAI対話型チャットボットです。Claude API（Anthropic）を使い、24時間自動で一次対応を行います。

## セットアップ

```bash
npm install
cp .env.example .env
```

`.env` を編集し、`ANTHROPIC_API_KEY` に自分のAPIキー（[console.anthropic.com](https://console.anthropic.com)で発行）を設定してください。APIキーはコードやコミットに含めないでください。

住所からの解体見積もり機能を使う場合は、`GOOGLE_MAPS_API_KEY` も設定してください。Google Cloud Consoleで以下の準備が必要です。

1. 課金先（請求先アカウント）を設定したGoogle CloudプロジェクトでAPIキーを発行する。
2. そのプロジェクトで **Street View Static API** を有効化する。
3. 発行したAPIキーを `.env` の `GOOGLE_MAPS_API_KEY` に設定する（不正利用防止のため、APIキーの制限でStreet View Static APIのみ許可することを推奨）。

このAPIキーは利用量に応じてGoogle側で課金が発生します。

## 起動

```bash
npm start
```

ブラウザで http://localhost:3000 を開くと、デモページ右下のチャットアイコンからウィジェットを開けます。

## API

- `POST /api/chat` — `{ message, history }` を送るとClaudeの応答 `{ reply }` を返す。
- `POST /api/leads` — `{ name, contact, message }` を送るとリード情報を保存する（CRM連携のスタブ。実CRMへの接続は今後のフェーズで差し替え予定。保存先はローカル/Renderでは `data/leads.json`、Vercelでは `/tmp/leads.json`）。
- `POST /api/estimate` — `{ address }` を送ると、その住所のGoogleストリートビュー画像をClaude（画像読み取り）に見せて解体費用の参考レンジを返す（`{ imageDataUrl, estimate }`）。**AIによる目視推定であり、正式な見積もりではありません。**

## セキュリティ

- APIキーやパスワードはコードに直書きせず `.env`（gitignore対象）で管理しています。
- 収集したリード情報（`data/leads.json`）もリポジトリにコミットしません。

## 公開（Vercelへのデプロイ）

このアプリはフロントエンド（チャットウィジェット、`public/`）と、Claude API呼び出しを行うバックエンドAPI（`api/index.js` から呼ばれるExpressアプリ `src/app.js`）に分かれており、[Vercel](https://vercel.com) のサーバーレス関数として公開できます。GitHub Pages（静的ホスティングのみ）ではバックエンドが動かせないため使用できません。

1. Vercelにアカウント登録し、GitHubと連携してこのリポジトリ（`chatbot-demolition`）をインポートする。
2. Framework Presetは「Other」のままでよい（ビルドコマンド不要）。`vercel.json` の設定により `/api/*` へのリクエストは `api/index.js`（Expressアプリ）にルーティングされ、`public/` 配下は静的ファイルとして配信される。
3. プロジェクト設定の「Environment Variables」で `ANTHROPIC_API_KEY` と `GOOGLE_MAPS_API_KEY` に自分のAPIキーを追加する（コードやリポジトリには含めない）。
4. デプロイ完了後、発行されたURL（例: `https://chatbot-demolition.vercel.app`）でアプリにアクセスできる。

### 注意点

- Vercelのサーバーレス関数はプロジェクトディレクトリが読み取り専用で、書き込み可能なのは一時ディレクトリ（`/tmp`）のみ、かつ実行ごとにリセットされる。`leadStore.js` はVercel環境（`process.env.VERCEL`）を検知して `/tmp` に書き込むようにしているが、**リード情報は永続化されない**（CRM連携スタブとしての挙動は変わらない）。実運用では外部DBや実CRMへの接続が必要。
- ローカル開発は `npm start`（`server.js` がポート3000でリッスン）で従来どおり動作する。
