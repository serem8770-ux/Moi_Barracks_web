/**
 * Moi Barracks High School — main.js
 * Author: Senior Dev
 * Modules: Navbar, Particles, Parallax, Scroll Reveal,
 *          Counter, Gallery Filter, Testimonials, Forms,
 *          Back-to-top, Ticker
 */

'use strict';

/* ── Utilities ───────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** Debounce helper — prevents resize floods */
function debounce(fn, ms = 150) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ── 1. NAVBAR ───────────────────────────────────────────── */
(function initNavbar() {
  const navbar    = qs('#navbar');
  const hamburger = qs('#hamburger');
  const navMenu   = qs('#nav-menu');
  const navLinks  = qsa('.nav-link');
  const backToTop = qs('#back-to-top');

  if (!navbar) return;

  /* Scroll: sticky style + back-to-top visibility */
  const onScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);
    if (backToTop) backToTop.classList.toggle('visible', y > 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* Mobile hamburger */
  hamburger?.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  /* Close mobile menu on link click */
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Highlight active nav link via IntersectionObserver */
  const sections = qsa('section[id]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(l =>
        l.classList.toggle('active', l.getAttribute('href') === `#${id}`)
      );
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' });
  sections.forEach(s => io.observe(s));
})();

/* ── 2. HERO PARTICLES ───────────────────────────────────── */
(function initParticles() {
  const container = qs('#hero-particles');
  if (!container) return;

  const COUNT = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 20;
  const frag  = document.createDocumentFragment();

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = [
      `left:${(Math.random() * 100).toFixed(1)}%`,
      `width:${(Math.random() * 3 + 1).toFixed(1)}px`,
      `height:${(Math.random() * 3 + 1).toFixed(1)}px`,
      `animation-duration:${(Math.random() * 8 + 7).toFixed(1)}s`,
      `animation-delay:${(Math.random() * 10).toFixed(1)}s`,
    ].join(';');
    frag.appendChild(p);
  }
  container.appendChild(frag);
})();

