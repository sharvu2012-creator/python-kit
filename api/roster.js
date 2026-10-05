// 🔒 Teacher roster proxy — forwards class+PIN to Apps Script (validates per-class PIN).
// Rate-limited to slow brute-force PIN guessing.
const GAS_URL = process.env.GAS_URL;

const hits = new Map();
const LIMIT = 30, WINDOW = 3600e3; // 30 roster loads/hour per IP
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

const { classCode, pin } = req.body || {};
if (!classCode || !pin) {
return res.status(400).json({ error: 'Enter class code and PIN.' });
}

const ip = (req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
if (rateLimited(ip)) {
return res.status(429).json({ error: 'Too many attempts — try again later.' });
}

if (!GAS_URL) return res.status(500).json({ error: 'Server not configured' });

try {
// GAS validates the PIN against the class's own PIN (or legacy global PIN)
const url = GAS_URL + '?class=' + encodeURIComponent(classCode) + '&pin=' + encodeURIComponent(pin);
const r = await fetch(url);
const data = await r.json();
if (!r.ok) return res.status(502).json({ error: 'Backend error' });
res.json(data);
} catch (e) {
console.error('Roster error:', e);
res.status(500).json({ error: 'Server error' });
}
};