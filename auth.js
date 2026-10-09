// ===== Firebase Auth (email/password + Google) =====
const AuthKit = (() => {
let app = null, auth = null;
const listeners = [];

function configured() {
  return firebaseConfig && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('PASTE_');
}

function init() {
  if (!configured()) {
    console.warn('Firebase not configured — sign-in disabled');
    return false;
  }
  try {
    if (!app) { app = firebase.initializeApp(firebaseConfig); auth = app.auth(); }
    auth.onAuthStateChanged(u => listeners.forEach(f => f(userToProfile(u))));
    // handle users returning from Google redirect sign-in
    auth.getRedirectResult().catch(e => console.warn('redirect sign-in error:', e));
    return true;
  } catch (e) {
    console.error('Firebase init failed', e);
    return false;
  }
}

function userToProfile(u) {
  if (!u) return null;
  return {
    uid: u.uid,
    name: u.displayName || (u.email ? u.email.split('@')[0] : 'Learner'),
    email: u.email || '',
    photo: u.photoURL || ''
  };
}

function onChange(cb) { listeners.push(cb); }

function ensureAuth() {
  if (!auth) { const ok = init(); if (!ok) throw new Error('Firebase not configured — paste your keys in firebase-config.js'); }
  return auth;
}

async function signInGoogle() {
  ensureAuth();
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return auth.signInWithRedirect(provider); // redirect flow — immune to third-party cookie blocks
}

async function signUpEmail(email, pass) {
  ensureAuth();
  return auth.createUserWithEmailAndPassword(email, pass);
}

async function signInEmail(email, pass) {
  ensureAuth();
  return auth.signInWithEmailAndPassword(email, pass);
}

// ---------- Email-link verification flow (email → verify → password) ----------
const EMAIL_KEY = 'pkEmailForSignIn';
const ACTION_SETTINGS = {
  url: window.location.origin + window.location.pathname,
  handleCodeInApp: true
};

function pendingEmail() { return window.localStorage.getItem(EMAIL_KEY) || ''; }

function isEmailLink(url) {
  try { return !!auth && auth.isSignInWithEmailLink(url || window.location.href); }
  catch (e) { return false; }
}

async function sendVerificationLink(email) {
  ensureAuth();
  const e = String(email || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new Error('Enter a valid email address.');
  window.localStorage.setItem(EMAIL_KEY, e);
  await auth.sendSignInLinkToEmail(e, ACTION_SETTINGS);
  return e;
}

async function completeEmailLinkSignIn(email, url) {
  ensureAuth();
  const e = String(email || pendingEmail() || '').trim();
  if (!e) throw new Error('Enter the email address you received the link on.');
  const cred = await auth.signInWithEmailLink(e, url || window.location.href);
  if (cred.user && !cred.user.emailVerified) {
    throw new Error('Email could not be verified. Please tap the link again.');
  }
  window.localStorage.removeItem(EMAIL_KEY);
  return cred.user;
}

async function setPasswordForCurrentUser(email, password) {
  ensureAuth();
  const u = auth.currentUser;
  if (!u) throw new Error('Verify your email first.');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');
  const credential = firebase.auth.EmailAuthProvider.credential(String(email || u.email || '').trim(), password);
  await u.linkWithCredential(credential);
  return userToProfile(u);
}

async function signOut() { return auth.signOut(); }

function currentUser() {
  const u = auth ? auth.currentUser : null;
  return u ? userToProfile(u) : null; // always return the safe profile shape
}

return { init, onChange, signInGoogle, signInEmail, signOut, currentUser, userToProfile, configured,
         sendVerificationLink, completeEmailLinkSignIn, setPasswordForCurrentUser, pendingEmail, isEmailLink };
})();
