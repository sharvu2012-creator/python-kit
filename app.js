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
'💡 Explain simply',
'🐛 Debug my code',
'🔁 Loop example',
'❓ What is a variable?',
'🧪 Mini quiz'
];

// ===== DOM =====
const $ = (id) => document.getElementById(id);
const lessonList = $('lessonList');
const explanationContent = $('explanationContent');
const codeEditor = $('codeEditor');
const outputDisplay = $('outputDisplay');
const runBtn = $('runBtn');
const clearBtn = $('clearBtn');
const themeSelect = $('themeSelect');
const langSelect = $('langSelect');
const aiInput = $('aiInput');
const aiSendBtn = $('aiSendBtn');
const aiChat = $('aiChat');
const aiStatus = $('aiStatus');
const installBtn = $('installBtn');
const installCard = $('installCard');
const aiPills = $('aiPills');
const menuBtn = $('menuBtn');
const closeMenuBtn = $('closeMenuBtn');
const sideMenu = $('sideMenu');
const menuOverlay = $('menuOverlay');
const fabAiBtn = $('fabAiBtn');
const fabFeedbackBtn = $('fabFeedbackBtn');
const chatPanel = $('chatPanel');
const chatClose = $('chatClose');
const feedbackPanel = $('feedbackPanel');
const feedbackClose = $('feedbackClose');
const feedbackText = $('feedbackText');
const feedbackSend = $('feedbackSend');
const feedbackDone = $('feedbackDone');
const startLearningBtn = $('startLearningBtn');

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
renderLessonList();
renderPills();
loadTheme();
loadLanguage();
setupEventListeners();
setupMenu();
setupScrollReveal();
setupFireworks();
setupSmoothScroll();
setupInstall();
setupFab();
await initPyodide();
loadLesson(0);
showView('dashboard');
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
startLearningBtn.addEventListener('click', () => showView('lessons'));
}

