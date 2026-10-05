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
  return auth.signInWithPopup(provider);
}

async function signUpEmail(email, pass) {
  ensureAuth();
  return auth.createUserWithEmailAndPassword(email, pass);
}

async function signInEmail(email, pass) {
  ensureAuth();
  return auth.signInWithEmailAndPassword(email, pass);
}

async function signOut() { return auth.signOut(); }

function currentUser() { return auth ? auth.currentUser : null; }

return { init, onChange, signInGoogle, signUpEmail, signInEmail, signOut, currentUser, userToProfile, configured };
})();
