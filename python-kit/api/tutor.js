module.exports = async (req, res) => {
// CORS
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') return res.status(200).end();
if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

const { question, code, lesson, lang } = req.body || {};
if (!question || typeof question !== 'string' || question.length > 2000) {
return res.status(400).json({ error: 'Invalid question (max 2000 chars)' });
}

const system = `You are a friendly Python tutor for school students.
Reply in simple ${lang === 'pa' ? 'Punjabi' : 'English'}.
Give hints first, not the full solution. Keep answers under 120 words.
Current lesson: ${lesson}`;

const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
console.error('GEMINI_API_KEY not set');
return res.status(500).json({ error: 'Server configuration error' });
}

try {
const r = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
{
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-goog-api-key': apiKey
},
body: JSON.stringify({
systemInstruction: { parts: [{ text: system }] },
contents: [{
role: 'user',
parts: [{ text: `Question: ${question}\nStudent code:\n${code || '(no code yet)'}` }]
}]
})
});

const data = await r.json();
if (!r.ok) {
console.error('Gemini API error:', data);
return res.status(502).json({ error: 'AI service error' });
}

const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Try again.';
res.json({ answer });
} catch (e) {
console.error('Tutor error:', e);
res.status(500).json({ error: 'Server error' });
}
};