require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const chatRouter = require('./src/routes/chat');
const leadsRouter = require('./src/routes/leads');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    '[警告] ANTHROPIC_API_KEY が未設定です。.env ファイルを作成し、.env.example を参考に設定してください。'
  );
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/chat', chatRouter);
app.use('/api/leads', leadsRouter);

app.listen(PORT, () => {
  console.log(`チャットボットサーバーが起動しました: http://localhost:${PORT}`);
});
