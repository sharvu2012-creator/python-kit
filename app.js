// ===== App State =====
let currentLessonIndex = 0;
let currentLang = 'en';
let pyodide = null;
let pyodideReady = false;
let deferredInstallPrompt = null;

const LANG_NAMES = {
en: 'English', pa: 'ਪੰਜਾਬੀ', hi: 'हिंदी', bn: 'বাংলা', te: 'తెలుగు',
mr: 'मराठी', ta: 'தமிழ்', gu: 'ગુજરાતી', kn: 'ಕನ್ನಡ', or: 'ଓଡ଼ିଆ',
ml: 'മലയാളം', as: 'অসমীয়া', ur: 'اردو'
};
const AI_PILLS = [
'💡 Explain this lesson simply',
'🐛 Debug my code',
'🔁 Give me a loop example',
'❓ What is a variable?',
'🧪 Give me a mini quiz'
];

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
const installBtn = document.getElementById('installBtn');
const installCard = document.getElementById('installCard');
const aiPills = document.getElementById('aiPills');
const fabBtn = document.getElementById('fabBtn');
const fabPanel = document.getElementById('fabPanel');
const fabAsk = document.getElementById('fabAsk');
const fabFeedback = document.getElementById('fabFeedback');
const fabFeedbackBox = document.getElementById('fabFeedbackBox');
const feedbackText = document.getElementById('feedbackText');
const feedbackSend = document.getElementById('feedbackSend');
const feedbackDone = document.getElementById('feedbackDone');

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
renderLessonList();
renderPills();
loadTheme();
loadLanguage();
setupEventListeners();
setupScrollReveal();
setupInstall();
setupFab();
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
}

// ===== Lesson List =====
function renderLessonList() {
lessonList.innerHTML = '';
lessons.forEach((lesson, i) => {
const li = document.createElement('li');
li.className = 'lesson-item' + (i === currentLessonIndex ? ' active' : '');
li.style.animationDelay = (i * 0.05) + 's';
li.innerHTML = `
<div class="lesson-title">${lessonTitleFor(lesson)}</div>
<div class="lesson-meta">Lesson ${i + 1} of ${lessons.length}</div>
`;
li.addEventListener('click', () => loadLesson(i));
lessonList.appendChild(li);
});
}

// ===== Language helpers =====
function lessonTitleFor(lesson) {
return currentLang === 'pa' ? lesson.title.pa : lesson.title.en;
}
function lessonTextFor(lesson) {
return currentLang === 'pa' ? lesson.text.pa : lesson.text.en;
}
function langNameForAI() {
return LANG_NAMES[currentLang] || 'English';
}

// ===== Load Lesson =====
function loadLesson(index) {
currentLessonIndex = index;
const lesson = lessons[index];

document.querySelectorAll('.lesson-item').forEach((li, i) => {
li.classList.toggle('active', i === index);
});

explanationContent.innerHTML = `
<div class="lang-toggle">
<button class="lang-btn ${currentLang !== 'pa' ? 'active' : ''}" data-lang="en">English</button>
<button class="lang-btn ${currentLang === 'pa' ? 'active' : ''}" data-lang="pa">ਪੰਜਾਬੀ</button>
</div>
<div class="explanation-text">${lessonTextFor(lesson)}</div>
`;
document.querySelectorAll('.lang-btn').forEach(btn => {
btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

codeEditor.value = lesson.starter;
outputDisplay.textContent = 'Output appears here...';

aiChat.innerHTML = '';
addAIMessage('assistant', `Ready to help with: ${lessonTitleFor(lesson)}. Ask me anything!`);
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
loadLesson(currentLessonIndex);
saveLanguage();
}

function loadLanguage() {
const saved = localStorage.getItem('lang');
if (saved && LANG_NAMES[saved]) setLanguage(saved);
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

// ===== AI Quick Pills =====
function renderPills() {
aiPills.innerHTML = '';
AI_PILLS.forEach((text) => {
const btn = document.createElement('button');
btn.className = 'ai-pill';
btn.textContent = text;
btn.addEventListener('click', () => {
aiInput.value = text.replace(/^[^\s]+\s/, ''); // strip emoji
aiInput.focus();
});
aiPills.appendChild(btn);
});
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
body: JSON.stringify({
question,
code,
lesson: lesson.title.en,
lang: currentLang,
langName: langNameForAI()
})
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

// ===== Scroll Reveal =====
function setupScrollReveal() {
const els = document.querySelectorAll('.reveal');
if (!('IntersectionObserver' in window)) {
els.forEach(el => el.classList.add('in'));
return;
}
const io = new IntersectionObserver((entries) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
entry.target.classList.add('in');
io.unobserve(entry.target);
}
});
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
els.forEach(el => io.observe(el));
}

// ===== PWA Install =====
function setupInstall() {
window.addEventListener('beforeinstallprompt', (e) => {
e.preventDefault();
deferredInstallPrompt = e;
installBtn.hidden = false;
});
const doInstall = async () => {
if (deferredInstallPrompt) {
deferredInstallPrompt.prompt();
await deferredInstallPrompt.userChoice;
deferredInstallPrompt = null;
installBtn.hidden = true;
} else {
alert('To install: open your browser menu (⋮) and choose "Install app" or "Add to Home screen".');
}
};
installBtn.addEventListener('click', doInstall);
if (installCard) installCard.addEventListener('click', doInstall);
window.addEventListener('appinstalled', () => { installBtn.hidden = true; });
}

// ===== FAB (AI + Feedback) =====
function setupFab() {
const closeAll = () => {
fabPanel.hidden = true;
fabFeedbackBox.hidden = true;
fabBtn.classList.remove('open');
fabBtn.textContent = '🤖';
};
fabBtn.addEventListener('click', (e) => {
e.stopPropagation();
const opening = fabPanel.hidden && fabFeedbackBox.hidden;
closeAll();
if (opening) {
fabPanel.hidden = false;
fabBtn.classList.add('open');
fabBtn.textContent = '✕';
}
});
fabAsk.addEventListener('click', () => {
closeAll();
document.getElementById('aiSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
setTimeout(() => aiInput.focus(), 600);
});
fabFeedback.addEventListener('click', (e) => {
e.stopPropagation();
fabPanel.hidden = true;
fabFeedbackBox.hidden = false;
feedbackDone.hidden = true;
});
feedbackSend.addEventListener('click', () => {
const text = feedbackText.value.trim();
if (!text) { feedbackText.focus(); return; }
const subject = encodeURIComponent('Python Kit Feedback');
const body = encodeURIComponent(text);
window.location.href = `mailto:?subject=${subject}&body=${body}`;
feedbackText.value = '';
feedbackDone.hidden = false;
setTimeout(closeAll, 1200);
});
document.addEventListener('click', (e) => {
if (!e.target.closest('.fab-wrap')) closeAll();
});
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape') closeAll();
});
}

// ===== Service Worker Registration =====
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('/sw.js').catch(() => {});
}