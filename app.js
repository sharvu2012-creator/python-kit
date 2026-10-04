// ===== App State =====
let currentLessonIndex = 0;
let currentLang = 'en';
let pyodide = null;
let pyodideReady = false;
let deferredInstallPrompt = null;

// ===== Progress (roadmap) =====
let progress = { completed: [], scores: {}, xp: 0 };
function loadProgress() {
try { const p = JSON.parse(localStorage.getItem('pk_progress')); if (p && p.completed) progress = p; } catch (e) {}
}
function saveProgress() {
localStorage.setItem('pk_progress', JSON.stringify(progress));
}
function isDone(i) { return progress.completed.includes(i); }
function isUnlocked(i) { return i === 0 || isDone(i - 1); }

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

// ===== UI translations (13 languages) =====
const I18N = {
en: { menu:'Menu', dashboard:'🏠 Dashboard', lessons:'📚 Lessons', allLessons:'All Lessons', explanation:'Explanation', playground:'Code Playground', run:'▶ Run', clear:'Clear', output:'Output', dark:'Dark', light:'Light', install:'📲 Install', aiTutor:'🤖 AI Tutor', askPh:'Ask a question...', send:'Send', feedback:'💬 Feedback', feedbackPh:"Tell us what's good or missing...", startLearning:'Start Learning →', howItWorks:'How it works', lessonOf:'Lesson {n} of {t}' },
pa: { menu:'ਮੈਨੂ', dashboard:'🏠 ਡੈਸ਼ਬੋਰਡ', lessons:'📚 ਪਾਠ', allLessons:'ਸਾਰੇ ਪਾਠ', explanation:'ਵਿਆਖਿਆ', playground:'ਕੋਡ ਮੈਦਾਨ', run:'▶ ਚਲਾਓ', clear:'ਸਾਫ਼ ਕਰੋ', output:'ਆਉਟਪੁੱਟ', dark:'ਡਾਰਕ', light:'ਲਾਈਟ', install:'📲 ਇੰਸਟਾਲ', aiTutor:'🤖 ਏਆਈ ਟਿਊਟਰ', askPh:'ਸਵਾਲ ਪੁੱਛੋ...', send:'ਭੇਜੋ', feedback:'💬 ਸੁਝਾਅ', feedbackPh:'ਦੱਸੋ ਕੀ ਚੰਗਾ ਹੈ ਜਾਂ ਕੀ ਘੱਟ ਹੈ...', startLearning:'ਸਿੱਖਣਾ ਸ਼ੁਰੂ ਕਰੋ →', howItWorks:'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ', lessonOf:'ਪਾਠ {n} / {t}' },
hi: { menu:'मेनू', dashboard:'🏠 डैशबोर्ड', lessons:'📚 पाठ', allLessons:'सभी पाठ', explanation:'व्याख्या', playground:'कोड मैदान', run:'▶ चलाएं', clear:'साफ़ करें', output:'आउटपुट', dark:'डार्क', light:'लाइट', install:'📲 इंस्टॉल', aiTutor:'🤖 एआई ट्यूटर', askPh:'सवाल पूछें...', send:'भेजें', feedback:'💬 प्रतिक्रिया', feedbackPh:'बताएं क्या अच्छा है या क्या कमी है...', startLearning:'सीखना शुरू करें →', howItWorks:'यह कैसे काम करता है', lessonOf:'पाठ {n} / {t}' },
bn: { menu:'মেনু', dashboard:'🏠 ড্যাশবোর্ড', lessons:'📚 পাঠ', allLessons:'সব পাঠ', explanation:'ব্যাখ্যা', playground:'কোড ময়দান', run:'▶ চালান', clear:'মুছুন', output:'আউটপুট', dark:'ডার্ক', light:'লাইট', install:'📲 ইনস্টল', aiTutor:'🤖 এআই টিউটর', askPh:'প্রশ্ন করুন...', send:'পাঠান', feedback:'💬 মতামত', feedbackPh:'বলুন কী ভালো বা কী কম...', startLearning:'শেখা শুরু করুন →', howItWorks:'এটি কীভাবে কাজ করে', lessonOf:'পাঠ {n} / {t}' },
te: { menu:'మెనూ', dashboard:'🏠 డాష్‌బోర్డ్', lessons:'📚 పాఠాలు', allLessons:'అన్ని పాఠాలు', explanation:'వివరణ', playground:'కోడ్ మైదానం', run:'▶ అమలు చేయండి', clear:'క్లియర్', output:'అవుట్‌పుట్', dark:'డార్క్', light:'లైట్', install:'📲 ఇన్‌స్టాల్', aiTutor:'🤖 AI ట్యూటర్', askPh:'ప్రశ్న అడగండి...', send:'పంపండి', feedback:'💬 అభిప్రాయం', feedbackPh:'ఏమి బాగుంది లేదా ఏమి లోపం చెప్పండి...', startLearning:'నేర్చుకోవడం ప్రారంభించండి →', howItWorks:'ఇది ఎలా పని చేస్తుంది', lessonOf:'పాఠం {n} / {t}' },
mr: { menu:'मेनू', dashboard:'🏠 डॅशबोर्ड', lessons:'📚 धडे', allLessons:'सर्व धडे', explanation:'स्पष्टीकरण', playground:'कोड मैदान', run:'▶ चालवा', clear:'पुसा', output:'आउटपुट', dark:'डार्क', light:'लाइट', install:'📲 इन्स्टॉल', aiTutor:'🤖 एआय ट्युटर', askPh:'प्रश्न विचारा...', send:'पाठवा', feedback:'💬 अभिप्राय', feedbackPh:'काय छान आहे किंवा काय कमी आहे सांगा...', startLearning:'शिकायला सुरुवात करा →', howItWorks:'हे कसे काम करते', lessonOf:'धडा {n} / {t}' },
ta: { menu:'மெனு', dashboard:'🏠 டாஷ்போர்டு', lessons:'📚 பாடங்கள்', allLessons:'அனைத்து பாடங்கள்', explanation:'விளக்கம்', playground:'கோட் மைதானம்', run:'▶ இயக்கு', clear:'அழி', output:'வெளியீடு', dark:'டார்க்', light:'லைட்', install:'📲 நிறுவு', aiTutor:'🤖 AI டியூட்டர்', askPh:'கேள்வி கேளுங்கள்...', send:'அனுப்பு', feedback:'💬 கருத்து', feedbackPh:'எது நல்லது அல்லது எது குறைவு என சொல்லுங்கள்...', startLearning:'கற்கத் தொடங்கு →', howItWorks:'இது எப்படி வேலை செய்கிறது', lessonOf:'பாடம் {n} / {t}' },
gu: { menu:'મેનૂ', dashboard:'🏠 ડેશબોર્ડ', lessons:'📚 પાઠ', allLessons:'બધા પાઠ', explanation:'સમજૂતી', playground:'કોડ મેદાન', run:'▶ ચલાવો', clear:'સાફ કરો', output:'આઉટપુટ', dark:'ડાર્ક', light:'લાઇટ', install:'📲 ઇન્સ્ટોલ', aiTutor:'🤖 AI ટ્યુટર', askPh:'પ્રશ્ન પૂછો...', send:'મોકલો', feedback:'💬 પ્રતિસાદ', feedbackPh:'શું સારું છે કે શું ઓછું છે જણાવો...', startLearning:'શીખવાનું શરૂ કરો →', howItWorks:'આ કેવી રીતે કામ કરે છે', lessonOf:'પાઠ {n} / {t}' },
kn: { menu:'ಮೆನು', dashboard:'🏠 ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', lessons:'📚 ಪಾಠಗಳು', allLessons:'ಎಲ್ಲಾ ಪಾಠಗಳು', explanation:'ವಿವರಣೆ', playground:'ಕೋಡ್ ಮೈದಾನ', run:'▶ ರನ್', clear:'ಕ್ಲಿಯರ್', output:'ಔಟ್‌ಪುಟ್', dark:'ಡಾರ್ಕ್', light:'ಲೈಟ್', install:'📲 ಇನ್‌ಸ್ಟಾಲ್', aiTutor:'🤖 AI ಟ್ಯೂಟರ್', askPh:'ಪ್ರಶ್ನೆ ಕೇಳಿ...', send:'ಕಳುಹಿಸಿ', feedback:'💬 ಪ್ರತಿಕ್ರಿಯೆ', feedbackPh:'ಏನು ಒಳ್ಳೆಯದು ಅಥವಾ ಏನು ಕಡಿಮೆ ಹೇಳಿ...', startLearning:'ಕಲಿಯಲು ಪ್ರಾರಂಭಿಸಿ →', howItWorks:'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ', lessonOf:'ಪಾಠ {n} / {t}' },
or: { menu:'ମେନୁ', dashboard:'🏠 ଡ୍ୟାସବୋର୍ଡ', lessons:'📚 ପାଠ', allLessons:'ସମସ୍ତ ପାଠ', explanation:'ବ୍ୟାଖ୍ୟା', playground:'କୋଡ୍ ମଇଦାନ', run:'▶ ଚଲାନ୍ତୁ', clear:'ସଫା କରନ୍ତୁ', output:'ଆଉଟପୁଟ୍', dark:'ଡାର୍କ', light:'ଲାଇଟ୍', install:'📲 ଇନଷ୍ଟଲ', aiTutor:'🤖 AI ଟ୍ୟୁଟର', askPh:'ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ...', send:'ପଠାନ୍ତୁ', feedback:'💬 ମତାମତ', feedbackPh:'କେଉଁଟି ଭଲ କିମ୍ବା କେଉଁଟି କମ କୁହନ୍ତୁ...', startLearning:'ଶିଖିବା ଆରମ୍ଭ କରନ୍ତୁ →', howItWorks:'ଏହା କିପରି କାମ କରେ', lessonOf:'ପାଠ {n} / {t}' },
ml: { menu:'മെനു', dashboard:'🏠 ഡാഷ്ബോർഡ്', lessons:'📚 പാഠങ്ങൾ', allLessons:'എല്ലാ പാഠങ്ങളും', explanation:'വിശദീകരണം', playground:'കോഡ് മൈദാനം', run:'▶ റൺ', clear:'ക്ലിയർ', output:'ഔട്ട്‌പുട്ട്', dark:'ഡാർക്ക്', light:'ലൈറ്റ്', install:'📲 ഇൻസ്റ്റാൾ', aiTutor:'🤖 AI ട്യൂട്ടർ', askPh:'ചോദ്യം ചോദിക്കൂ...', send:'അയയ്ക്കൂ', feedback:'💬 അഭിപ്രായം', feedbackPh:'എന്താണ് നല്ലത് അല്ലെങ്കിൽ എന്ത് കുറവ് എന്ന് പറയൂ...', startLearning:'പഠനം ആരംഭിക്കൂ →', howItWorks:'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു', lessonOf:'പാഠം {n} / {t}' },
as: { menu:'মেনু', dashboard:'🏠 ডেছব’ৰ্ড', lessons:'📚 পাঠ', allLessons:'সকলো পাঠ', explanation:'ব্যাখ্যা', playground:'ক’ড মৈদান', run:'▶ চলাওক', clear:'চাফা কৰক', output:'আউটপুট', dark:'ডাৰ্ক', light:'লাইট', install:'📲 ইনষ্টল', aiTutor:'🤖 AI টিউটৰ', askPh:'প্ৰশ্ন সোধক...', send:'পঠিয়াওক', feedback:'💬 মতামত', feedbackPh:'কি ভাল বা কি কম কওক...', startLearning:'শিকা আৰম্ভ কৰক →', howItWorks:'ই কেনে কাম কৰে', lessonOf:'পাঠ {n} / {t}' },
ur: { menu:'مینو', dashboard:'🏠 ڈیش بورڈ', lessons:'📚 اسباق', allLessons:'تمام اسباق', explanation:'وضاحت', playground:'کوڈ میدان', run:'▶ چلائیں', clear:'صاف کریں', output:'آؤٹ پٹ', dark:'ڈارک', light:'لائٹ', install:'📲 انسٹال', aiTutor:'🤖 اے آئی ٹیوٹر', askPh:'سوال پوچھیں...', send:'بھیجیں', feedback:'💬 رائے', feedbackPh:'بتائیں کیا اچھا ہے یا کیا کمی ہے...', startLearning:'سیکھنا شروع کریں ←', howItWorks:'یہ کیسے کام کرتا ہے', lessonOf:'سبق {n} / {t}' }
};

