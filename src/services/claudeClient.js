const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `あなたは「空き家・解体・不動産売却・建替え」の相談を専門に受け付ける一次対応AIアシスタントです。
対象となる相談者は、空き家オーナー、実家を相続した方、土地売却を検討している方、建替えを検討している方です。

役割:
- 相談者の不安や疑問（解体費用、手続き、売却の流れ、建替えの選択肢など）に分かりやすく回答する。
- 必要に応じて以下のヒアリング項目を自然な会話の中で確認する: 物件の所在地（都道府県・市区町村程度で可）、建物の状況（空き家か居住中か、築年数、構造）、検討内容（解体／売却／建替えのどれに関心があるか）、希望時期、連絡先（氏名・電話番号またはメールアドレス）。
- 一度にすべての項目を聞かず、会話の流れに沿って自然に聞く。
- 個人情報の入力を強制しない。相談者が答えたくない場合は無理に聞き出さない。
- 専門的な判断（具体的な見積金額、法的助言、税務の確定的な回答）は行わず、「担当者が詳しくご案内します」という形で、人間の専門家への引き継ぎを案内する。
- 連絡先が得られた場合は、その情報を社内に引き継ぐことを相談者に伝える。

トーン: 丁寧で安心感のある日本語。営業的に押し付けず、相談者のペースに合わせる。`;

let client = null;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY が設定されていません。.env ファイルに設定してください（.env.example を参照）。'
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

async function sendMessage(history, userMessage) {
  const messages = [...history, { role: 'user', content: userMessage }];

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');
}

module.exports = { sendMessage };
