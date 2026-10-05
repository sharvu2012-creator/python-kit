// 🏫 Class management relay — create class + list my classes (teacher-signed-in)
const GAS_URL = process.env.GAS_URL;
const WRITE_KEY = process.env.GAS_WRITE_KEY || 'pk-write-2026';

module.exports = async (req, res) => {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') return res.status(200).end();
if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

const d = req.body || {};
if (!d.uid) return res.status(401).json({ error: 'Sign in required' });

if (!GAS_URL) return res.status(500).json({ error: 'Server not configured' });

const payload = Object.assign({}, d, { key: WRITE_KEY, action: d.action || 'create' });

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
console.error('Class relay error:', e);
res.status(500).json({ error: 'Server error' });
}
};