/**
 * Moi Barracks School — main.js
 * Handles: Navbar, Hero particles, Scroll effects,
 *          Stats counter, Gallery filter, Testimonials slider,
 *          Forms, Back-to-top
 */

'use strict';

/* ==============================
   UTILITIES
   ============================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ==============================
   1. NAVBAR — scroll & mobile
   ============================== */
(function initNavbar() {
  const navbar = $('#navbar');
  const hamburger = $('#hamburger');
  const navMenu = $('#nav-menu');
  const navLinks = $$('.nav-link');

  // Scroll state
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    // Back to top visibility
    const btn = $('#back-to-top');
    if (btn) {
      if (window.scrollY > 400) btn.classList.add('visible');
      else btn.classList.remove('visible');
    }
  }, { passive: true });

  // Mobile menu toggle
  hamburger?.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu on nav-link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Active link on scroll
  const sections = $$('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => observer.observe(s));
})();

/* ==============================
   2. HERO — Particles & Parallax
   ============================== */
(function initHero() {
  // Particles
  const container = $('#hero-particles');
  if (!container) return;
  const COUNT = 25;
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 4 + 1}px;
      height: ${Math.random() * 4 + 1}px;
      animation-duration: ${Math.random() * 8 + 6}s;
      animation-delay: ${Math.random() * 8}s;
      opacity: ${Math.random() * 0.6 + 0.2};
    `;
    container.appendChild(p);
  }

  // Parallax on scroll
  const heroBg = $('#hero-bg');
  window.addEventListener('scroll', () => {
    if (!heroBg) return;
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroBg.style.transform = `scale(1.05) translateY(${scrollY * 0.25}px)`;
    }
  }, { passive: true });
})();

/* ==============================
   3. SCROLL REVEAL
   ============================== */
(function initScrollReveal() {
  const elements = $$('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = $$('.reveal', entry.target.parentElement);
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 120);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  elements.forEach(el => observer.observe(el));
})();

/* ==============================
   4. STATS COUNTER ANIMATION
   ============================== */
(function initCounter() {
  const stats = $$('.stat-number[data-target]');
  if (!stats.length) return;

  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.floor(easeOutQuart(progress) * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  stats.forEach(el => observer.observe(el));
})();

/* ==============================
   5. GALLERY FILTER
   ============================== */
(function initGallery() {
  const tabs = $$('.tab-btn');
  const items = $$('.gallery-item');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;
      items.forEach(item => {
        const cat = item.dataset.category;
        const match = filter === 'all' || cat === filter;
        item.classList.toggle('hidden', !match);
        if (match) {
          item.style.animation = 'none';
          requestAnimationFrame(() => {
            item.style.animation = 'fade-up 0.5s ease both';
          });
        }
      });
    });
  });
})();

/* ==============================
   6. TESTIMONIALS SLIDER
   ============================== */
(function initTestimonials() {
  const track = $('#testi-track');
  const dots = $$('.testi-dot');
  const prevBtn = $('#testi-prev');
  const nextBtn = $('#testi-next');
  const cards = $$('.testi-card');
  if (!track || !cards.length) return;

  let current = 0;
  let autoSlide;
  const total = cards.length;

  const getVisible = () => {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const goto = (index) => {
    const visible = getVisible();
    const maxIndex = Math.max(0, total - visible);
    current = Math.max(0, Math.min(index, maxIndex));
    const cardWidth = cards[0].offsetWidth + 24; // gap
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };

  prevBtn?.addEventListener('click', () => { clearInterval(autoSlide); goto(current - 1); startAuto(); });
  nextBtn?.addEventListener('click', () => { clearInterval(autoSlide); goto(current + 1); startAuto(); });
  dots.forEach(dot => {
    dot.addEventListener('click', () => { clearInterval(autoSlide); goto(parseInt(dot.dataset.index, 10)); startAuto(); });
  });

  const startAuto = () => {
    autoSlide = setInterval(() => {
      const visible = getVisible();
      const maxIndex = Math.max(0, total - visible);
      goto(current >= maxIndex ? 0 : current + 1);
    }, 5000);
  };

  window.addEventListener('resize', () => goto(current));
  startAuto();
})();

/* ==============================
   7. ENQUIRY FORM
   ============================== */
(function initEnquiryForm() {
  const form = $('#enquiry-form');
  const success = $('#form-success');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = $('#form-submit-btn');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    // Simulate async submit
    setTimeout(() => {
      form.reset();
      btn.textContent = 'Submit Enquiry';
      btn.disabled = false;
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 5000);
    }, 1500);
  });
})();

/* ==============================
   8. NEWSLETTER FORM
   ============================== */
(function initNewsletter() {
  const form = $('#newsletter-form');
  const success = $('#newsletter-success');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = $('#newsletter-submit');
    btn.textContent = '⏳';
    setTimeout(() => {
      form.reset();
      btn.textContent = '→';
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 4000);
    }, 1200);
  });
})();

/* ==============================
   9. BACK TO TOP
   ============================== */
(function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ==============================
   10. COPYRIGHT YEAR
   ============================== */
(function initCopyright() {
  const el = $('#copyright-year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ==============================
   11. SMOOTH SCROLL FOR ANCHOR LINKS
   ============================== */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = $(href);
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();

/* ==============================
   12. TICKER — duplicate for seamless loop
   ============================== */
(function initTicker() {
  const content = $('#ticker-content');
  if (!content) return;
  // Duplicate children for infinite loop
  const children = [...content.children];
  children.forEach(child => {
    content.appendChild(child.cloneNode(true));
  });
})();
