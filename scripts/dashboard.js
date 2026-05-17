// ============================================================
// DASHBOARD.JS  —  Dashboard + Gamification render
// ============================================================

// ── Dashboard tab render ──────────────────────────────────────
function renderDashboard() {
  const profile  = getProfile();
  const user     = getCurrentUser();
  const progress = profile?.progress || {};

  const xp      = progress.xp          || 0;
  const streak  = progress.streak       || 0;
  const solved  = progress.solvedTests  || 0;
  const rankInfo = getRankInfo(xp);

  // Salamlama
  const name = profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Tələbə';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Sabahın xeyir' : hour < 18 ? 'Günün xeyir' : 'Axşamın xeyir';

  document.getElementById('dash-greeting').textContent  = `${greeting}, ${name} 👋`;
  document.getElementById('dash-date').textContent      = _formatDate();

  // Statistika kartları
  document.getElementById('dash-streak').textContent    = streak;
  document.getElementById('dash-solved').textContent    = solved;
  document.getElementById('dash-xp').textContent        = xp;

  // GPA
  _loadDashGpa(user.uid);

  // Rank + progress bar
  document.getElementById('dash-rank-icon').textContent  = rankInfo.rank.icon;
  document.getElementById('dash-rank-name').textContent  = rankInfo.rank.name;
  document.getElementById('dash-rank-xp').textContent    = `${xp} XP`;
  document.getElementById('dash-rank-next').textContent  =
    rankInfo.nextRank ? `${rankInfo.nextRank.name} üçün ${rankInfo.nextRank.minXP - xp} XP lazımdır` : '🏆 Maksimal rank!';
  setTimeout(() => {
    const bar = document.getElementById('dash-rank-bar');
    if (bar) bar.style.width = rankInfo.progress + '%';
  }, 100);

  // Son quiz nəticələri
  _loadRecentQuizzes(user.uid);

  // Streak vəziyyəti
  _renderStreakStatus(progress);
}

async function _loadDashGpa(uid) {
  try {
    const snap = await getDb().collection('users').doc(uid)
                              .collection('gpa').doc('main').get();
    const gpa  = snap.exists ? (snap.data().current || 0) : 0;
    document.getElementById('dash-gpa').textContent = gpa ? gpa.toFixed(1) : '—';
  } catch (_) {
    document.getElementById('dash-gpa').textContent = '—';
  }
}

async function _loadRecentQuizzes(uid) {
  try {
    const snap = await getDb().collection('users').doc(uid)
                              .collection('quiz_results')
                              .orderBy('timestamp', 'desc')
                              .limit(4).get();

    const container = document.getElementById('dash-recent-quizzes');
    if (!container) return;

    if (snap.empty) {
      container.innerHTML = '<p class="dash-empty">Hələ heç bir test həll edilməyib.</p>';
      return;
    }

    container.innerHTML = snap.docs.map(doc => {
      const d   = doc.data();
      const pct = d.percent ?? Math.round((d.score / d.total) * 100);
      const cls = pct >= 75 ? 'dash-quiz-good' : pct >= 50 ? 'dash-quiz-mid' : 'dash-quiz-bad';
      const icon = _subjectIcon(d.subject);
      return `
        <div class="dash-quiz-item ${cls}">
          <div class="dash-quiz-icon">${icon}</div>
          <div class="dash-quiz-subj">${d.subject || '—'}</div>
          <div class="dash-quiz-score">${d.score}/${d.total}</div>
          <div class="dash-quiz-pct">${pct}%</div>
        </div>`;
    }).join('');
  } catch (e) {
    console.warn('[dashboard] quiz load xətası:', e);
  }
}

function _renderStreakStatus(progress) {
  const el   = document.getElementById('dash-streak-msg');
  const txt  = document.getElementById('dash-streak-msg-text');
  if (!el) return;
  const last  = progress.lastActive;
  const today = new Date().toISOString().slice(0, 10);
  const yest  = (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); })();

  if (last === today) {
    if (txt) txt.textContent = '✅ Bu gün aktiv oldun! Davam et';
    el.className = 'dash-streak-msg dash-streak-ok';
  } else if (last === yest) {
    if (txt) txt.textContent = '⚡ Bu gün aktiv ol — streaki qoru!';
    el.className = 'dash-streak-msg dash-streak-warn';
  } else {
    if (txt) txt.textContent = '❌ Streak kəsildi. Yeni başlat!';
    el.className = 'dash-streak-msg dash-streak-dead';
  }
}

function toggleStreakInfo() {
  const panel = document.getElementById('streak-info-panel');
  if (panel) panel.classList.toggle('hidden');
}

// ── XP toast bildirişi ────────────────────────────────────────
function showXpToast(amount, reason) {
  const toast = document.getElementById('xp-toast');
  if (!toast) return;
  toast.textContent = `+${amount} XP — ${reason}`;
  toast.classList.add('xp-toast-show');
  setTimeout(() => toast.classList.remove('xp-toast-show'), 2800);
}

// ── Quiz bitdikdə avtomatik saxla ────────────────────────────
// features.js-dəki finishTest() sonrası çağırılır
async function onQuizFinished(subject, score, total, mistakes) {
  if (!isLoggedIn()) return;
  const xpGain = await saveQuizResult(subject, score, total, mistakes);
  if (xpGain) showXpToast(xpGain, 'Quiz tamamlandı');
}

