const fs = require('fs');
const path = require('path');
const os = require('os');

// Vercelのサーバーレス関数はプロジェクトディレクトリが読み取り専用で、
// 書き込み可能なのは /tmp のみ（かつ実行ごとに消える）。
const LEADS_FILE = process.env.VERCEL
  ? path.join(os.tmpdir(), 'leads.json')
  : path.join(__dirname, '..', '..', 'data', 'leads.json');

function readLeads() {
  if (!fs.existsSync(LEADS_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(LEADS_FILE, 'utf-8');
  return raw.trim() ? JSON.parse(raw) : [];
}

function saveLead(lead) {
  const leads = readLeads();
  const entry = {
    timestamp: new Date().toISOString(),
    name: lead.name || null,
    contact: lead.contact || null,
    message: lead.message || null,
  };
  leads.push(entry);
  fs.mkdirSync(path.dirname(LEADS_FILE), { recursive: true });
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  return entry;
}

module.exports = { saveLead, readLeads };
