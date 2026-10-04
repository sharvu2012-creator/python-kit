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
explanationContent.innerHTML = `
<div class="lang-toggle">
<button class="lang-btn ${!needsTr && currentLang !== 'pa' ? 'active' : ''}" data-lang="en">English</button>
<button class="lang-btn ${currentLang === 'pa' ? 'active' : ''}" data-lang="pa">ਪੰਜਾਬੀ</button>
</div>
<div class="explanation-text">${needsTr ? '🌐 Translating…' : lessonTextFor(lesson)}</div>
`;
document.querySelectorAll('.lang-btn').forEach(btn => {
btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

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

document.addEventListener('pointerdown', (e) => burst(e.clientX, e.clientY));
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

// ===== ROADMAP =====
function renderRoadmap() {
const path = $('roadPath');
path.innerHTML = '';

const total = lessons.length;
const doneCount = progress.completed.filter(i => i < total).length;
$('xpValue').textContent = progress.xp;
$('progressLabel').textContent = `${doneCount} / ${total}`;
$('progressFill').style.width = (doneCount / total * 100) + '%';

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
const quizState = { lesson: -1, q: 0, correct: 0, answered: false };

function setupQuiz() {
$('takeTestBtn').addEventListener('click', () => openQuiz(currentLessonIndex));
$('quizClose').addEventListener('click', closeQuiz);
$('quizNextBtn').addEventListener('click', nextQuestion);
$('quizRetryBtn').addEventListener('click', () => openQuiz(quizState.lesson));
$('quizContinueBtn').addEventListener('click', () => { closeQuiz(); showView('roadmap'); });
$('quizOverlay').addEventListener('click', (e) => { if (e.target === $('quizOverlay')) closeQuiz(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('quizOverlay').hidden) closeQuiz(); });
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
quizState.correct = 0;
quizState.answered = false;
$('quizTitle').textContent = `🧪 ${lesson.title.en}`;
$('quizResults').hidden = true;
$('quizBody').hidden = false;
renderQuizDots();
showQuestion();
$('quizOverlay').hidden = false;
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
if (right) quizState.correct++;

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
$('quizNextBtn').textContent = quizState.q === lessons[quizState.lesson].quiz.length - 1 ? 'See Results →' : 'Next →';
$('quizNextBtn').hidden = false;
}

function nextQuestion() {
if (quizState.q < lessons[quizState.lesson].quiz.length - 1) {
quizState.q++;
showQuestion();
} else {
showResults();
}
}

function showResults() {
const total = lessons[quizState.lesson].quiz.length;
const pct = Math.round(quizState.correct / total * 100);
const passed = quizState.correct >= Math.ceil(total * 0.66);

$('quizBody').hidden = true;
const res = $('quizResults');
res.hidden = false;

const stars = quizState.correct === total ? 3 : passed ? 2 : quizState.correct > 0 ? 1 : 0;
$('quizStars').innerHTML = [0, 1, 2].map(i =>
i < stars ? '⭐' : '<span class="dim">⭐</span>'
).join('');

$('quizScoreText').textContent = `${quizState.correct} / ${total} correct — ${pct}%`;
$('quizXpText').textContent = passed
? `+${quizState.correct * 10} XP earned! ${stars === 3 ? 'Perfect score! 🎉' : ''}`
: 'Score 67% to pass. Review the lesson and retry!';

if (passed && !isDone(quizState.lesson)) {
progress.completed.push(quizState.lesson);
}
if (passed) {
const prev = progress.scores[quizState.lesson] || 0;
progress.scores[quizState.lesson] = Math.max(prev, pct);
const xpGain = quizState.correct * 10;
progress.xp += xpGain;
saveProgress();
renderLessonList();
// 🎆 celebrate!
if (window.innerWidth && document.getElementById('fxCanvas')) {
setTimeout(() => document.dispatchEvent(new PointerEvent('pointerdown', { clientX: innerWidth / 2, clientY: innerHeight / 3 })), 200);
}
}
$('quizRetryBtn').textContent = passed ? '↻ Retry for better score' : '↻ Retry';
}

// ===== Service Worker =====
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('/sw.js').catch(() => {});
}