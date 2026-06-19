const express = require('express');
const cors = require('cors');
const path = require('path');

const chatRouter = require('./routes/chat');
const leadsRouter = require('./routes/leads');

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    '[警告] ANTHROPIC_API_KEY が未設定です。.env ファイルを作成し、.env.example を参考に設定してください。'
  );
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/chat', chatRouter);
app.use('/api/leads', leadsRouter);

module.exports = app;
