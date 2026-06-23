const express = require('express');
const { getStreetViewImage } = require('../services/streetView');
const { estimateFromImage } = require('../services/claudeClient');

const router = express.Router();

router.post('/', async (req, res) => {
  const { address } = req.body || {};

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'address は必須の文字列です。' });
  }

  try {
    const { base64, mediaType } = await getStreetViewImage(address);
    const estimate = await estimateFromImage(address, base64, mediaType);

    res.json({
      imageDataUrl: `data:${mediaType};base64,${base64}`,
      estimate,
    });
  } catch (err) {
    console.error('見積もり処理エラー:', err.message);
    res.status(502).json({
      error: err.message || '見積もりの取得に失敗しました。しばらくしてから再度お試しください。',
    });
  }
});

module.exports = router;
