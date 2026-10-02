# Python Kit — Learn Python in Punjabi & English

A progressive web app for learning Python with bilingual explanations, an in-browser code runner (Pyodide), and an AI tutor powered by Google Gemini.

## Features

- 📚 **12 Lessons** (5 built-in, expandable) — Print, Variables, Input, If/Else, Loops, and more
- 🌐 **Bilingual** — Switch between English and Punjabi instantly
- ▶️ **In-Browser Python** — Runs via Pyodide (WebAssembly), no server needed for code execution
- 🤖 **AI Tutor** — Ask questions, get hints (not answers), powered by Gemini
- 👩‍🏫 **Teacher Tools** — Generate new lessons & quizzes via `/api/generate` (protected by code)
- 📱 **PWA / Offline** — Installable, works offline after first visit
- 🌙 **Dark/Light Theme** — Persisted in localStorage
- ♿ **Accessible** — Semantic HTML, ARIA labels, keyboard navigation

## Quick Start

### 1. Prerequisites
- [GitHub account](https://github.com)
- [Vercel account](https://vercel.com) (Hobby free tier)
- [Gemini API key](https://aistudio.google.com/apikey)
- [VS Code](https://code.visualstudio.com/) (recommended)

### 2. Get Your API Key
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with Google → **Create API Key**
3. Copy the key — you'll need it for Vercel

### 3. Deploy to Vercel

**Option A: One-click deploy**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/python-kit)

**Option B: Manual**
1. Push this folder to a new GitHub repo
2. In Vercel: **Add New → Project** → Import your repo
3. **Environment Variables** (Settings → Environment Variables):
   - `GEMINI_API_KEY` = your Gemini API key
   - `GEMINI_MODEL` = `gemini-1.5-flash` (or current free model from AI Studio)
   - `TEACHER_CODE` = a secret code you choose (for `/api/generate`)
4. **Deploy** → you get `your-project.vercel.app`

### 4. Custom Domain (Optional)
Vercel Settings → Domains → Add your domain.

## Project Structure

```
python-kit/
├── index.html          # Main HTML
├── style.css           # All styles (dark/light, responsive)
├── app.js              # Client logic (Pyodide, AI, UI)
├── lessons.js          # Lesson data (edit to add lessons)
├── sw.js               # Service worker (offline support)
├── manifest.json       # PWA manifest
├── api/
│   ├── tutor.js        # /api/tutor - AI chat
│   └── generate.js     # /api/generate - Lesson generator (teacher only)
├── vercel.json         # Vercel config
├── package.json        # Project metadata
├── .env.example        # Environment variables template
└── README.md           # This file
```

## Adding Lessons

Edit `lessons.js` — each lesson is one object:

```js
{
  title: { pa: "ਪੰਜਾਬੀ ਟਾਈਟਲ", en: "English Title" },
  text: { pa: "ਪੰਜਾਬੀ ਸਮਝਾਅ", en: "English explanation" },
  starter: 'print("Hello")',
  task: { pa: "ਕੰਮ", en: "Task" },
  teacherNotes: "Notes for teacher"
}
```

No HTML changes needed — the sidebar and content update automatically.

## Teacher: Generate New Lessons

Use the `/api/generate` endpoint (requires `x-teacher-code` header):

```bash
curl -X POST https://your-site.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -H "x-teacher-code: YOUR_TEACHER_CODE" \
  -d '{"topic": "functions", "level": "beginner", "lang": "en"}'
```

Returns a draft lesson object — review, edit, then add to `lessons.js`.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla HTML/CSS/JS (ESM) |
| Python Runtime | Pyodide (CPython in WebAssembly) |
| AI | Google Gemini 1.5 Flash |
| Hosting | Vercel (Edge Functions) |
| Offline | Service Worker (Cache API) |
| PWA | Web App Manifest |

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers

## Offline Usage

1. Visit the site once online (loads Pyodide + caches assets)
2. Go offline → reload → lessons + code runner work
3. AI tutor requires internet (shows friendly message if offline)

## Customization

| What | Where |
|------|-------|
| Colors/Theme | `style.css` CSS variables |
| Lessons | `lessons.js` |
| AI Model | `GEMINI_MODEL` env var |
| Teacher Code | `TEACHER_CODE` env var |
| PWA Icons | `manifest.json` |

## License

MIT — Free for educational use.

## Troubleshooting

| Issue | Fix |
|------|-----|
| Pyodide won't load | Check internet, try refresh; Pyodide CDN may be slow first time |
| AI returns error | Check `GEMINI_API_KEY` in Vercel env vars; verify model name |
| `/api/generate` 401 | Ensure `x-teacher-code` header matches `TEACHER_CODE` |
| Offline not working | Open DevTools → Application → Service Workers → check "Offline" |
| Punjabi not displaying | Ensure font supports Gurmukhi (system fonts do) |

## Credits

- [Pyodide](https://pyodide.org/) — Python in the browser
- [Google Gemini](https://ai.google.dev/) — AI tutor
- [Vercel](https://vercel.com/) — Free hosting & serverless functions