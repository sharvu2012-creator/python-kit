// ===== App State =====
let currentLessonIndex = 0;
let currentLang = 'en';
let pyodide = null;
let pyodideReady = false;

// ===== DOM Elements =====
const lessonList = document.getElementById('lessonList');
const explanationContent = document.getElementById('explanationContent');
const codeEditor = document.getElementById('codeEditor');
const outputDisplay = document.getElementById('outputDisplay');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const themeSelect = document.getElementById('themeSelect');
const langSelect = document.getElementById('langSelect');
const aiInput = document.getElementById('aiInput');
const aiSendBtn = document.getElementById('aiSendBtn');
const aiChat = document.getElementById('aiChat');
const aiStatus = document.getElementById('aiStatus');

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
renderLessonList();
loadTheme();
loadLanguage();
setupEventListeners();
await initPyodide();
loadLesson(0);
});

function setupEventListeners() {
runBtn.addEventListener('click', runCode);
clearBtn.addEventListener('click', () => { codeEditor.value = ''; outputDisplay.textContent = 'Output appears here...'; });
themeSelect.addEventListener('change', (e) => setTheme(e.target.value));
langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
aiSendBtn.addEventListener('click', sendAIQuestion);
aiInput.addEventListener('keydown', (e) => {
if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAIQuestion(); }
});
document.querySelectorAll('.lang-btn').forEach(btn => {
btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});
}

// ===== Lesson List =====
function renderLessonList() {
lessonList.innerHTML = '';
lessons.forEach((lesson, i) => {
const li = document.createElement('li');
li.className = 'lesson-item' + (i === currentLessonIndex ? ' active' : '');
li.innerHTML = `
<div class="lesson-title">${lesson.title[currentLang]}</div>
<div class="lesson-meta">Lesson ${i + 1} of ${lessons.length}</div>
`;
li.addEventListener('click', () => loadLesson(i));
lessonList.appendChild(li);
});
}

// ===== Load Lesson =====
function loadLesson(index) {
currentLessonIndex = index;
const lesson = lessons[index];

// Update sidebar
document.querySelectorAll('.lesson-item').forEach((li, i) => {
li.classList.toggle('active', i === index);
});

// Update explanation
explanationContent.innerHTML = `
<div class="lang-toggle">
<button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">English</button>
<button class="lang-btn ${currentLang === 'pa' ? 'active' : ''}" data-lang="pa">ਪੰਜਾਬੀ</button>
</div>
<div class="explanation-text">${lesson.text[currentLang]}</div>
`;
document.querySelectorAll('.lang-btn').forEach(btn => {
btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

// Reset code editor with starter
codeEditor.value = lesson.starter;
outputDisplay.textContent = 'Output appears here...';

// Clear AI chat
aiChat.innerHTML = '';
addAIMessage('assistant', `Ready to help with: ${lesson.title[currentLang]}. Ask me anything!`);
}

// ===== Pyodide Init =====
async function initPyodide() {
outputDisplay.textContent = 'Loading Python...';
try {
pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/" });
pyodideReady = true;
outputDisplay.textContent = 'Python ready! Click Run to execute.';
} catch (e) {
outputDisplay.textContent = 'Error loading Python: ' + e.message;
}
}

// ===== Run Code =====
async function runCode() {
if (!pyodideReady) { outputDisplay.textContent = 'Python not ready yet...'; return; }

const code = codeEditor.value.trim();
if (!code) return;

runBtn.disabled = true;
runBtn.textContent = 'Running...';
outputDisplay.textContent = 'Running...';

try {
let output = '';
pyodide.setStdout({ batched: (s) => { output += s + '\n'; } });
pyodide.setStderr({ batched: (s) => { output += 'Error: ' + s + '\n'; } });
pyodide.setStdin({ stdin: () => prompt('Input:') });

await pyodide.runPythonAsync(code);
outputDisplay.textContent = output || '(no output)';
} catch (e) {
outputDisplay.textContent = 'Error: ' + e.message;
} finally {
runBtn.disabled = false;
runBtn.textContent = '▶ Run';
}
}

// ===== Language =====
function setLanguage(lang) {
currentLang = lang;
langSelect.value = lang;
document.querySelectorAll('.lang-btn').forEach(btn => {
btn.classList.toggle('active', btn.dataset.lang === lang);
});
loadLesson(currentLessonIndex); // Re-render with new language
}

function loadLanguage() {
const saved = localStorage.getItem('lang');
if (saved) setLanguage(saved);
}
function saveLanguage() { localStorage.setItem('lang', currentLang); }

// ===== Theme =====
function setTheme(theme) {
document.documentElement.setAttribute('data-theme', theme);
themeSelect.value = theme;
localStorage.setItem('theme', theme);
}
function loadTheme() {
const saved = localStorage.getItem('theme') || 'dark';
setTheme(saved);
}

// ===== AI Tutor =====
async function sendAIQuestion() {
const question = aiInput.value.trim();
if (!question) return;

const lesson = lessons[currentLessonIndex];
const code = codeEditor.value;

addAIMessage('user', question);
aiInput.value = '';
aiSendBtn.disabled = true;
aiStatus.textContent = 'Thinking...';

try {
const res = await fetch('/api/tutor', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ question, code, lesson: lesson.title.en, lang: currentLang })
});
const data = await res.json();
if (res.ok) {
addAIMessage('assistant', data.answer);
} else {
addAIMessage('assistant', 'Error: ' + (data.error || 'Try again'));
}
} catch (e) {
addAIMessage('assistant', 'AI needs internet connection.');
} finally {
aiSendBtn.disabled = false;
aiStatus.textContent = '';
}
}

function addAIMessage(role, content) {
const div = document.createElement('div');
div.className = 'ai-message';
div.innerHTML = `<div class="role">${role === 'user' ? 'You' : 'AI Tutor'}</div><div class="content">${escapeHtml(content)}</div>`;
aiChat.appendChild(div);
aiChat.scrollTop = aiChat.scrollHeight;
}

function escapeHtml(text) {
const div = document.createElement('div');
div.textContent = text;
return div.innerHTML;
}

// ===== Service Worker Registration =====
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('/sw.js').catch(() => {});
}