// ── GPA yeniləndikdə hook ─────────────────────────────────────
async function onGpaUpdated(current, history) {
  if (!isLoggedIn()) return;
  await saveGpaUpdate(current, history);
  // Dashboard stat-ı dərhal yenilə
  const gpaEl = document.getElementById('dash-gpa');
  if (gpaEl) gpaEl.textContent = current.toFixed(1);
}

// ── PDF açılışı hook ──────────────────────────────────────────
async function onPdfOpened(subject, fileName) {
  await logPdfOpen(subject, fileName);
  if (!isLoggedIn()) return;
  // Streak yeniləndi — profili yenidən yüklə və dashboard-u refresh et
  const uid = getCurrentUser().uid;
  try {
    const snap = await getDb().collection('users').doc(uid)
                              .collection('progress').doc('main').get();
    const data = snap.data() || {};
    // dash-streak-ı dərhal yenilə
    const streakEl = document.getElementById('dash-streak');
    if (streakEl) streakEl.textContent = data.streak || 0;
    _renderStreakStatus(data);
  } catch(e) {}
}

// ── Auth form submit handlers ─────────────────────────────────
function handleLoginSubmit() {
  const email    = document.getElementById('login-email')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  if (!email || !password) return;
  signInWithEmail(email, password);
}

function handleRegisterSubmit() {
  const name     = document.getElementById('reg-name')?.value?.trim();
  const email    = document.getElementById('reg-email')?.value?.trim();
  const password = document.getElementById('reg-password')?.value;
  if (!name || !email || !password) return;
  signUpWithEmail(email, password, name);
}

function handleResetSubmit() {
  const email = document.getElementById('reset-email')?.value?.trim();
  if (!email) return;
  sendPasswordReset(email);
}

// ── Profil fakültəsini yenilə ─────────────────────────────────
function handleFacultyUpdate() {
  const val = document.getElementById('dash-faculty-input')?.value?.trim();
  if (!val) return;
  updateUserProfile(val);
}

// ── Köməkçi ──────────────────────────────────────────────────
function _formatDate() {
  return new Date().toLocaleDateString('az-AZ', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
}

// ── Dashboard tab göstər (giriş olmadan) ─────────────────────
function openDashboardTab() {
  if (!isLoggedIn()) {
    openAuthModal('login');
    return;
  }
  switchBottomTab('dashboard');
}

// ── Fənn ikonu ────────────────────────────────────────────────
function _subjectIcon(subject) {
  if (!subject) return '📋';
  const s = subject.toLowerCase();
  if (s.includes('riyaz'))      return '📐';
  if (s.includes('statisti'))   return '📊';
  if (s.includes('iqtisad'))    return '💹';
  if (s.includes('karyera'))    return '🎯';
  if (s.includes('ehtimal'))    return '🎲';
  if (s.includes('mühasibat'))  return '🧾';
  if (s.includes('menecment'))  return '📈';
  if (s.includes('market'))     return '📣';
  if (s.includes('hüquq'))      return '⚖️';
  if (s.includes('tarix'))      return '📜';
  if (s.includes('ingilis'))    return '🌐';
  if (s.includes('informatika') || s.includes('proqram')) return '💻';
  if (s.includes('maliyy'))     return '💰';
  if (s.includes('audit'))      return '🔍';
  if (s.includes('sosiol'))     return '👥';
  if (s.includes('fəlsəf'))     return '🧠';
  return '📋';
}

// ── Quiz nəticələri modali ────────────────────────────────────
async function openQuizResultsModal() {
  const overlay = document.getElementById('quizResultsOverlay');
  const body    = document.getElementById('quiz-results-body');
  if (!overlay || !body) return;
  overlay.classList.remove('hidden');
  body.innerHTML = '<div class="quiz-results-loading">Yüklənir...</div>';

  if (!isLoggedIn()) {
    body.innerHTML = '<div class="quiz-results-empty">Nəticələri görmək üçün daxil ol.</div>';
    return;
  }

  try {
    const snap = await getDb()
      .collection('users').doc(getCurrentUser().uid)
      .collection('quiz_results')
      .orderBy('timestamp', 'desc')
      .limit(20).get();

    if (snap.empty) {
      body.innerHTML = '<div class="quiz-results-empty">Hələ heç bir test həll edilməyib.</div>';
      return;
    }

    body.innerHTML = snap.docs.map(doc => {
      const d   = doc.data();
      const pct = d.percent ?? Math.round((d.score / d.total) * 100);
      const cls = pct >= 75 ? 'qr-good' : pct >= 50 ? 'qr-mid' : 'qr-bad';
      const icon = _subjectIcon(d.subject);
      const ts   = d.timestamp?.toDate
        ? d.timestamp.toDate().toLocaleDateString('az-AZ', { day:'numeric', month:'short' })
        : '';
      return `
        <div class="qr-item">
          <div class="qr-icon">${icon}</div>
          <div class="qr-info">
            <div class="qr-subj">${d.subject || '—'}</div>
            <div class="qr-date">${ts}</div>
          </div>
          <div class="qr-right">
            <div class="qr-score">${d.score}/${d.total}</div>
            <div class="qr-pct ${cls}">${pct}%</div>
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    body.innerHTML = '<div class="quiz-results-empty">Yüklənmə xətası.</div>';
    console.warn('[dashboard] quiz modal xəta:', e);
  }
}

function closeQuizResultsModal() {
  const overlay = document.getElementById('quizResultsOverlay');
  if (overlay) overlay.classList.add('hidden');
}
