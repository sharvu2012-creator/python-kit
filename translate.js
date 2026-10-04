// ===== Free on-the-fly translation (gtx endpoint, no API key) =====
const TranslateKit = (() => {
const mem = {};

function cacheGet(k) {
if (k in mem) return mem[k];
try { const v = localStorage.getItem('trk_' + k); if (v) { mem[k] = v; return v; } } catch (e) {}
return null;
}
function cacheSet(k, v) {
mem[k] = v;
try { localStorage.setItem('trk_' + k, v); } catch (e) {}
}
function hash(s) {
let h = 0;
for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
return 'h' + (h >>> 0).toString(36);
}

async function gtx(text, tl) {
const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl='
+ encodeURIComponent(tl) + '&dt=t&q=' + encodeURIComponent(text);
const r = await fetch(url);
if (!r.ok) throw new Error('translate http ' + r.status);
const d = await r.json();
return (d[0] || []).map(p => p[0]).join('');
}

async function one(text, tl) {
const k = hash(tl + '|' + text);
const hit = cacheGet(k);
if (hit !== null) return hit;
const v = await gtx(text, tl);
cacheSet(k, v);
return v;
}

const MARK = '\n<<<~>>>\n';

async function many(texts, tl) {
// fast path: one joined request
try {
const joined = texts.join(MARK);
const out = await gtx(joined, tl);
const parts = out.split(/<<<~>>>/).map(s => s.trim());
if (parts.length === texts.length) {
const res = {};
texts.forEach((t, i) => { cacheSet(hash(tl + '|' + t), parts[i]); res[i] = parts[i]; });
return texts.map((t, i) => res[i]);
}
throw new Error('split mismatch');
} catch (e) {
// fallback: per item
const out = [];
for (const t of texts) {
try { out.push(await one(t, tl)); } catch (e2) { out.push(t); }
}
return out;
}
}

return { one, many };
})();