function applyLang() {
const d = I18N[currentLang] || I18N.en;
document.querySelectorAll('[data-i18n]').forEach(el => {
const k = el.getAttribute('data-i18n');
if (d[k] !== undefined) el.textContent = d[k];
});
document.querySelectorAll('[data-i18n-ph]').forEach(el => {
const k = el.getAttribute('data-i18n-ph');
if (d[k] !== undefined) el.setAttribute('placeholder', d[k]);
});
document.documentElement.dir = currentLang === 'ur' ? 'rtl' : 'ltr';
document.documentElement.lang = currentLang;
}

// ===== Live page + lesson translation =====
let pageNodes = null;
let translateRun = 0;
function collectPageNodes() {
const sels = '.hero-title, .hero-sub, .study h3, .study > p, .fact-label, .reason h4, .reason p, .usecase strong, .usecase span, .code-note span, .step p, .how h3, .site-footer p, .bento-card h3, .bento-card p';
pageNodes = Array.from(document.querySelectorAll(sels)).map(el => ({ el, en: el.textContent.trim() }));
}
function showTrToast(show) {
let t = document.getElementById('trToast');
if (!t) {
t = document.createElement('div');
t.id = 'trToast';
t.className = 'tr-toast';
t.textContent = '🌐 Translating…';
document.body.appendChild(t);
}
t.classList.toggle('show', show);
}
let pageTranslateRun = 0;
async function translatePage(lang) {
if (!pageNodes) collectPageNodes();
const run = ++pageTranslateRun;
if (lang === 'en') {
pageNodes.forEach(n => { n.el.textContent = n.en; });
return;
}
showTrToast(true);
try {
const texts = pageNodes.map(n => n.en);
const out = await TranslateKit.many(texts, lang);
if (lang !== currentLang) return; // user switched again — discard stale result
out.forEach((t, i) => { if (t) pageNodes[i].el.textContent = t; });
} catch (e) { /* keep english on failure */ }
if (lang === currentLang) showTrToast(false);
}

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
collectPageNodes();
loadProgress();
updateStreak();
renderLessonList();
renderPills();
loadTheme();
loadLanguage();
setupEventListeners();
setupMenu();
setupScrollReveal();
setupFireworks();
setupInstall();
setupFab();
setupQuiz();
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
if (name === 'roadmap') renderRoadmap();
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
const d = I18N[currentLang] || I18N.en;
const meta = (n, t) => (d.lessonOf || 'Lesson {n} of {t}').replace('{n}', n).replace('{t}', t);
lessonList.innerHTML = '';
lessons.forEach((lesson, i) => {
const li = document.createElement('li');
li.className = 'lesson-item' + (i === currentLessonIndex ? ' active' : '');
li.style.animationDelay = (i * 0.05) + 's';
li.innerHTML = `
<div class="lesson-title">${lessonTitleFor(lesson)}</div>
<div class="lesson-meta">${meta(i + 1, lessons.length)}</div>
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
async function loadLesson(index) {
currentLessonIndex = index;
const lesson = lessons[index];

document.querySelectorAll('.lesson-item').forEach((li, i) => {
li.classList.toggle('active', i === index);
});

const needsTr = currentLang !== 'en' && currentLang !== 'pa';
explanationContent.innerHTML = `<div class="explanation-text">${needsTr ? '🌐 Translating…' : lessonTextFor(lesson)}</div>`;

if (needsTr) {
const langAtCall = currentLang;
try {
const [trText, trTitle] = await Promise.all([
TranslateKit.one(lesson.text.en, langAtCall),
TranslateKit.one(lesson.title.en, langAtCall)
]);
if (currentLang !== langAtCall) return; // user switched again — discard stale result
const expText = explanationContent.querySelector('.explanation-text');
if (expText) expText.textContent = trText;
renderLessonListTranslated(trTitle, index);
} catch (e) {
const expText = explanationContent.querySelector('.explanation-text');
if (expText && currentLang === langAtCall) expText.textContent = lesson.text.en;
}
}

codeEditor.value = lesson.starter;
outputDisplay.textContent = 'Output appears here...';

// test button state
const ttb = $('takeTestBtn');
if (isUnlocked(index)) {
ttb.disabled = false;
ttb.innerHTML = isDone(index) ? '🧪 Retake Test' : '🧪 Take Test';
} else {
ttb.disabled = true;
ttb.innerHTML = '🔒 Locked';
}
}

function renderLessonListTranslated(translatedTitle, activeIndex) {
// update the active lesson's title in the sidebar with translated version
document.querySelectorAll('.lesson-item').forEach((li, i) => {
if (i === activeIndex) {
const t = li.querySelector('.lesson-title');
if (t) t.textContent = translatedTitle;
}
});
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
renderLessonList();
loadLesson(currentLessonIndex);
applyLang();
translatePage(lang);
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
if (!('IntersectionObserver' in window)) {
document.querySelectorAll('.reveal, .reveal-fine').forEach(el => el.classList.add('in'));
return;
}

// 1) tag small elements + text FIRST (before querying!)
document.querySelectorAll(
'.study h3, .study > p, .fact, .reason, .usecase, .code-block, .code-note, .step, .hero-title, .hero-sub, .how h3'
).forEach(el => el.classList.add('reveal-fine'));

// 2) stagger small elements within their parent section
document.querySelectorAll('.study, .hero, .how').forEach(parent => {
parent.querySelectorAll('.reveal-fine').forEach((k, i) => {
k.style.transitionDelay = (0.12 + i * 0.05) + 's';
});
});

// 3) cascade cards inside grids
document.querySelectorAll('.bento-grid, .reason-grid, .usecase-grid, .fact-row, .steps').forEach(grid => {
Array.from(grid.children).forEach((child, i) => {
if (child.classList.contains('reveal')) {
child.style.transitionDelay = (i * 0.07) + 's';
}
});
});

// 4) NOW collect everything (after tagging!)
const els = document.querySelectorAll('.reveal, .reveal-fine');

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

document.addEventListener('pointerdown', (e) => {
burst(e.clientX, e.clientY);
sfx.firework();
});
}

// smooth scrolling: native CSS scroll-behavior only (custom inertia removed — was too slow)

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
// ===== Feedback → FormSubmit (works for everyone: no mail app / Gmail / account needed) =====
feedbackSend.addEventListener('click', async () => {
const text = feedbackText.value.trim();
if (!text) { feedbackText.focus(); return; }

feedbackSend.disabled = true;
feedbackSend.textContent = 'Sending…';
feedbackDone.hidden = true;

try {
const r = await fetch('https://formsubmit.co/ajax/sharvu2012@gmail.com', {
method: 'POST',
headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
body: JSON.stringify({
_subject: 'Python Kit Feedback',
message: text,
lesson: lessons[currentLessonIndex].title.en,
language: currentLang,
_template: 'table',
_captcha: 'false'
})
});
const data = await r.json();
if (r.ok && (data.success === 'true' || data.success === true)) {
feedbackText.value = '';
feedbackDone.textContent = 'Thanks! Sent 💜';
feedbackDone.style.color = '';
feedbackDone.hidden = false;
setTimeout(closeAllPanels, 1600);
} else {
throw new Error(data.message || 'send failed');
}
} catch (e) {
feedbackDone.textContent = 'Could not send — check internet and try again.';
feedbackDone.style.color = 'var(--danger)';
feedbackDone.hidden = false;
} finally {
feedbackSend.disabled = false;
feedbackSend.textContent = 'Send';
}
});
document.addEventListener('click', (e) => {
if (!e.target.closest('.fab-wrap')) closeAllPanels();
});
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape') closeAllPanels();
});
}

// ===== 🔊 SFX (synthesized, no files) =====
const sfx = (() => {
let ac = null;
function ctx() {
if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
if (ac.state === 'suspended') ac.resume();
return ac;
}
function tone(freq, dur, type = 'sine', vol = 0.11, when = 0) {
try {
const a = ctx();
const o = a.createOscillator();
const g = a.createGain();
o.type = type; o.frequency.value = freq;
const t0 = a.currentTime + when;
g.gain.setValueAtTime(0, t0);
g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
o.connect(g).connect(a.destination);
o.start(t0); o.stop(t0 + dur + 0.03);
} catch (e) {}
}
function noise(dur = 0.28, vol = 0.07) {
try {
const a = ctx();
const n = Math.floor(a.sampleRate * dur);
const buf = a.createBuffer(1, n, a.sampleRate);
const d = buf.getChannelData(0);
for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
const s = a.createBufferSource(); s.buffer = buf;
const g = a.createGain(); g.gain.value = vol;
s.connect(g).connect(a.destination); s.start();
} catch (e) {}
}
return {
click: () => tone(600, 0.06, 'square', 0.05),
correct: () => { tone(660, 0.09); tone(880, 0.13, 'sine', 0.11, 0.08); },
wrong: () => tone(170, 0.22, 'sawtooth', 0.09),
pass: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.17, 'sine', 0.11, i * 0.09)),
firework: () => noise(),
complete: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'sine', 0.11, i * 0.11))
};
})();

// ===== 🔥 DAILY STREAK =====
function updateStreak() {
const today = new Date().toISOString().slice(0, 10);
let s = { last: '', count: 0 };
try { const saved = JSON.parse(localStorage.getItem('pk_streak')); if (saved && saved.last) s = saved; } catch (e) {}
if (s.last !== today) {
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
s.count = (s.last === yesterday) ? s.count + 1 : 1;
s.last = today;
localStorage.setItem('pk_streak', JSON.stringify(s));
}
const badge = $('streakBadge');
if (badge) {
$('streakCount').textContent = s.count;
badge.hidden = s.count === 0;
badge.title = s.count + ' day streak!';
}
}

// ===== 🎓 CERTIFICATE + 📤 SHARE CARD =====
function roundRectStroke(x, px, py, w, h, r) {
x.beginPath();
x.moveTo(px + r, py);
x.arcTo(px + w, py, px + w, py + h, r);
x.arcTo(px + w, py + h, px, py + h, r);
x.arcTo(px, py + h, px, py, r);
x.arcTo(px, py, px + w, py, r);
x.closePath(); x.stroke();
}
function downloadCanvas(c, filename) {
const a = document.createElement('a');
a.href = c.toDataURL('image/png');
a.download = filename;
a.click();
}
function drawCertificate(name) {
const c = document.createElement('canvas');
c.width = 1600; c.height = 1131;
const x = c.getContext('2d');
const g = x.createLinearGradient(0, 0, 1600, 1131);
g.addColorStop(0, '#241547'); g.addColorStop(0.5, '#150e2e'); g.addColorStop(1, '#0f0a1e');
x.fillStyle = g; x.fillRect(0, 0, 1600, 1131);
x.fillStyle = 'rgba(167,139,250,0.08)';
for (let gx = 44; gx < 1600; gx += 48) for (let gy = 44; gy < 1131; gy += 48) {
x.beginPath(); x.arc(gx, gy, 1.5, 0, 7); x.fill();
}
x.strokeStyle = '#8b5cf6'; x.lineWidth = 8; roundRectStroke(x, 50, 50, 1500, 1031, 28);
x.strokeStyle = 'rgba(196,181,253,0.5)'; x.lineWidth = 2; roundRectStroke(x, 70, 70, 1460, 991, 22);
x.textAlign = 'center';
x.font = '90px serif'; x.fillText('🐍', 800, 195);
x.fillStyle = '#ede9fe'; x.font = '800 62px "Segoe UI", sans-serif';
x.fillText('CERTIFICATE', 800, 315);
x.fillStyle = '#a78bfa'; x.font = '600 28px "Segoe UI", sans-serif';
x.fillText('OF COMPLETION', 800, 360);
x.strokeStyle = '#8b5cf6'; x.lineWidth = 2;
x.beginPath(); x.moveTo(550, 395); x.lineTo(1050, 395); x.stroke();
x.fillStyle = '#a79fc7'; x.font = '400 25px "Segoe UI", sans-serif';
x.fillText('This certificate is proudly presented to', 800, 475);
const grad = x.createLinearGradient(400, 0, 1200, 0);
grad.addColorStop(0, '#c4b5fd'); grad.addColorStop(1, '#8b5cf6');
x.fillStyle = grad; x.font = '800 74px "Segoe UI", sans-serif';
x.fillText(name, 800, 570);
x.strokeStyle = 'rgba(196,181,253,0.6)';
x.beginPath(); x.moveTo(500, 598); x.lineTo(1100, 598); x.stroke();
x.fillStyle = '#a79fc7'; x.font = '400 25px "Segoe UI", sans-serif';
x.fillText('for completing all 10 lessons of Python Kit', 800, 668);
x.fillText('and mastering the fundamentals of Python programming', 800, 708);
x.fillStyle = '#ede9fe'; x.font = '700 30px "Segoe UI", sans-serif';
x.fillText('⭐ ' + progress.xp + ' XP Earned', 800, 788);
const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
x.fillStyle = '#a79fc7'; x.font = '400 22px "Segoe UI", sans-serif';
x.fillText(date, 800, 838);
x.strokeStyle = 'rgba(196,181,253,0.5)';
x.beginPath(); x.moveTo(1150, 950); x.lineTo(1400, 950); x.stroke();
x.fillStyle = '#a79fc7'; x.font = 'italic 24px "Segoe UI", sans-serif';
x.fillText('Python Kit', 1275, 928);
x.fillStyle = '#7c7398'; x.font = '400 18px "Segoe UI", sans-serif';
x.fillText('python-kit.vercel.app', 1275, 974);
for (let i = 0; i < 26; i++) {
const fx = 120 + Math.random() * 220, fy = 90 + Math.random() * 200;
x.fillStyle = ['#a78bfa', '#c4b5fd', '#8b5cf6'][i % 3];
x.globalAlpha = 0.5 + Math.random() * 0.5;
x.beginPath(); x.arc(fx, fy, 2 + Math.random() * 3, 0, 7); x.fill();
}
x.globalAlpha = 1;
return c;
}
function drawShareCard(lessonTitle, pct, starsCount) {
const c = document.createElement('canvas');
c.width = 1200; c.height = 630;
const x = c.getContext('2d');
const g = x.createLinearGradient(0, 0, 1200, 630);
g.addColorStop(0, '#4c1d95'); g.addColorStop(1, '#0f0a1e');
x.fillStyle = g; x.fillRect(0, 0, 1200, 630);
const rg = x.createRadialGradient(600, 260, 20, 600, 260, 300);
rg.addColorStop(0, 'rgba(196,181,253,0.35)'); rg.addColorStop(1, 'rgba(196,181,253,0)');
x.fillStyle = rg; x.fillRect(0, 0, 1200, 630);
x.textAlign = 'center';
x.font = '78px serif'; x.fillText('🐍', 600, 128);
x.fillStyle = '#a79fc7'; x.font = '600 30px "Segoe UI", sans-serif';
x.fillText('I scored', 600, 215);
const grad = x.createLinearGradient(300, 0, 900, 0);
grad.addColorStop(0, '#c4b5fd'); grad.addColorStop(1, '#8b5cf6');
x.fillStyle = grad; x.font = '800 128px "Segoe UI", sans-serif';
x.fillText(pct + '%', 600, 345);
x.font = '46px serif'; x.fillText(starsCount > 0 ? '⭐'.repeat(starsCount) : '💜', 600, 420);
x.fillStyle = '#ede9fe'; x.font = '700 33px "Segoe UI", sans-serif';
x.fillText('on "' + lessonTitle + '"', 600, 488);
x.fillStyle = '#a78bfa'; x.font = '600 24px "Segoe UI", sans-serif';
x.fillText('🐍 Python Kit · Learn free at python-kit.vercel.app', 600, 575);
return c;
}

// ===== ROADMAP =====
function renderRoadmap() {
const path = $('roadPath');
path.innerHTML = '';

const total = lessons.length;
const doneCount = progress.completed.filter(i => i < total).length;
$('xpValue').textContent = progress.xp;
$('progressLabel').textContent = `${doneCount} / ${total}`;
$('progressFill').style.width = (doneCount / total * 100) + '%';
$('certBtn').hidden = doneCount < total;

lessons.forEach((lesson, i) => {
const done = isDone(i);
const unlocked = isUnlocked(i);
const node = document.createElement('div');
node.className = 'road-node ' + (done ? 'done' : unlocked ? 'current' : 'locked');
node.innerHTML = `
<div class="road-num">${done ? '✓' : unlocked ? (i + 1) : '🔒'}</div>
<div class="road-info">
<div class="road-title">${lesson.title.en}</div>
<div class="road-sub">${done ? 'Completed' : unlocked ? 'Tap to start' : 'Locked'}</div>
</div>
${done && progress.scores[i] != null ? `<div class="road-score-tag">${progress.scores[i]}%</div>` : ''}
`;
node.addEventListener('click', () => {
if (!unlocked) {
node.classList.remove('shake');
void node.offsetWidth;
node.classList.add('shake');
showTrToastText('🔒 Complete the previous lesson first!');
return;
}
loadLesson(i);
showView('lessons');
});
path.appendChild(node);
});
}

function showTrToastText(text) {
let t = document.getElementById('trToast');
if (!t) {
t = document.createElement('div');
t.id = 'trToast';
t.className = 'tr-toast';
document.body.appendChild(t);
}
t.textContent = text;
t.classList.add('show');
clearTimeout(t._hideTimer);
t._hideTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

// ===== QUIZ ENGINE =====
const quizState = { lesson: -1, q: 0, mcqCorrect: 0, codePassed: 0, answered: false };

function setupQuiz() {
$('takeTestBtn').addEventListener('click', () => openQuiz(currentLessonIndex));
$('quizClose').addEventListener('click', closeQuiz);
$('quizNextBtn').addEventListener('click', nextQuestion);
$('quizRetryBtn').addEventListener('click', () => openQuiz(quizState.lesson));
$('quizContinueBtn').addEventListener('click', () => { closeQuiz(); showView('roadmap'); });
$('quizOverlay').addEventListener('click', (e) => { if (e.target === $('quizOverlay')) closeQuiz(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('quizOverlay').hidden) closeQuiz(); });
// code test step
$('runTestsBtn').addEventListener('click', runCodeTests);
$('codeContinueBtn').addEventListener('click', showResults);
// share
$('shareBtn').addEventListener('click', shareResult);
// certificate
$('certBtn').addEventListener('click', () => { $('certOverlay').hidden = false; setTimeout(() => $('certName').focus(), 200); });
$('certClose').addEventListener('click', () => { $('certOverlay').hidden = true; });
$('certOverlay').addEventListener('click', (e) => { if (e.target === $('certOverlay')) $('certOverlay').hidden = true; });
$('certGenBtn').addEventListener('click', generateCertificate);
$('certName').addEventListener('keydown', (e) => { if (e.key === 'Enter') generateCertificate(); });
}

function openQuiz(lessonIdx) {
const lesson = lessons[lessonIdx];
if (!lesson.quiz || !lesson.quiz.length) return;
if (!isUnlocked(lessonIdx)) {
showTrToastText('🔒 Complete the previous lesson first!');
return;
}
quizState.lesson = lessonIdx;
quizState.q = 0;
quizState.mcqCorrect = 0;
quizState.codePassed = 0;
quizState.answered = false;
$('quizTitle').textContent = `🧪 ${lesson.title.en}`;
$('quizResults').hidden = true;
$('quizCodeStep').hidden = true;
$('quizBody').hidden = false;
renderQuizDots();
showQuestion();
$('quizOverlay').hidden = false;
sfx.click();
}

function closeQuiz() { $('quizOverlay').hidden = true; }

function renderQuizDots() {
const total = lessons[quizState.lesson].quiz.length;
const wrap = $('quizProgress');
wrap.innerHTML = '';
for (let i = 0; i < total; i++) {
const d = document.createElement('div');
d.className = 'quiz-dot' + (i === quizState.q ? ' active' : '');
d.dataset.i = i;
wrap.appendChild(d);
}
}

function showQuestion() {
const quiz = lessons[quizState.lesson].quiz;
const item = quiz[quizState.q];
quizState.answered = false;
renderQuizDots();
$('quizQuestion').textContent = item.q;
$('quizExplain').hidden = true;
$('quizNextBtn').hidden = true;
const wrap = $('quizOptions');
wrap.innerHTML = '';
item.options.forEach((opt, i) => {
const btn = document.createElement('button');
btn.className = 'quiz-opt';
btn.textContent = opt;
btn.addEventListener('click', () => selectOption(btn, i));
wrap.appendChild(btn);
});
}

function selectOption(btn, i) {
if (quizState.answered) return;
quizState.answered = true;
const item = lessons[quizState.lesson].quiz[quizState.q];
const right = i === item.answer;
if (right) { quizState.mcqCorrect++; sfx.correct(); } else { sfx.wrong(); }

btn.classList.add(right ? 'correct' : 'wrong');
const opts = $('quizOptions').children;
for (const o of opts) {
o.disabled = true;
if (o.textContent === item.options[item.answer]) o.classList.add('correct');
}

const dot = $('quizProgress').children[quizState.q];
if (dot) dot.classList.add(right ? 'right' : 'wrong');

const ex = $('quizExplain');
ex.textContent = (right ? '✅ Correct! ' : '💡 ') + item.explain;
ex.hidden = false;
const hasMore = quizState.q < lessons[quizState.lesson].quiz.length - 1;
const hasCode = !!lessons[quizState.lesson].codeChallenge;
$('quizNextBtn').textContent = hasMore ? 'Next →' : hasCode ? '💻 Code Challenge →' : 'See Results →';
$('quizNextBtn').hidden = false;
}

function nextQuestion() {
if (quizState.q < lessons[quizState.lesson].quiz.length - 1) {
quizState.q++;
showQuestion();
} else if (lessons[quizState.lesson].codeChallenge) {
showCodeStep();
} else {
showResults();
}
}

// ===== 💻 CODE CHALLENGE (graded by real Pyodide) =====
function showCodeStep() {
const cc = lessons[quizState.lesson].codeChallenge;
$('quizBody').hidden = true;
$('quizCodeStep').hidden = false;
$('codePrompt').textContent = '💻 ' + cc.prompt;
$('codeAnswer').value = cc.starter;
$('testResults').innerHTML = '';
$('codeContinueBtn').hidden = true;
$('runTestsBtn').disabled = false;
$('runTestsBtn').textContent = '▶ Run Tests';
renderQuizDots();
}

async function runCodeTests() {
const cc = lessons[quizState.lesson].codeChallenge;
const code = $('codeAnswer').value;
const wrap = $('testResults');
const btn = $('runTestsBtn');

if (!pyodideReady) {
wrap.innerHTML = '<div class="test-row test-info">⏳ Python is still loading — try again in a few seconds…</div>';
return;
}

btn.disabled = true;
btn.textContent = 'Running…';
wrap.innerHTML = '';
quizState.codePassed = 0;

for (let i = 0; i < cc.tests.length; i++) {
const t = cc.tests[i];
const row = document.createElement('div');
row.className = 'test-row';
row.innerHTML = `<span class="test-label">Test ${i + 1}</span> <span class="test-wait">⏳</span>`;
wrap.appendChild(row);
}

for (let i = 0; i < cc.tests.length; i++) {
const t = cc.tests[i];
const row = wrap.children[i];
let pass = false, err = '';
try {
if (t.stdout) {
let out = '';
pyodide.setStdout({ batched: (s) => { out += s + '\n'; } });
await pyodide.runPythonAsync(code);
pass = out.includes(t.stdout);
err = pass ? '' : 'Output was: ' + (out.trim().slice(0, 60) || '(nothing)');
} else {
await pyodide.runPythonAsync(code);
const result = await pyodide.runPythonAsync(t.expr);
pass = !!result;
err = pass ? '' : t.expr + ' → False';
}
} catch (e) {
err = String(e.message || e).split('\n').slice(-2)[0].slice(0, 90);
}
if (pass) quizState.codePassed++;
row.innerHTML = `<span class="test-label">${t.stdout ? 'Output check' : '<code>' + t.expr + '</code>'}</span> <span class="${pass ? 'test-pass' : 'test-fail'}">${pass ? '✓' : '✗ ' + err}</span>`;
row.classList.add(pass ? 'test-row-pass' : 'test-row-fail');
}

btn.textContent = '↻ Run Again';
btn.disabled = false;
$('codeContinueBtn').hidden = false;
if (quizState.codePassed === cc.tests.length) sfx.correct();
}

function showResults() {
const lesson = lessons[quizState.lesson];
const cc = lesson.codeChallenge;
const total = lesson.quiz.length + (cc ? cc.tests.length : 0);
const correct = quizState.mcqCorrect + quizState.codePassed;
const pct = Math.round(correct / total * 100);
const passed = correct >= Math.ceil(total * 0.66);

$('quizBody').hidden = true;
$('quizCodeStep').hidden = true;
const res = $('quizResults');
res.hidden = false;

const stars = correct === total ? 3 : passed ? 2 : correct > 0 ? 1 : 0;
quizState.lastPct = pct;
quizState.lastStars = stars;
$('quizStars').innerHTML = [0, 1, 2].map(i =>
i < stars ? '⭐' : '<span class="dim">⭐</span>'
).join('');

$('quizScoreText').textContent = `${correct} / ${total} correct — ${pct}%`;
$('quizXpText').textContent = passed
? `+${correct * 5} XP earned! ${stars === 3 ? 'Perfect score! 🎉' : ''}`
: 'Score 67% to pass. Review the lesson and retry!';

if (passed && !isDone(quizState.lesson)) {
progress.completed.push(quizState.lesson);
}
if (passed) {
const prev = progress.scores[quizState.lesson] || 0;
progress.scores[quizState.lesson] = Math.max(prev, pct);
progress.xp += correct * 5;
saveProgress();
renderLessonList();
updateStreak();
sfx.pass();
setTimeout(() => document.dispatchEvent(new PointerEvent('pointerdown', { clientX: innerWidth / 2, clientY: innerHeight / 3 })), 200);
}
$('quizRetryBtn').textContent = passed ? '↻ Retry for better score' : '↻ Retry';
}

// ===== 📤 SHARE RESULT =====
function shareResult() {
const lesson = lessons[quizState.lesson];
const c = drawShareCard(lesson.title.en, quizState.lastPct || 0, quizState.lastStars || 0);
downloadCanvas(c, 'python-kit-score.png');
sfx.click();
}

// ===== 🎓 CERTIFICATE =====
function generateCertificate() {
const name = $('certName').value.trim() || 'Python Learner';
const c = drawCertificate(name);
downloadCanvas(c, 'python-kit-certificate.png');
sfx.complete();
showTrToastText('🎓 Certificate downloaded!');
$('certOverlay').hidden = true;
}

// ===== Service Worker =====
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('/sw.js').catch(() => {});
}