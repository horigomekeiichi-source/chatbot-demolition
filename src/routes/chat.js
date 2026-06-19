const express = require('express');
const { sendMessage } = require('../services/claudeClient');

const router = express.Router();

router.post('/', async (req, res) => {
  const { message, history } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message は必須の文字列です。' });
  }

  try {
    const reply = await sendMessage(Array.isArray(history) ? history : [], message);
    res.json({ reply });
  } catch (err) {
    console.error('Claude API呼び出しエラー:', err.message);
    res.status(500).json({
      error: 'AIからの応答取得に失敗しました。しばらくしてから再度お試しください。',
    });
  }
});

module.exports = router;
