/* ══════════════════════════════════════════════════
   GLOBAL PHYSICS ENGINE — scroll & mouse broadcast
   ══════════════════════════════════════════════════ */
(function initPhysics() {
  function broadcastScroll() {
    const y        = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const pct      = maxScroll > 0 ? y / maxScroll : 0;
    document.documentElement.style.setProperty('--scroll',   y);
    document.documentElement.style.setProperty('--scroll-p', pct);
  }
  window.addEventListener('scroll', broadcastScroll, { passive: true });
  broadcastScroll(); // init on load
})();


/* ══════════════════════════════════════════════════
   PEARL SPHERE — smooth follow + dynamic light
   ══════════════════════════════════════════════════ */
const sphere = document.getElementById('sphere');

let mx = innerWidth  / 2;
let my = innerHeight / 2;
let sx = mx, sy = my;
let visible = false;
let isNear  = false;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  if (!visible) { sphere.style.opacity = '1'; visible = true; }
});

document.addEventListener('mouseleave', () => {
  sphere.style.opacity = '0';
  visible = false;
});

// Avoidance targets
const AVOID = 'a, button, h1, h2, h3, h4, p, .gc-inner';

(function loop() {
  /* ── smooth follow — dreamy lag ── */
  sx += (mx - sx) * 0.072;
  sy += (my - sy) * 0.072;
  sphere.style.left = sx + 'px';
  sphere.style.top  = sy + 'px';

  /* ── dynamic light refraction ──
     dx/dy = lag offset → light source always slightly ahead */
  const dx = (mx - sx) / 15;
  const dy = (my - sy) / 15;

  /* scroll scan: highlight sweeps top→bottom as page scrolls */
  const scrollOffset = window.scrollY * 0.08;

  /* speed-based colour shimmer: fast = cooler (blue-wing), slow = warmer (peach) */
  const speed   = Math.hypot(mx - sx, my - sy);
  const shimmer = Math.min(speed / 110, 1);
  const r = Math.round(242 - shimmer * 58);   // 242 → 184
  const g = Math.round(200 + shimmer *  4);   // 200 → 204
  const b = Math.round(154 + shimmer * 70);   // 154 → 224

  sphere.style.background = `
    radial-gradient(
      circle at ${35 + dx}% ${35 + dy + (scrollOffset % 100)}%,
      rgba(255,255,255,0.95)          0%,
      rgba(242,235,224,0.60)         22%,
      rgb(${r},${g},${b})            55%,
      rgba(42,31,26,1)              100%
    )`;

  /* ── avoidance check ── */
  let near = false;
  document.querySelectorAll(AVOID).forEach(el => {
    const rc = el.getBoundingClientRect();
    const cx = rc.left + rc.width  / 2;
    const cy = rc.top  + rc.height / 2;
    if (Math.hypot(sx - cx, sy - cy) < 130) near = true;
  });

  if (near !== isNear) {
    isNear = near;
    if (near) {
      sphere.style.transform = 'translate(-50%,-50%) scale(0.45)';
      sphere.style.filter    = 'blur(30px)';
      sphere.style.opacity   = visible ? '0.25' : '0';
    } else {
      sphere.style.transform = 'translate(-50%,-50%) scale(1.2)';
      sphere.style.filter    = 'blur(4px)';
      sphere.style.opacity   = visible ? '1' : '0';
    }
  }

  requestAnimationFrame(loop);
})();


/* ══════════════════════════════════════════════════
   DOT CURSOR
   ══════════════════════════════════════════════════ */
const cur = document.createElement('div');
cur.id = 'dot-cursor';
cur.style.cssText = `
  width: 7px; height: 7px;
  background: #e8a8b0;
  border-radius: 50%;
  position: fixed; top: 0; left: 0;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  mix-blend-mode: multiply;
  transition: transform .15s;
`;
document.body.appendChild(cur);

document.addEventListener('mousemove', e => {
  cur.style.left = e.clientX + 'px';
  cur.style.top  = e.clientY + 'px';
});

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () =>
    cur.style.transform = 'translate(-50%,-50%) scale(2.2)');
  el.addEventListener('mouseleave', () =>
    cur.style.transform = 'translate(-50%,-50%) scale(1)');
});


/* ══════════════════════════════════════════════════
   NAV SCROLL TINT
   ══════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.getElementById('nav')
    .classList.toggle('scrolled', scrollY > 40);
}, { passive: true });
