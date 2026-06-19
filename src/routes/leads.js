const express = require('express');
const { saveLead } = require('../services/leadStore');

const router = express.Router();

// MVPではローカルファイルへのスタブ保存。将来的に実CRM（HubSpot等）へのAPI連携に差し替える。
router.post('/', (req, res) => {
  const { name, contact, message } = req.body || {};

  if (!contact) {
    return res.status(400).json({ error: 'contact（電話番号またはメールアドレス）は必須です。' });
  }

  const entry = saveLead({ name, contact, message });
  res.status(201).json({ saved: entry });
});

module.exports = router;
