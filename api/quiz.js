// 🤖 AI quiz generator — fresh questions every attempt
module.exports = async (req, res) => {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') return res.status(200).end();
if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

const { lesson, topic, avoid } = req.body || {};
if (!lesson) return res.status(400).json({ error: 'Missing lesson' });

const model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) return res.status(500).json({ error: 'Server configuration error' });

const system = `You are a quiz generator for school students (age 11-16) learning Python.
Create 3 multiple-choice questions for the lesson: "${lesson}".
Topic context: ${topic || 'Python basics for beginners'}.

Rules:
- Test UNDERSTANDING, not memorization — use "what happens", "which is correct", "what does X return"
- Each question: exactly 4 options, exactly 1 correct answer
- Difficulty mix: 1 easy, 1 medium, 1 slightly harder
- Age-appropriate language, short and clear
- Vary the question styles each time (definition, code output prediction, error spotting, best practice)
${avoid && avoid.length ? `- DO NOT repeat or paraphrase these existing questions: ${JSON.stringify(avoid.slice(0, 5))}` : ''}
- Output ONLY valid JSON matching this exact shape:
{"questions":[{"q":"question text","options":["a","b","c","d"],"answer":0,"explain":"one line reason"}]}
- "answer" is the 0-based index (0-3) of the correct option`;

const user = `Generate 3 quiz questions for: ${lesson}`;

try {
const r = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
{
method: 'POST',
headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
body: JSON.stringify({
systemInstruction: { parts: [{ text: system }] },
contents: [{ role: 'user', parts: [{ text: user }] }],
generationConfig: { responseMimeType: 'application/json' }
})
});

const data = await r.json();
if (!r.ok) {
console.error('Gemini quiz error:', data);
return res.status(502).json({ error: 'AI service error' });
}

const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
let quiz;
try { quiz = JSON.parse(text); } catch { return res.status(502).json({ error: 'AI returned invalid JSON' }); }

// validate shape
if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length < 3) {
return res.status(502).json({ error: 'AI returned incomplete quiz' });
}

res.json(quiz);
} catch (e) {
console.error('Quiz generation error:', e);
res.status(500).json({ error: 'Server error' });
}
};