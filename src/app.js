const express = require('express');
const cors = require('cors');
const path = require('path');

const chatRouter = require('./routes/chat');
const leadsRouter = require('./routes/leads');
const estimateRouter = require('./routes/estimate');

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    '[警告] ANTHROPIC_API_KEY が未設定です。.env ファイルを作成し、.env.example を参考に設定してください。'
  );
}

if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.warn(
    '[警告] GOOGLE_MAPS_API_KEY が未設定です。住所からの解体見積もり機能は利用できません。'
  );
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/chat', chatRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/estimate', estimateRouter);

module.exports = app;