/* ── 3. HERO PARALLAX ────────────────────────────────────── */
(function initParallax() {
  const heroBg = qs('#hero-bg');
  if (!heroBg) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const onScroll = () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroBg.style.transform = `translateY(${(y * 0.3).toFixed(1)}px)`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ── 4. SCROLL REVEAL ────────────────────────────────────── */
(function initScrollReveal() {
  const els = qsa('.reveal');
  if (!els.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = qsa('.reveal', entry.target.parentElement);
      const delay = siblings.indexOf(entry.target) * 100;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ── 5. STATS COUNTER ────────────────────────────────────── */
(function initCounter() {
  const stats = qsa('.stat-number[data-target]');
  if (!stats.length) return;

  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  const animate = el => {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const started  = performance.now();

    const tick = now => {
      const p = Math.min((now - started) / duration, 1);
      el.textContent = Math.floor(easeOutQuart(p) * target).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animate(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  stats.forEach(el => io.observe(el));
})();

/* ── 6. GALLERY FILTER ───────────────────────────────────── */
(function initGallery() {
  const tabs  = qsa('.tab-btn');
  const items = qsa('.gallery-item');
  if (!tabs.length || !items.length) return;

  const filter = value => {
    items.forEach(item => {
      const show = value === 'all' || item.dataset.category === value;
      item.classList.toggle('hidden', !show);
      if (show) {
        // Reset animation
        item.style.animation = 'none';
        void item.offsetWidth; // reflow
        item.style.animation = '';
      }
    });
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      filter(tab.dataset.filter);
    });
  });
})();

/* ── 7. TESTIMONIALS SLIDER ──────────────────────────────── */
(function initTestimonials() {
  const track   = qs('#testi-track');
  const dots    = qsa('.testi-dot');
  const prevBtn = qs('#testi-prev');
  const nextBtn = qs('#testi-next');
  const cards   = qsa('.testi-card');
  if (!track || !cards.length) return;

  let current   = 0;
  let timer     = null;

  const getVisible = () => window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;

  const goto = idx => {
    const visible  = getVisible();
    const maxIndex = Math.max(0, cards.length - visible);
    current = Math.max(0, Math.min(idx, maxIndex));
    const cardW = cards[0].offsetWidth + 24; // 24 = CSS gap
    track.style.transform = `translateX(-${current * cardW}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };

  const startAuto = () => {
    clearInterval(timer);
    timer = setInterval(() => {
      const maxIndex = Math.max(0, cards.length - getVisible());
      goto(current >= maxIndex ? 0 : current + 1);
    }, 5000);
  };

  prevBtn?.addEventListener('click', () => { goto(current - 1); startAuto(); });
  nextBtn?.addEventListener('click', () => { goto(current + 1); startAuto(); });
  dots.forEach(dot => dot.addEventListener('click', () => {
    goto(parseInt(dot.dataset.index, 10)); startAuto();
  }));

  // Debounced resize handler
  window.addEventListener('resize', debounce(() => goto(current)), { passive: true });

  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(timer));
  track.addEventListener('mouseleave', startAuto);

  startAuto();
})();

/* ── 8. ENQUIRY FORM ─────────────────────────────────────── */
(function initEnquiryForm() {
  const form    = qs('#enquiry-form');
  const success = qs('#form-success');
  const btn     = qs('#form-submit-btn');
  if (!form || !btn) return;

  /* Basic client-side validation */
  const validate = () => {
    const name  = qs('#fname').value.trim();
    const phone = qs('#fphone').value.trim();
    const level = qs('#flevel').value;
    const year  = qs('#fyear').value;
    return name.length >= 2 && phone.length >= 9 && level && year;
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) {
      btn.textContent = 'Please fill required fields';
      setTimeout(() => { btn.textContent = 'Send Enquiry'; }, 2500);
      return;
    }
    const original = btn.innerHTML;
    btn.textContent = 'Sending…';
    btn.disabled    = true;

    setTimeout(() => {
      form.reset();
      btn.innerHTML = original;
      btn.disabled  = false;
      if (success) {
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 5000);
      }
    }, 1500);
  });
})();

/* ── 9. NEWSLETTER FORM ──────────────────────────────────── */
(function initNewsletter() {
  const form    = qs('#newsletter-form');
  const success = qs('#newsletter-success');
  const btn     = qs('#newsletter-submit');
  if (!form || !btn) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = qs('#newsletter-email')?.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    btn.textContent = '⏳';
    setTimeout(() => {
      form.reset();
      btn.textContent = '→';
      if (success) {
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 4000);
      }
    }, 1200);
  });
})();

/* ── 10. BACK TO TOP ─────────────────────────────────────── */
(function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── 11. COPYRIGHT YEAR ──────────────────────────────────── */
(function initCopyright() {
  const el = qs('#copyright-year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ── 12. SMOOTH SCROLL ───────────────────────────────────── */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href   = link.getAttribute('href');
    if (href === '#') return;
    const target = qs(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ── 13. NEWS TICKER ─────────────────────────────────────── */
(function initTicker() {
  const content = qs('#ticker-content');
  if (!content) return;
  // Clone items for seamless infinite loop
  const children = Array.from(content.children);
  children.forEach(child => content.appendChild(child.cloneNode(true)));

  // Pause on hover
  content.addEventListener('mouseenter', () => content.style.animationPlayState = 'paused');
  content.addEventListener('mouseleave', () => content.style.animationPlayState = 'running');
})();

/* ── 14. CONTENT.JSON — Dynamic Fee & Admissions Loader ──── */
(async function loadCMSContent() {
  const fmt = n => 'KES ' + Number(n).toLocaleString('en-KE');
  try {
    // Resolve path relative to site root — works whether served locally or from GitHub Pages subdir
    const base = document.querySelector('link[rel="canonical"]')?.href
      || (window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/'));
    const url = new URL('data/content.json', base).href + '?v=' + Date.now();
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    const fees = data.fees || {};

    // Update the fee total display
    const feeTotal = qs('#fee-display-total');
    if (feeTotal && fees.total) feeTotal.textContent = fmt(fees.total);

    // Show due date if set
    if (fees.dueDate) {
      const dueRow = qs('#fee-display-due');
      const dueTxt = qs('#fee-display-due-text');
      if (dueRow && dueTxt) {
        dueTxt.textContent = '📅 Due: ' + fees.dueDate;
        dueRow.style.display = '';
      }
    }

    // Show includes if set
    if (fees.includes) {
      const incRow = qs('#fee-display-includes-row');
      const incTxt = qs('#fee-display-includes-text');
      if (incRow && incTxt) {
        incTxt.textContent = '✅ Includes: ' + fees.includes;
        incRow.style.display = '';
      }
    }

    // Show notes if set
    if (fees.notes) {
      const noteRow = qs('#fee-display-notes-row');
      const noteTxt = qs('#fee-display-notes-text');
      if (noteRow && noteTxt) {
        noteTxt.textContent = '📝 ' + fees.notes;
        noteRow.style.display = '';
      }
    }

    // Show term breakdown if set
    const t1 = fees.term1, t2 = fees.term2, t3 = fees.term3;
    if (t1 || t2 || t3) {
      const termRow = qs('#fee-display-term-row');
      const termLabel = qs('#fee-display-term-label');
      const termVal = qs('#fee-display-term-val');
      if (termRow && termLabel && termVal) {
        const parts = [];
        if (t1) parts.push('Term 1: ' + fmt(t1));
        if (t2) parts.push('Term 2: ' + fmt(t2));
        if (t3) parts.push('Term 3: ' + fmt(t3));
        termLabel.textContent = 'Per Term';
        termVal.textContent = parts.join(' | ');
        termRow.style.display = '';
      }
    }

    // Admissions badge — use safe DOM manipulation, not innerHTML
    const admOpen = fees.admissionsOpen !== false && data.admissionsOpen !== false;
    const badge = qs('#fee-admissions-badge');
    if (badge) {
      badge.innerHTML = '';
      const span = document.createElement('span');
      span.className = 'fee-admissions-badge';
      span.textContent = 'Admissions ' + (admOpen ? 'OPEN \u2713' : 'CLOSED');
      span.style.cssText = admOpen
        ? 'background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.35);color:#34d399;'
        : 'background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.35);color:#f87171;';
      badge.appendChild(span);
    }
  } catch (e) {
    // Silent fail — static defaults shown in HTML
  }
})();
