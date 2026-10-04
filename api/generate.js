module.exports = async (req, res) => {
// CORS
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-teacher-code');
if (req.method === 'OPTIONS') return res.status(200).end();
if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

// Teacher code check
const teacherCode = req.headers['x-teacher-code'];
if (teacherCode !== process.env.TEACHER_CODE) {
return res.status(401).json({ error: 'Invalid teacher code' });
}

const { topic, level, lang } = req.body || {};
if (!topic) return res.status(400).json({ error: 'Topic required' });

const system = `You are a curriculum designer for a Python course for school students.
Create a new lesson on "${topic}" for ${level || 'beginner'} level.
Reply in ${lang === 'pa' ? 'Punjabi and English' : 'English'}.
Output MUST be valid JSON only.`;

const prompt = `Create a lesson object with these fields:
- title: { pa: "Punjabi title", en: "English title" }
- text: { pa: "Explanation in Punjabi", en: "Explanation in English" }
- starter: "Starting code example"
- task: { pa: "Practice task in Punjabi", en: "Practice task in English" }
- teacherNotes: "Notes for the teacher"

Topic: ${topic}
Level: ${level || 'beginner'}
Language: ${lang === 'pa' ? 'Punjabi and English' : 'English'}`;

const model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
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
contents: [{ role: 'user', parts: [{ text: prompt }] }],
generationConfig: { responseMimeType: 'application/json' }
})
});

const data = await r.json();
if (!r.ok) {
console.error('Gemini API error:', data);
return res.status(502).json({ error: 'AI service error' });
}

const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
let lesson;
try { lesson = JSON.parse(text); }
catch { return res.status(502).json({ error: 'AI returned invalid JSON' }); }

res.json({ lesson });
} catch (e) {
console.error('Generate error:', e);
res.status(500).json({ error: 'Server error' });
}
};