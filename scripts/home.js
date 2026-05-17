// ================================================================
// HOME.JS — Animated counter + visitor stat sync
// ================================================================

function animateCounter(el, target, duration = 1800) {
  if (!el) return;
  const start     = performance.now();
  const isLarge   = target > 999;

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.round(eased * target);

    if (isLarge) {
      el.textContent = current.toLocaleString('az-AZ') + '+';
    } else {
      el.textContent = current;
    }

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function startCounters() {
  const counters = document.querySelectorAll('[data-target]');
  counters.forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    animateCounter(el, target);
  });
}

// Intersection observer — yalnız görünəndə başlasın
document.addEventListener('DOMContentLoaded', () => {
  const band = document.querySelector('.hs-stats-band');
  if (!band) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCounters();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(band);
});

// Visitor sayını mockup-a da yaz (firebase.js showMonthlyVisitors çağrıldıqdan sonra)
// stat-monthly-visitors artıq mockup içindədir, ayrıca sinxron lazım deyil.
