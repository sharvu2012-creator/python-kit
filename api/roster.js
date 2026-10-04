// 🔒 Teacher roster proxy — PIN checked server-side, never exposed to browsers
module.exports = async (req, res) => {
// CORS
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') return res.status(200).end();
if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

const { classCode, pin } = req.body || {};
if (!classCode || !pin) {
return res.status(400).json({ error: 'Enter class code and PIN.' });
}

// dashboard PIN check (server-side env, never in browser code)
if (pin !== process.env.TEACHER_PIN) {
return res.status(401).json({ error: 'Wrong PIN' });
}

const gasUrl = process.env.GAS_URL;
if (!gasUrl) {
return res.status(500).json({ error: 'Server not configured (GAS_URL missing)' });
}

try {
// server-to-server call to Google Apps Script (no CORS issues server-side)
const url = gasUrl + '?class=' + encodeURIComponent(classCode) + '&pin=' + encodeURIComponent(process.env.TEACHER_PIN);
const r = await fetch(url);
const data = await r.json();
if (!r.ok) return res.status(502).json({ error: 'Backend error' });
res.json(data);
} catch (e) {
console.error('Roster error:', e);
res.status(500).json({ error: 'Server error' });
}
};