// ===== VIEW ROUTER =====
function showView(name) {
document.querySelectorAll('.view').forEach(v => { v.hidden = true; });
const target = $('view-' + name);
if (target) target.hidden = false;
document.querySelectorAll('.menu-link').forEach(l => {
l.classList.toggle('active', l.dataset.view === name);
});
closeMenu();
window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== MENU =====
function setupMenu() {
menuBtn.addEventListener('click', openMenu);
closeMenuBtn.addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', closeMenu);
document.querySelectorAll('.menu-link').forEach(link => {
link.addEventListener('click', () => showView(link.dataset.view));
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
}
function openMenu() {
menuOverlay.hidden = false;
requestAnimationFrame(() => menuOverlay.classList.add('show'));
sideMenu.classList.add('open');
}
function closeMenu() {
menuOverlay.classList.remove('show');
sideMenu.classList.remove('open');
setTimeout(() => { menuOverlay.hidden = true; }, 300);
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
}

// ===== Pyodide =====
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

// ===== AI Pills =====
function renderPills() {
aiPills.innerHTML = '';
AI_PILLS.forEach((text) => {
const btn = document.createElement('button');
btn.className = 'ai-pill';
btn.textContent = text;
btn.addEventListener('click', () => {
aiInput.value = text.replace(/^[^\s]+\s/, '');
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

// ===== Scroll Reveal (GPU-smooth, starts after splash, fine elements too) =====
function setupScrollReveal() {
const els = document.querySelectorAll('.reveal, .reveal-fine');
if (!('IntersectionObserver' in window)) {
els.forEach(el => el.classList.add('in'));
return;
}

// tag small elements + text inside study/hero/how blocks
document.querySelectorAll(
'.study h3, .study > p, .fact, .reason, .usecase, .code-block, .code-note, .step, .hero-title, .hero-sub, .how h3'
).forEach(el => el.classList.add('reveal-fine'));

// stagger small elements within their parent section (text starts after block begins)
document.querySelectorAll('.study, .hero, .how').forEach(parent => {
parent.querySelectorAll('.reveal-fine').forEach((k, i) => {
k.style.transitionDelay = (0.12 + i * 0.05) + 's';
});
});

// cascade cards inside grids
document.querySelectorAll('.bento-grid, .reason-grid, .usecase-grid, .fact-row, .steps').forEach(grid => {
Array.from(grid.children).forEach((child, i) => {
if (child.classList.contains('reveal')) {
child.style.transitionDelay = (i * 0.07) + 's';
}
});
});

const io = new IntersectionObserver((entries) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
const el = entry.target;
el.classList.add('in');
io.unobserve(el);
setTimeout(() => { el.style.transitionDelay = '0s'; }, 1100);
}
});
}, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });

// wait for splash to finish (~3.4s) so first sections animate visibly
setTimeout(() => {
els.forEach(el => io.observe(el));
}, 3400);
}

// ===== 🎆 Purple click fireworks =====
function setupFireworks() {
const canvas = $('fxCanvas');
if (!canvas) return;
const fx = canvas.getContext('2d');
const COLORS = ['#a78bfa', '#8b5cf6', '#c4b5fd', '#e9d5ff', '#7c3aed', '#f0abfc'];
let parts = [];
let raf = null;

function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener('resize', resize);
resize();

function burst(x, y) {
for (let i = 0; i < 26; i++) {
const a = Math.random() * Math.PI * 2;
const sp = 2 + Math.random() * 5.5;
parts.push({
x, y,
vx: Math.cos(a) * sp,
vy: Math.sin(a) * sp - 1.5,
life: 1,
decay: 0.012 + Math.random() * 0.014,
size: 1.5 + Math.random() * 2.5,
c: COLORS[(Math.random() * COLORS.length) | 0],
flash: false, r: 0
});
}
parts.push({ flash: true, x, y, life: 1, decay: 0.06, size: 0, r: 8, vx: 0, vy: 0, c: '#c4b5fd' });
if (!raf) raf = requestAnimationFrame(tick);
}

function tick() {
fx.clearRect(0, 0, canvas.width, canvas.height);
parts = parts.filter(p => p.life > 0);
for (const p of parts) {
p.life -= p.decay;
if (p.flash) {
p.r += 3.2;
fx.globalAlpha = Math.max(0, p.life * 0.35);
fx.fillStyle = p.c;
fx.beginPath(); fx.arc(p.x, p.y, p.r, 0, 7); fx.fill();
continue;
}
p.x += p.vx; p.y += p.vy;
p.vy += 0.085;
p.vx *= 0.985; p.vy *= 0.985;
fx.globalAlpha = Math.max(0, p.life);
fx.fillStyle = p.c;
fx.beginPath(); fx.arc(p.x, p.y, p.size, 0, 7); fx.fill();
}
fx.globalAlpha = 1;
if (parts.length) { raf = requestAnimationFrame(tick); }
else { raf = null; fx.clearRect(0, 0, canvas.width, canvas.height); }
}

document.addEventListener('pointerdown', (e) => burst(e.clientX, e.clientY));
}

// ===== 🛼 Smooth scrolling (inertia, desktop only) =====
function setupSmoothScroll() {
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (isTouch || reduced) return;

let targetY = window.scrollY;
let currentY = window.scrollY;
let rafId = null;
const EASE = 0.085;

window.addEventListener('wheel', (e) => {
if (e.ctrlKey) return; // pinch zoom
// don't hijack scrollable panels/inputs
if (e.target.closest('.ai-chat, textarea, select, .side-menu, .sidebar, .lesson-list, .chat-panel, .code-editor, pre')) return;

e.preventDefault();
const delta = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
const maxY = Math.max(0, document.documentElement.scrollHeight - innerHeight);
targetY = Math.max(0, Math.min(maxY, targetY + delta));
if (!rafId) rafId = requestAnimationFrame(tick);
}, { passive: false });

function tick() {
currentY += (targetY - currentY) * EASE;
if (Math.abs(targetY - currentY) < 0.5) {
currentY = targetY;
window.scrollTo(0, currentY);
rafId = null;
return;
}
window.scrollTo(0, currentY);
rafId = requestAnimationFrame(tick);
}

window.addEventListener('scroll', () => {
if (!rafId) { targetY = currentY = window.scrollY; }
});
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

// ===== FAB + Chat + Feedback (two icons, open only on click) =====
function setupFab() {
const closeAllPanels = () => {
chatPanel.hidden = true;
feedbackPanel.hidden = true;
};
fabAiBtn.addEventListener('click', (e) => {
e.stopPropagation();
const opening = chatPanel.hidden;
closeAllPanels();
if (opening) {
chatPanel.hidden = false;
if (aiChat.children.length === 0) {
addAIMessage('assistant', 'Hi! I am your Python tutor. Ask me anything about the lesson 🐍');
}
setTimeout(() => aiInput.focus(), 250);
}
});
fabFeedbackBtn.addEventListener('click', (e) => {
e.stopPropagation();
const opening = feedbackPanel.hidden;
closeAllPanels();
if (opening) {
feedbackPanel.hidden = false;
feedbackDone.hidden = true;
setTimeout(() => feedbackText.focus(), 250);
}
});
chatClose.addEventListener('click', closeAllPanels);
feedbackClose.addEventListener('click', closeAllPanels);
feedbackSend.addEventListener('click', () => {
const text = feedbackText.value.trim();
if (!text) { feedbackText.focus(); return; }
const subject = encodeURIComponent('Python Kit Feedback');
const body = encodeURIComponent(text);
window.location.href = `mailto:?subject=${subject}&body=${body}`;
feedbackText.value = '';
feedbackDone.hidden = false;
setTimeout(closeAllPanels, 1200);
});
document.addEventListener('click', (e) => {
if (!e.target.closest('.fab-wrap')) closeAllPanels();
});
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape') closeAllPanels();
});
}

// ===== Service Worker =====
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('/sw.js').catch(() => {});
}