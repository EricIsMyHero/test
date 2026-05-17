// ============================================================
// FIREBASE.JS  —  Auth + Firestore + Analytics
// Config Vercel serverless function-dan alınır (/api/firebase-config)
// ============================================================

let _app, _auth, _db, _analytics;

// ── Firebase SDK yüklənib-yüklənmədiyini yoxla ───────────────
function _fbReady() {
  return typeof firebase !== 'undefined' &&
         typeof firebase.initializeApp === 'function';
}

// ── Config-i Vercel-dən al, sonra init et ────────────────────
async function initFirebase() {
  if (_app) return true;

  if (!_fbReady()) {
    console.error('[firebase] Firebase SDK yüklənməyib.');
    return false;
  }

  try {
    const res = await fetch('https://ericismyhero-github-io.vercel.app/api/firebase-config');
    if (!res.ok) throw new Error('Config alınmadı: ' + res.status);
    const config = await res.json();

    _app  = firebase.initializeApp(config);
    _auth = firebase.auth();
    _db   = firebase.firestore();

    // Offline persistence söndürüldü (Firebase 9 compat SDK deprecation xəbərdarlığından qaçmaq üçün)

    if (typeof firebase.analytics === 'function') {
      _analytics = firebase.analytics();
    }

    _auth.onAuthStateChanged(onAuthStateChange);

    console.info('[firebase] Uğurla başladıldı.');
    return true;
  } catch (e) {
    console.error('[firebase] Init xətası:', e);
    return false;
  }
}

// ============================================================
// AUTH STATE
// ============================================================
let currentUser    = null;
let currentProfile = null;

async function onAuthStateChange(user) {
  currentUser = user;

  if (user) {
    await _ensureUserDoc(user);
    currentProfile = await _getUserProfile(user.uid);
    await _handleDailyLogin(user.uid);

    _hideAuthModal();
    _showUserBadge(user);

    if (typeof renderDashboard === 'function') renderDashboard();
    _logEvent('login', { method: user.providerData[0]?.providerId || 'unknown' });
  } else {
    currentUser    = null;
    currentProfile = null;
    _showGuestBadge();
  }
}

async function _ensureUserDoc(user) {
  const ref  = _db.collection('users').doc(user.uid);
  const snap = await ref.get();

  if (!snap.exists) {
    const name = user.displayName || user.email?.split('@')[0] || 'Tələbə';
    await ref.set({
      name,
      email:      user.email || '',
      university: 'UNEC',
      faculty:    '',
      createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
      photoURL:   user.photoURL || ''
    });

    await _db.collection('users').doc(user.uid)
             .collection('progress').doc('main').set({
      solvedTests:   0,
      streak:        0,
      lastActive:    null,
      xp:            0,
      rank:          'Freshman',
      lastLoginDate: null
    });
  }
}

async function _getUserProfile(uid) {
  try {
    const userSnap     = await _db.collection('users').doc(uid).get();
    const progressSnap = await _db.collection('users').doc(uid)
                                  .collection('progress').doc('main').get();
    return { ...userSnap.data(), progress: progressSnap.data() || {} };
  } catch (e) {
    console.warn('[firebase] Profil oxunmadı:', e);
    return null;
  }
}

// ============================================================
// AUTH METHODS
// ============================================================

async function signInWithGoogle() {
  if (!_auth) return;
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await _auth.signInWithPopup(provider);
    if (result.user) {
      console.log('[firebase] Google login uğurlu:', result.user.email);
    }
  } catch (e) {
    console.error('[firebase] Google login xətası:', e);
    _showAuthError(_authErrorMessage(e.code));
  }
}

async function signUpWithEmail(email, password, name) {
  if (!_auth) return;
  try {
    const cred = await _auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
  } catch (e) {
    _showAuthError(_authErrorMessage(e.code));
  }
}

async function signInWithEmail(email, password) {
  if (!_auth) return;
  try {
    await _auth.signInWithEmailAndPassword(email, password);
  } catch (e) {
    _showAuthError(_authErrorMessage(e.code));
  }
}

async function signOut() {
  if (!_auth) return;
  await _auth.signOut();
  if (typeof switchBottomTab === 'function') switchBottomTab('home');
}

async function sendPasswordReset(email) {
  if (!_auth || !email) return;
  try {
    await _auth.sendPasswordResetEmail(email);
    _showAuthError('✓ Şifrə sıfırlama linki göndərildi.', 'success');
  } catch (e) {
    _showAuthError(_authErrorMessage(e.code));
  }
}

