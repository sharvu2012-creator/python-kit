// 🔒 Progress relay — write key stays server-side, never in browser code.
// Students POST here; we validate, rate-limit, and forward to Apps Script.
const GAS_URL = process.env.GAS_URL;
const WRITE_KEY = process.env.GAS_WRITE_KEY || 'pk-write-2026';

const hits = new Map();
const LIMIT = 10, WINDOW = 3600e3; // 10 reports/hour per IP
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < WINDOW);
  if (arr.length >= LIMIT) return true;
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) return res.status(429).json({ error: 'Too many reports' });

  const d = req.body || {};
  if (!d.class || !d.student) return res.status(400).json({ error: 'Missing fields' });

  // clamp & sanitize everything server-side
  const payload = {
    key: WRITE_KEY,
    class: String(d.class).replace(/[^A-Za-z0-9]/g, '').slice(0, 20).toUpperCase(),
    student: String(d.student).slice(0, 30),
    xp: Math.max(0, Math.min(99999, Number(d.xp) || 0)),
    done: Math.max(0, Math.min(99, Number(d.done) || 0)),
    streak: Math.max(0, Math.min(9999, Number(d.streak) || 0)),
    scores: d.scores && typeof d.scores === 'object' ? d.scores : {}
  };

  if (!GAS_URL) return res.status(500).json({ error: 'Server not configured' });

  try {
    const r = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'Backend error' });
    res.json(data);
  } catch (e) {
    console.error('Progress relay error:', e);
    res.status(500).json({ error: 'Server error' });
  }
};