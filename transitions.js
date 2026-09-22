/* ══════════════════════════════════════════════════════════════
   LIQUID VEIL — Page Transition Engine
   Drop <script src="transitions.js"></script> into every page,
   just before </body>. Works with home.html, about.html, projects.html.

   Behaviour:
   · Enter  → veil sweeps UP off the screen (cream curtain rises)
   · Exit   → veil drops DOWN over the screen, then location changes
   · Scroll indicator on homepage fades in after veil clears
   ══════════════════════════════════════════════════════════════ */

(function () {
  /* ─────────────────────────────
     1. BUILD THE VEIL
     ───────────────────────────── */
  const veil = document.createElement('div');
  veil.id = 'page-veil';
  Object.assign(veil.style, {
    position:   'fixed',
    inset:      '0',
    zIndex:     '99999',
    background: '#f2ebe0',
    transformOrigin: 'top center',
    transform:  'translateY(0)',
    transition: 'transform 0.72s cubic-bezier(0.76, 0, 0.24, 1)',
    pointerEvents: 'none',
  });

  /* Shimmer layer inside veil */
  const shimmer = document.createElement('div');
  Object.assign(shimmer.style, {
    position:   'absolute',
    inset:      '0',
    background: 'linear-gradient(135deg, rgba(242,200,154,.22) 0%, transparent 45%, rgba(184,204,224,.18) 100%)',
    opacity:    '1',
  });
  veil.appendChild(shimmer);
  document.body.prepend(veil);

  /* ─────────────────────────────
     2. ENTER ANIMATION
     veil starts covering → sweeps up and off
     ───────────────────────────── */
  // Force a synchronous reflow so the transition fires
  veil.getBoundingClientRect();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      veil.style.transform = 'translateY(-100%)';
    });
  });

  /* After veil clears, fire scroll indicator (homepage only) */
  veil.addEventListener('transitionend', () => {
    const ind = document.getElementById('scroll-indicator');
    if (ind) {
      ind.style.opacity    = '1';
      ind.style.transform  = 'translateY(0)';
    }
  }, { once: true });

  /* ─────────────────────────────
     3. EXIT ANIMATION
     Intercept internal <a> clicks
     ───────────────────────────── */
  let navigating = false;

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link || navigating) return;

    const href = link.getAttribute('href');

    /* Skip: blank, hash-only, external, or target=_blank */
    if (
      !href ||
      href === '#' ||
      href.startsWith('#') ||
      href.startsWith('http') ||
      href.startsWith('mailto') ||
      link.target === '_blank'
    ) return;

    e.preventDefault();
    navigating = true;

    /* Drop veil back down */
    veil.style.transition = 'transform 0.58s cubic-bezier(0.76, 0, 0.24, 1)';
    veil.style.transform  = 'translateY(0)';

    setTimeout(() => {
      window.location.href = href;
    }, 580);
  });

  /* ─────────────────────────────
     4. SCROLL INDICATOR (homepage)
     Pulses gently; hides on first scroll
     ───────────────────────────── */
  const scrollInd = document.getElementById('scroll-indicator');
  if (scrollInd) {
    /* Start hidden — enter animation reveals it */
    scrollInd.style.opacity   = '0';
    scrollInd.style.transform = 'translateY(12px)';
    scrollInd.style.transition = 'opacity .6s ease, transform .6s ease';

    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        scrollInd.style.opacity   = '0';
        scrollInd.style.transform = 'translateY(12px)';
      }
    }, { passive: true });
  }

})();


/* ══════════════════════════════════════════════════════════════
   HOMEPAGE SCROLL SECTION — Reveal on scroll
   If .home-scroll exists (homepage only), reveal its children
   ══════════════════════════════════════════════════════════════ */
(function () {
  const section = document.querySelector('.home-scroll');
  if (!section) return;

  const children = section.querySelectorAll(
    '.hs-bridge, .hs-grid, .hs-footer'
  );

  /* Start hidden */
  children.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = `opacity .9s ${i * .12}s cubic-bezier(.22,1,.36,1),
                           transform .9s ${i * .12}s cubic-bezier(.22,1,.36,1)`;
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  children.forEach(el => obs.observe(el));

  /* Project teaser cards — lens zoom on enter */
  const teasers = section.querySelectorAll('.hs-card');
  teasers.forEach(card => {
    const img = card.querySelector('img');
    if (img) {
      img.style.transform  = 'scale(1.08)';
      img.style.filter     = 'blur(4px) brightness(.9)';
      img.style.transition = 'transform 1.5s cubic-bezier(.2,.8,.2,1), filter 1.5s cubic-bezier(.2,.8,.2,1)';
    }

    const cardObs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && img) {
        img.style.transform = 'scale(1)';
        img.style.filter    = 'blur(0) brightness(1)';
        cardObs.unobserve(card);
      }
    }, { threshold: 0.15 });
    cardObs.observe(card);
  });
})();