function _authErrorMessage(code) {
  const map = {
    'auth/email-already-in-use':   'Bu email artıq qeydiyyatdan keçib.',
    'auth/invalid-email':          'Düzgün email daxil edin.',
    'auth/weak-password':          'Şifrə ən azı 8 simvol, böyük hərf və rəqəm olmalıdır.',
    'auth/password-does-not-meet-requirements': 'Şifrə tələblərə uyğun deyil: ən azı 8 simvol, böyük hərf və rəqəm olmalıdır.',
    'auth/user-not-found':         'Bu email ilə hesab tapılmadı.',
    'auth/wrong-password':         'Şifrə yanlışdır.',
    'auth/too-many-requests':      'Çox sayda cəhd. Bir az gözləyin.',
    'auth/popup-closed-by-user':   '',
    'auth/network-request-failed': 'Şəbəkə xətası. İnterneti yoxlayın.'
  };
  return map[code] || 'Xəta baş verdi. Yenidən cəhd edin.';
}

// ============================================================
// FIRESTORE — WRITE HELPERS
// ============================================================

async function saveQuizResult(subject, score, total, mistakes) {
  if (!currentUser) return;
  const uid = currentUser.uid;
  const pct = Math.round((score / total) * 100);

  await _db.collection('users').doc(uid)
           .collection('quiz_results').add({
    subject, score, total, mistakes,
    percent:   pct,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  let xpGain = 20;
  if (pct === 100) xpGain += 50;
  else if (pct >= 90) xpGain += 30;

  await _addXP(uid, xpGain);
  await _incrementSolvedTests(uid);
  await _updateStreak(uid, 'quiz');
  _logEvent('quiz_complete', { subject, score: pct });

  currentProfile = await _getUserProfile(uid);
  if (typeof renderDashboard === 'function') renderDashboard();

  return xpGain;
}

async function saveGpaUpdate(current, history) {
  if (!currentUser) return;
  const uid = currentUser.uid;
  await _db.collection('users').doc(uid)
           .collection('gpa').doc('main').set({
    current, history,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  await _updateStreak(uid, 'gpa');
  _logEvent('gpa_update', { gpa: current });
}

async function logPdfOpen(subject, fileName) {
  if (!_db) return;
  const uid = currentUser?.uid || 'anonymous';
  await _db.collection('analytics').doc('pdf_opens')
           .collection('events').add({
    uid, subject, fileName,
    ts: firebase.firestore.FieldValue.serverTimestamp()
  });
  if (currentUser) {
    await _updateStreak(currentUser.uid, 'pdf');
    _logEvent('pdf_open', { subject, file: fileName });
  }
}

async function saveStudySession(subject, durationMinutes) {
  if (!currentUser || durationMinutes < 1) return;
  const uid = currentUser.uid;
  await _db.collection('users').doc(uid)
           .collection('study_sessions').add({
    subject, duration: durationMinutes,
    date: firebase.firestore.FieldValue.serverTimestamp()
  });
  await _updateStreak(uid, 'study');
  await _addXP(uid, Math.floor(durationMinutes / 5) * 2);
  _logEvent('study_session', { subject, duration: durationMinutes });
}

async function saveTeacherReview(teacher, rating, comment) {
  if (!currentUser) return;
  const uid = currentUser.uid;
  await _db.collection('users').doc(uid)
           .collection('teacher_reviews').add({
    teacher, rating, comment,
    ts: firebase.firestore.FieldValue.serverTimestamp()
  });
  await _db.collection('analytics').doc('teacher_ratings')
           .collection('reviews').add({ teacher, rating, uid });
}

// ============================================================
// GAMIFICATION — XP + RANK + STREAK
// ============================================================

const RANKS = [
  { name: 'Freshman',  minXP:    0, icon: '🌱' },
  { name: 'Scholar',   minXP:  100, icon: '📖' },
  { name: 'Analyst',   minXP:  300, icon: '🔍' },
  { name: 'Expert',    minXP:  700, icon: '⚡' },
  { name: 'Master',    minXP: 1500, icon: '🎓' },
  { name: 'Professor', minXP: 3000, icon: '🏆' },
];

function getRankInfo(xp) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXP) rank = r;
    else break;
  }
  const rankIdx  = RANKS.indexOf(rank);
  const nextRank = RANKS[rankIdx + 1] || null;
  const progress = nextRank
    ? Math.round(((xp - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100)
    : 100;
  return { rank, nextRank, progress, xp };
}

async function _addXP(uid, amount) {
  const ref = _db.collection('users').doc(uid)
                 .collection('progress').doc('main');
  await ref.update({ xp: firebase.firestore.FieldValue.increment(amount) });
  const snap = await ref.get();
  const xp   = snap.data()?.xp || 0;
  await ref.update({ rank: getRankInfo(xp).rank.name });
}

async function _incrementSolvedTests(uid) {
  await _db.collection('users').doc(uid)
           .collection('progress').doc('main').update({
    solvedTests: firebase.firestore.FieldValue.increment(1)
  });
}

async function _handleDailyLogin(uid) {
  const ref  = _db.collection('users').doc(uid)
                  .collection('progress').doc('main');
  const snap = await ref.get();
  const data = snap.data() || {};
  const today = _todayStr();
  if (data.lastLoginDate !== today) {
    await ref.update({ lastLoginDate: today });
    await _addXP(uid, 5);
  }
}

async function _updateStreak(uid, activityType) {
  const ref  = _db.collection('users').doc(uid)
                  .collection('progress').doc('main');
  const snap = await ref.get();
  const data = snap.data() || {};

  const today     = _todayStr();
  const yesterday = _yesterdayStr();
  const last      = data.lastActive;

  let newStreak = data.streak || 0;

  if (last === today) {
    // Bu gün artıq aktivlik var — streak dəyişmir
  } else if (last === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1; // ilk dəfə və ya fasilə
  }

  await ref.update({ streak: newStreak, lastActive: today });

  if (newStreak > 0 && newStreak % 7 === 0) {
    await _addXP(uid, 30); // hər 7 günlük streak bonusu
  }
}

function _todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function _yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ============================================================
// ANALYTICS
// ============================================================
function _logEvent(name, params = {}) {
  if (_analytics) _analytics.logEvent(name, params);
}

// ============================================================
// AUTH MODAL — UI
// ============================================================
function openAuthModal(mode = 'login') {
  const overlay = document.getElementById('authOverlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  setAuthMode(mode);
}

function _hideAuthModal() {
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.classList.add('hidden');
}

function setAuthMode(mode) {
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.add('hidden'));
  const panel = document.getElementById(`auth-panel-${mode}`);
  if (panel) panel.classList.remove('hidden');
  document.querySelectorAll('.auth-error').forEach(e => e.textContent = '');
}

function _showAuthError(msg, type = 'error') {
  document.querySelectorAll('.auth-error').forEach(el => {
    if (el.closest('.auth-panel:not(.hidden)')) {
      el.textContent = msg;
      el.style.color = type === 'success' ? 'var(--accent2)' : '#ef4444';
    }
  });
}

function _showUserBadge(user) {
  const btn = document.getElementById('authHeaderBtn');
  if (!btn) return;
  const name  = user.displayName || user.email?.split('@')[0] || 'Profil';
  const short = name.charAt(0).toUpperCase();
  btn.innerHTML = `<span class="auth-avatar">${short}</span><span class="auth-name">${name.split(' ')[0]}</span>`;
  btn.onclick   = () => switchBottomTab('dashboard');
}

function _showGuestBadge() {
  const btn = document.getElementById('authHeaderBtn');
  if (!btn) return;
  btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span class="auth-name">Giriş</span>`;
  btn.onclick   = () => openAuthModal('login');
}

async function updateUserProfile(faculty) {
  if (!currentUser) return;
  await _db.collection('users').doc(currentUser.uid).update({ faculty });
  currentProfile = await _getUserProfile(currentUser.uid);
  if (typeof renderDashboard === 'function') renderDashboard();
}

// ── Public getters ────────────────────────────────────────────
function getCurrentUser() { return currentUser; }
function getProfile()     { return currentProfile; }
function getDb()          { return _db; }
function isLoggedIn()     { return !!currentUser; }

// ============================================================
// VISITOR COUNTER — aylıq göstərici
// ============================================================

function _currentMonthKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

async function trackMonthlyVisit() {
  if (!_db) return;

  const monthKey  = _currentMonthKey();
  const lsKey     = `visited_${monthKey}`;
  const lastVisit = localStorage.getItem(lsKey);
  const now       = Date.now();

  // Eyni ayda 24 saat ərzində yenidən saymaq
  if (lastVisit && now - parseInt(lastVisit) < 24 * 60 * 60 * 1000) return;

  const ref = _db.collection('stats').doc(`monthly_${monthKey}`);
  try {
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({ count: 1, month: monthKey });
    } else {
      await ref.update({ count: firebase.firestore.FieldValue.increment(1) });
    }
    localStorage.setItem(lsKey, String(now));
  } catch (e) {
    console.warn('[firebase] Visitor track xətası:', e);
  }
}

async function showMonthlyVisitors() {
  if (!_db) return;
  const monthKey = _currentMonthKey();
  const ref      = _db.collection('stats').doc(`monthly_${monthKey}`);
  try {
    const snap = await ref.get();
    const count = snap.exists ? (snap.data().count || 0) : 0;
    const el    = document.getElementById('stat-monthly-visitors');
    if (el) el.textContent = count.toLocaleString('az-AZ');
  } catch (e) {
    console.warn('[firebase] Visitor oxuma xətası:', e);
  }
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const ok = await initFirebase();
  if (!ok) {
    _showGuestBadge();
    return;
  }
  await trackMonthlyVisit();
  await showMonthlyVisitors();
});
