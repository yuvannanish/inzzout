/* ═══════════════════════════════════════════════════════════════
   INZZOUT — LUXURY STREETWEAR
   Ultra-premium interactive JavaScript
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── UTILITIES ─────────────────────────────────────────────── */
const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp  = (a, b, t) => a + (b - a) * t;
const rand  = (min, max) => Math.random() * (max - min) + min;
const map   = (v, a1, a2, b1, b2) => b1 + ((v - a1) / (a2 - a1)) * (b2 - b1);

/* ─── STATE ─────────────────────────────────────────────────── */
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, tx: 0, ty: 0 };
let cartItems = [];
let currentColor = '#0a0a0a';
let currentSize  = 'S';
let lookbookIndex = 0;
let carouselOffset = 0;
let productRotation = 0;
let rafId = null;
let productAutoPlay = null;

/* ═══════════════════════════════════════════════════════════════
   1. PRELOADER
═══════════════════════════════════════════════════════════════ */
(function initPreloader() {
  const preloader = qs('#preloader');
  const fill      = qs('#preloader-fill');
  const grainCanvas = qs('#grain-canvas');
  if (!preloader) return;

  // Film grain on preloader
  setupGrain(grainCanvas);

  let progress = 0;
  const interval = setInterval(() => {
    progress += rand(3, 8);
    if (progress >= 100) { progress = 100; clearInterval(interval); }
    fill.style.width = progress + '%';
    if (progress === 100) {
      setTimeout(() => {
        preloader.classList.add('hidden');
        setTimeout(() => preloader.remove(), 900);
        startHero();
      }, 300);
    }
  }, 40);
})();

/* ─── Film grain canvas ─────────────────────────────────────── */
function setupGrain(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animId;
  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function drawGrain() {
    const { width, height } = canvas;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      data[i] = data[i+1] = data[i+2] = v;
      data[i+3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    animId = requestAnimationFrame(drawGrain);
  }
  drawGrain();
  return () => cancelAnimationFrame(animId);
}

/* ═══════════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
═══════════════════════════════════════════════════════════════ */
(function initCursor() {
  const cursor = qs('#cursor');
  const trail  = qs('#cursor-trail');
  if (!cursor || !trail) return;

  let tx = 0, ty = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    cursor.style.left = tx + 'px';
    cursor.style.top  = ty + 'px';
  });

  function animTrail() {
    cx = lerp(cx, tx, 0.12);
    cy = lerp(cy, ty, 0.12);
    trail.style.left = cx + 'px';
    trail.style.top  = cy + 'px';
    requestAnimationFrame(animTrail);
  }
  animTrail();

  // Magnetic buttons
  qsa('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top  + rect.height / 2);
      el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   3. NAVBAR
═══════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar = qs('#navbar');
  const hamburger = qs('#nav-hamburger');
  const mobileOverlay = qs('#mobile-overlay');
  const mobileClose = qs('#mobile-close');

  if (!navbar) return;

  // Scroll behavior
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // Mobile menu
  hamburger && hamburger.addEventListener('click', () => {
    mobileOverlay.classList.add('active');
    document.body.classList.add('menu-open');
    setupGrain(qs('#mobile-grain'));
  });

  function closeMobile() {
    mobileOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  mobileClose && mobileClose.addEventListener('click', closeMobile);

  qsa('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobile);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   4. HERO — CANVAS ARTWORK
═══════════════════════════════════════════════════════════════ */
function startHero() {
  initSkylineCanvas();
  initRainCanvas();
  initSmokeCanvas();
  initHeroParallax();
  initHeroHeadline();
}

/* Skyline */
function initSkylineCanvas() {
  const canvas = qs('#skyline-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
    draw();
  }

  function draw() {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#050505');
    sky.addColorStop(0.6, '#0a0305');
    sky.addColorStop(1, '#15050a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 120; i++) {
      const x = rand(0, width);
      const y = rand(0, height * 0.6);
      const r = rand(0.2, 1.2);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Moon glow
    const mx = width * 0.78, my = height * 0.18;
    const moonGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 120);
    moonGlow.addColorStop(0, 'rgba(192,57,43,0.08)');
    moonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(0, 0, width, height);

    // Buildings
    const buildingData = [
      { x: 0.02, w: 0.04, h: 0.32 },
      { x: 0.06, w: 0.06, h: 0.45 },
      { x: 0.12, w: 0.03, h: 0.28 },
      { x: 0.15, w: 0.05, h: 0.55 },
      { x: 0.20, w: 0.04, h: 0.38 },
      { x: 0.24, w: 0.06, h: 0.62 },
      { x: 0.30, w: 0.03, h: 0.42 },
      { x: 0.55, w: 0.05, h: 0.48 },
      { x: 0.60, w: 0.07, h: 0.68 },
      { x: 0.67, w: 0.04, h: 0.44 },
      { x: 0.71, w: 0.06, h: 0.58 },
      { x: 0.77, w: 0.05, h: 0.36 },
      { x: 0.82, w: 0.04, h: 0.52 },
      { x: 0.86, w: 0.06, h: 0.40 },
      { x: 0.92, w: 0.05, h: 0.34 },
      { x: 0.97, w: 0.06, h: 0.60 },
    ];

    buildingData.forEach(b => {
      const bx = b.x * width;
      const bw = b.w * width;
      const bh = b.h * height;
      const by = height - bh;

      // Building body
      const bGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
      bGrad.addColorStop(0, '#111114');
      bGrad.addColorStop(1, '#070708');
      ctx.fillStyle = bGrad;
      ctx.fillRect(bx, by, bw, bh);

      // Windows
      const rows = Math.floor(bh / 22);
      const cols = Math.floor(bw / 10);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.6) {
            const wx = bx + 3 + c * 10;
            const wy = by + 5 + r * 22;
            const alpha = rand(0.1, 0.6);
            // Occasional red tint window
            if (Math.random() > 0.92) {
              ctx.fillStyle = `rgba(192,57,43,${alpha * 0.8})`;
            } else {
              ctx.fillStyle = `rgba(255,220,150,${alpha * 0.4})`;
            }
            ctx.fillRect(wx, wy, 5, 12);
          }
        }
      }

      // Red glow at base
      const glow = ctx.createLinearGradient(bx, by + bh - 20, bx, by + bh);
      glow.addColorStop(0, 'transparent');
      glow.addColorStop(1, 'rgba(192,57,43,0.08)');
      ctx.fillStyle = glow;
      ctx.fillRect(bx, by, bw, bh);
    });

    // Horizon red glow
    const hGlow = ctx.createLinearGradient(0, height * 0.65, 0, height);
    hGlow.addColorStop(0, 'transparent');
    hGlow.addColorStop(0.5, 'rgba(192,57,43,0.06)');
    hGlow.addColorStop(1, 'rgba(192,57,43,0.12)');
    ctx.fillStyle = hGlow;
    ctx.fillRect(0, 0, width, height);

    // Ground reflections
    const reflGrad = ctx.createLinearGradient(0, height * 0.82, 0, height);
    reflGrad.addColorStop(0, 'rgba(8,3,5,0.3)');
    reflGrad.addColorStop(1, '#050204');
    ctx.fillStyle = reflGrad;
    ctx.fillRect(0, height * 0.82, width, height * 0.18);

    // Wet road reflection streaks
    for (let i = 0; i < 8; i++) {
      const rx = rand(0, width);
      const rGrad = ctx.createLinearGradient(rx, height * 0.85, rx, height);
      rGrad.addColorStop(0, 'transparent');
      rGrad.addColorStop(0.5, `rgba(192,57,43,${rand(0.02, 0.08)})`);
      rGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rGrad;
      ctx.fillRect(rx - 2, height * 0.85, 4, height * 0.15);
    }
  }

  resize();
  window.addEventListener('resize', resize);
}

/* Rain */
function initRainCanvas() {
  const canvas = qs('#rain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let drops = [];
  let animId;

  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
    initDrops();
  }

  function initDrops() {
    drops = [];
    const count = Math.floor(canvas.width * 0.15);
    for (let i = 0; i < count; i++) {
      drops.push({
        x: rand(0, canvas.width),
        y: rand(-canvas.height, 0),
        len: rand(15, 50),
        speed: rand(8, 22),
        alpha: rand(0.02, 0.12),
        width: rand(0.3, 0.8),
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(180,200,255,1)';
    const { width, height } = canvas;

    drops.forEach(d => {
      ctx.globalAlpha = d.alpha;
      ctx.lineWidth = d.width;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.len * 0.15, d.y + d.len);
      ctx.stroke();

      d.y += d.speed;
      d.x -= d.speed * 0.15;

      if (d.y > height + 50) {
        d.y = -rand(50, 200);
        d.x = rand(0, width);
      }
    });

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', () => { cancelAnimationFrame(animId); resize(); draw(); });
  draw();
}

/* Smoke */
function initSmokeCanvas() {
  const canvas = qs('#smoke-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
    initParticles();
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < 20; i++) {
      particles.push(createSmoke());
    }
  }

  function createSmoke() {
    return {
      x: rand(canvas.width * 0.2, canvas.width * 0.8),
      y: canvas.height * rand(0.5, 1),
      radius: rand(40, 120),
      alpha: rand(0.01, 0.05),
      vx: rand(-0.3, 0.3),
      vy: -rand(0.1, 0.5),
      growth: rand(0.1, 0.4),
      life: 0,
      maxLife: rand(150, 300),
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      const lifeRatio = p.life / p.maxLife;
      const alpha = p.alpha * Math.sin(lifeRatio * Math.PI);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grad.addColorStop(0, `rgba(150,100,100,${alpha})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      p.radius += p.growth;
      p.life++;

      if (p.life >= p.maxLife) { particles[i] = createSmoke(); }
    });
    animId = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', () => { cancelAnimationFrame(animId); resize(); draw(); });
  draw();
}

/* ─── Hero Parallax ─────────────────────────────────────────── */
function initHeroParallax() {
  const hero = qs('#hero');
  const reflection = qs('#hero-reflection');
  if (!hero) return;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;

    qsa('.parallax-layer', hero).forEach(layer => {
      const depth = parseFloat(layer.dataset.depth || 0.1);
      const tx = cx * depth * 60;
      const ty = cy * depth * 40;
      layer.style.transform = `translate(${tx}px, ${ty}px)`;
    });

    if (reflection) {
      reflection.style.transform = `translate(${cx * 30}px, ${cy * 20}px)`;
    }

    // Spotlight on card
    qsa('.collection-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.querySelector('.card-spotlight').style.setProperty('--mx', x + 'px');
      card.querySelector('.card-spotlight').style.setProperty('--my', y + 'px');
    });
  });
}

/* ─── Hero Headline typewriter ──────────────────────────────── */
function initHeroHeadline() {
  const lines = [
    { el: qs('#hl1'), text: 'BORN IN' },
    { el: qs('#hl2'), text: 'THE' },
    { el: qs('#hl3'), text: 'STREETS.' },
  ];

  let delay = 600;
  lines.forEach(({ el, text }) => {
    if (!el) return;
    let i = 0;
    const t = setInterval(() => {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
      } else {
        clearInterval(t);
      }
    }, 60);
    delay += text.length * 60 + 200;
  });
}

/* ═══════════════════════════════════════════════════════════════
   5. COLLECTION CARDS — canvas art
═══════════════════════════════════════════════════════════════ */
(function initCollectionCards() {
  qsa('.card-canvas').forEach(canvas => {
    const hue = parseInt(canvas.dataset.hue || 0);
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth  || 300;
      canvas.height = canvas.offsetHeight || 400;
      drawCard(ctx, canvas.width, canvas.height, hue);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement || canvas);
  });
})();

function drawCard(ctx, w, h, hue) {
  // Background
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, `hsl(${hue}, 15%, 8%)`);
  bg.addColorStop(1, `hsl(${hue}, 10%, 4%)`);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Abstract fashion silhouette
  const cx = w / 2, cy = h * 0.38;

  // Fabric texture lines
  ctx.strokeStyle = `hsla(${hue}, 20%, 30%, 0.15)`;
  ctx.lineWidth = 1;
  for (let i = 0; i < h; i += 8) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(w, i + rand(-2, 2));
    ctx.stroke();
  }

  // Figure silhouette
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.5);
  if (hue === 0) {
    // Red tinted
    grad.addColorStop(0, 'rgba(80,15,15,0.8)');
    grad.addColorStop(0.6, 'rgba(40,8,8,0.6)');
    grad.addColorStop(1, 'transparent');
  } else if (hue === 220) {
    grad.addColorStop(0, 'rgba(15,20,50,0.8)');
    grad.addColorStop(0.6, 'rgba(8,12,30,0.6)');
    grad.addColorStop(1, 'transparent');
  } else {
    grad.addColorStop(0, 'rgba(50,10,20,0.8)');
    grad.addColorStop(0.6, 'rgba(25,5,10,0.6)');
    grad.addColorStop(1, 'transparent');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Draw abstract hoodie/figure
  ctx.save();
  ctx.translate(cx, h * 0.15);

  // Head
  ctx.beginPath();
  ctx.arc(0, 30, 22, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${hue}, 10%, 12%)`;
  ctx.fill();

  // Hood
  ctx.beginPath();
  ctx.moveTo(-30, 10);
  ctx.quadraticCurveTo(-40, -30, 0, -20);
  ctx.quadraticCurveTo(40, -30, 30, 10);
  ctx.fillStyle = `hsl(${hue}, 12%, 14%)`;
  ctx.fill();

  // Body (hoodie)
  ctx.beginPath();
  ctx.moveTo(-45, 55);
  ctx.quadraticCurveTo(-55, 120, -50, h * 0.55);
  ctx.lineTo(50, h * 0.55);
  ctx.quadraticCurveTo(55, 120, 45, 55);
  ctx.quadraticCurveTo(20, 50, 0, 52);
  ctx.quadraticCurveTo(-20, 50, -45, 55);
  ctx.fillStyle = `hsl(${hue}, 12%, 13%)`;
  ctx.fill();

  // Pocket line
  ctx.beginPath();
  ctx.moveTo(-22, 130);
  ctx.quadraticCurveTo(0, 145, 22, 130);
  ctx.strokeStyle = `hsl(${hue === 0 ? 0 : hue}, 30%, 25%)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Accent glow (red for hue=0, blue for hue=220, etc.)
  let accentColor;
  if (hue === 0)   accentColor = 'rgba(192,57,43,0.3)';
  else if (hue === 220) accentColor = 'rgba(74,144,217,0.2)';
  else accentColor = 'rgba(192,57,43,0.4)';

  const accentGrad = ctx.createRadialGradient(0, 80, 0, 0, 80, 80);
  accentGrad.addColorStop(0, accentColor);
  accentGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = accentGrad;
  ctx.beginPath();
  ctx.ellipse(0, 80, 80, 80, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Bottom fog
  const fog = ctx.createLinearGradient(0, h * 0.7, 0, h);
  fog.addColorStop(0, 'transparent');
  fog.addColorStop(1, `hsl(${hue}, 12%, 4%)`);
  ctx.fillStyle = fog;
  ctx.fillRect(0, 0, w, h);
}

/* ═══════════════════════════════════════════════════════════════
   6. PRODUCT CANVAS — 3D-inspired hoodie
═══════════════════════════════════════════════════════════════ */
(function initProductCanvas() {
  const canvas = qs('#product-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth  || 500;
    canvas.height = canvas.offsetHeight || 500;
  }
  resize();
  window.addEventListener('resize', resize);

  let rotation = 0;
  let bobbing  = 0;

  function draw() {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, w, h);

    // Floor glow
    const floorGlow = ctx.createRadialGradient(w/2, h * 0.85, 0, w/2, h * 0.85, w * 0.4);
    floorGlow.addColorStop(0, 'rgba(192,57,43,0.12)');
    floorGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = floorGlow;
    ctx.fillRect(0, 0, w, h);

    // Grid lines on floor
    ctx.strokeStyle = 'rgba(192,57,43,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const x = (i / 9) * w;
      const perspY = h * 0.7;
      ctx.beginPath();
      ctx.moveTo(x, perspY);
      ctx.lineTo(w / 2, h * 0.5);
      ctx.stroke();
    }

    bobbing += 0.015;
    rotation += 0.005;
    const bob = Math.sin(bobbing) * 8;
    const cx = w / 2, cy = h / 2 + bob;
    const scale = Math.min(w, h) * 0.0028;
    const shadowScale = 0.8 + Math.sin(bobbing) * 0.08;

    ctx.save();
    ctx.translate(cx, cy);

    // 3D-ish perspective with squish
    const squishX = 1 + Math.sin(rotation * 2) * 0.05;
    const squishY = 1 - Math.sin(rotation * 2) * 0.02;

    // Shadow
    ctx.save();
    ctx.translate(0, h * 0.35 - bob);
    const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 80 * scale * shadowScale);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.5)');
    shadowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGrad;
    ctx.scale(squishX * shadowScale, 0.3);
    ctx.beginPath();
    ctx.arc(0, 0, 80 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Parse color
    let c = currentColor;
    let r = parseInt(c.slice(1,3), 16);
    let g = parseInt(c.slice(3,5), 16);
    let b = parseInt(c.slice(5,7), 16);

    const lighterC = `rgba(${Math.min(r+40,255)},${Math.min(g+40,255)},${Math.min(b+40,255)},1)`;
    const darkerC  = `rgba(${Math.max(r-20,0)},${Math.max(g-20,0)},${Math.max(b-20,0)},1)`;

    ctx.scale(scale * squishX, scale * squishY);

    // HOODIE BODY
    const bodyGrad = ctx.createLinearGradient(-80, -60, 80, 120);
    bodyGrad.addColorStop(0, lighterC);
    bodyGrad.addColorStop(0.5, c);
    bodyGrad.addColorStop(1, darkerC);

    // Draw hoodie shape
    ctx.beginPath();
    ctx.moveTo(-50, -90);  // left shoulder neck
    ctx.bezierCurveTo(-65, -85, -90, -70, -95, -50); // left shoulder
    ctx.bezierCurveTo(-105, -30, -110, 0, -100, 30); // left sleeve top
    ctx.bezierCurveTo(-95, 50, -85, 60, -75, 80);    // left sleeve bottom
    ctx.lineTo(-65, 95);  // left hem side
    ctx.bezierCurveTo(-60, 120, -40, 125, 0, 125);   // bottom
    ctx.bezierCurveTo(40, 125, 60, 120, 65, 95);
    ctx.lineTo(75, 80);
    ctx.bezierCurveTo(85, 60, 95, 50, 100, 30);
    ctx.bezierCurveTo(110, 0, 105, -30, 95, -50);
    ctx.bezierCurveTo(90, -70, 65, -85, 50, -90);
    ctx.bezierCurveTo(30, -95, -30, -95, -50, -90);
    ctx.closePath();
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Hood
    const hoodGrad = ctx.createLinearGradient(-40, -170, 40, -80);
    hoodGrad.addColorStop(0, lighterC);
    hoodGrad.addColorStop(1, darkerC);
    ctx.beginPath();
    ctx.moveTo(-50, -90);
    ctx.bezierCurveTo(-55, -120, -45, -165, 0, -170);
    ctx.bezierCurveTo(45, -165, 55, -120, 50, -90);
    ctx.bezierCurveTo(30, -85, -30, -85, -50, -90);
    ctx.fillStyle = hoodGrad;
    ctx.fill();

    // Hood inner shadow
    const hoodInner = ctx.createRadialGradient(0, -120, 0, 0, -120, 40);
    hoodInner.addColorStop(0, 'rgba(0,0,0,0.5)');
    hoodInner.addColorStop(1, 'transparent');
    ctx.fillStyle = hoodInner;
    ctx.beginPath();
    ctx.ellipse(0, -120, 28, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Kangaroo pocket
    ctx.beginPath();
    ctx.roundRect(-45, 35, 90, 55, 8);
    ctx.strokeStyle = `rgba(${Math.min(r+60,255)},${Math.min(g+60,255)},${Math.min(b+60,255)},0.25)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Pocket seam
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.lineTo(0, 88);
    ctx.stroke();

    // Drawstrings
    ctx.strokeStyle = `rgba(${Math.min(r+80,255)},${Math.min(g+80,255)},${Math.min(b+80,255)},0.4)`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-10, -100);
    ctx.quadraticCurveTo(-8, -30, -15, 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, -100);
    ctx.quadraticCurveTo(8, -30, 15, 30);
    ctx.stroke();

    // INZZOUT label
    ctx.fillStyle = `rgba(${Math.min(r+100,255)},${Math.min(g+100,255)},${Math.min(b+100,255)},0.5)`;
    ctx.font = 'bold 10px "Bebas Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText('INZZOUT', 0, 20);

    // Highlight
    const highlight = ctx.createLinearGradient(-30, -170, 30, -80);
    highlight.addColorStop(0, 'rgba(255,255,255,0.08)');
    highlight.addColorStop(1, 'transparent');
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.moveTo(-50, -90);
    ctx.bezierCurveTo(-35, -120, -20, -165, 0, -168);
    ctx.bezierCurveTo(20, -165, 35, -120, 50, -90);
    ctx.bezierCurveTo(20, -80, -20, -80, -50, -90);
    ctx.fill();

    ctx.restore();
    requestAnimationFrame(draw);
  }

  draw();

  // Color swatches
  qsa('.swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      qsa('.swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      currentColor = swatch.dataset.color;
    });
  });

  // Size buttons
  qsa('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSize = btn.textContent.trim();
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   7. PRODUCT CANVAS DRAWERS — unique per item type
═══════════════════════════════════════════════════════════════ */

/** Draw cargo pants on a canvas */
function drawCargoPants(ctx, w, h, baseColor) {
  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#111');
  bg.addColorStop(1, '#070707');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2, top = h * 0.08, bot = h * 0.92;
  const waistW = w * 0.5, legW = w * 0.22;

  // Ambient glow
  const glow = ctx.createRadialGradient(cx, h * 0.5, 0, cx, h * 0.5, w * 0.55);
  glow.addColorStop(0, 'rgba(192,57,43,0.08)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Waistband
  ctx.fillStyle = shadeColor(baseColor, -30);
  ctx.fillRect(cx - waistW * 0.55, top, waistW * 1.1, h * 0.08);

  // Belt loops
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = shadeColor(baseColor, -50);
    const lx = cx - waistW * 0.45 + i * (waistW * 0.22);
    ctx.fillRect(lx, top - 4, 6, h * 0.05);
  }

  // Left leg
  ctx.beginPath();
  ctx.moveTo(cx - waistW * 0.5, top + h * 0.07);
  ctx.lineTo(cx - waistW * 0.02, h * 0.52);
  ctx.lineTo(cx - legW * 0.9, bot);
  ctx.lineTo(cx - legW * 1.45, bot);
  ctx.lineTo(cx - waistW * 0.52, top + h * 0.07);
  const legGradL = ctx.createLinearGradient(cx - waistW * 0.5, 0, cx, 0);
  legGradL.addColorStop(0, shadeColor(baseColor, -20));
  legGradL.addColorStop(1, shadeColor(baseColor, -40));
  ctx.fillStyle = legGradL;
  ctx.fill();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(cx + waistW * 0.5, top + h * 0.07);
  ctx.lineTo(cx + waistW * 0.02, h * 0.52);
  ctx.lineTo(cx + legW * 0.9, bot);
  ctx.lineTo(cx + legW * 1.45, bot);
  ctx.lineTo(cx + waistW * 0.52, top + h * 0.07);
  const legGradR = ctx.createLinearGradient(cx, 0, cx + waistW * 0.5, 0);
  legGradR.addColorStop(0, shadeColor(baseColor, -40));
  legGradR.addColorStop(1, shadeColor(baseColor, -20));
  ctx.fillStyle = legGradR;
  ctx.fill();

  // Cargo pockets left
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = shadeColor(baseColor, -35);
  const pLx = cx - waistW * 0.42, pLy = h * 0.32, pW = w * 0.14, pH = h * 0.12;
  ctx.fillRect(pLx, pLy, pW, pH);
  ctx.strokeRect(pLx, pLy, pW, pH);
  ctx.beginPath(); ctx.moveTo(pLx, pLy + pH * 0.5); ctx.lineTo(pLx + pW, pLy + pH * 0.5); ctx.stroke();

  // Cargo pockets right
  const pRx = cx + waistW * 0.28;
  ctx.fillRect(pRx, pLy, pW, pH);
  ctx.strokeRect(pRx, pLy, pW, pH);
  ctx.beginPath(); ctx.moveTo(pRx, pLy + pH * 0.5); ctx.lineTo(pRx + pW, pLy + pH * 0.5); ctx.stroke();

  // Seam lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx, top + h * 0.07); ctx.lineTo(cx, bot); ctx.stroke();

  // Cuff bands
  ctx.fillStyle = shadeColor(baseColor, -50);
  ctx.fillRect(cx - legW * 1.45, bot - h * 0.03, legW * 0.55, h * 0.03);
  ctx.fillRect(cx + legW * 0.9, bot - h * 0.03, legW * 0.55, h * 0.03);

  // INZZOUT label
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.font = `bold ${w * 0.065}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('INZZOUT', cx, top + h * 0.04);
  ctx.restore();

  addScanlines(ctx, w, h);
}

/** Draw a tee shirt */
function drawTee(ctx, w, h, baseColor) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0d0d0d'; ctx.fillRect(0, 0, w, h);
  const cx = w / 2, top = h * 0.1;
  const glow = ctx.createRadialGradient(cx, h * 0.4, 0, cx, h * 0.4, w * 0.5);
  glow.addColorStop(0, 'rgba(192,57,43,0.06)'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

  const bodyGrad = ctx.createLinearGradient(cx - w * 0.3, 0, cx + w * 0.3, 0);
  bodyGrad.addColorStop(0, shadeColor(baseColor, 15));
  bodyGrad.addColorStop(0.5, baseColor);
  bodyGrad.addColorStop(1, shadeColor(baseColor, -20));

  // Body
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.22, top + h * 0.04);
  ctx.lineTo(cx - w * 0.3,  top + h * 0.14);
  ctx.lineTo(cx - w * 0.3,  h * 0.78);
  ctx.lineTo(cx + w * 0.3,  h * 0.78);
  ctx.lineTo(cx + w * 0.3,  top + h * 0.14);
  ctx.lineTo(cx + w * 0.22, top + h * 0.04);
  ctx.fillStyle = bodyGrad; ctx.fill();

  // Collar
  ctx.beginPath();
  ctx.ellipse(cx, top + h * 0.06, w * 0.1, h * 0.045, 0, 0, Math.PI * 2);
  ctx.fillStyle = shadeColor(baseColor, -25); ctx.fill();

  // Left sleeve
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.22, top + h * 0.04);
  ctx.bezierCurveTo(cx - w * 0.4, top, cx - w * 0.48, top + h * 0.1, cx - w * 0.3, top + h * 0.14);
  ctx.lineTo(cx - w * 0.3, top + h * 0.14);
  ctx.closePath();
  ctx.fillStyle = shadeColor(baseColor, 10); ctx.fill();

  // Right sleeve
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.22, top + h * 0.04);
  ctx.bezierCurveTo(cx + w * 0.4, top, cx + w * 0.48, top + h * 0.1, cx + w * 0.3, top + h * 0.14);
  ctx.lineTo(cx + w * 0.3, top + h * 0.14);
  ctx.closePath();
  ctx.fillStyle = shadeColor(baseColor, 10); ctx.fill();

  // Graphic: bold PHANTOM text with red underline
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `bold ${w * 0.09}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('PHANTOM', cx, h * 0.45);
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(cx - w * 0.18, h * 0.47, w * 0.36, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = `${w * 0.055}px "Space Grotesk", sans-serif`;
  ctx.fillText('INZZOUT EST.2024', cx, h * 0.52);
  ctx.restore();

  // Hem seam
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.3, h * 0.75); ctx.lineTo(cx + w * 0.3, h * 0.75); ctx.stroke();

  addScanlines(ctx, w, h);
}

/** Draw a jacket */
function drawJacket(ctx, w, h, baseColor) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, w, h);
  const cx = w / 2, top = h * 0.08;

  const glow = ctx.createRadialGradient(cx, h * 0.45, 0, cx, h * 0.45, w * 0.6);
  glow.addColorStop(0, 'rgba(192,57,43,0.1)'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

  // Main body
  const jGrad = ctx.createLinearGradient(0, 0, w, h);
  jGrad.addColorStop(0, shadeColor(baseColor, 20));
  jGrad.addColorStop(0.5, baseColor);
  jGrad.addColorStop(1, shadeColor(baseColor, -30));
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.28, top + h * 0.06);
  ctx.lineTo(cx - w * 0.35, h * 0.8);
  ctx.lineTo(cx + w * 0.35, h * 0.8);
  ctx.lineTo(cx + w * 0.28, top + h * 0.06);
  ctx.bezierCurveTo(cx + w * 0.22, top, cx - w * 0.22, top, cx - w * 0.28, top + h * 0.06);
  ctx.fillStyle = jGrad; ctx.fill();

  // Collar / lapels
  ctx.beginPath();
  ctx.moveTo(cx, top + h * 0.03);
  ctx.lineTo(cx - w * 0.12, top + h * 0.22);
  ctx.lineTo(cx - w * 0.04, top + h * 0.12);
  ctx.closePath();
  ctx.fillStyle = shadeColor(baseColor, -40); ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx, top + h * 0.03);
  ctx.lineTo(cx + w * 0.12, top + h * 0.22);
  ctx.lineTo(cx + w * 0.04, top + h * 0.12);
  ctx.closePath();
  ctx.fillStyle = shadeColor(baseColor, -35); ctx.fill();

  // Left sleeve
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.28, top + h * 0.06);
  ctx.bezierCurveTo(cx - w * 0.45, top + h * 0.02, cx - w * 0.5, top + h * 0.15, cx - w * 0.48, top + h * 0.5);
  ctx.lineTo(cx - w * 0.37, top + h * 0.52);
  ctx.bezierCurveTo(cx - w * 0.38, top + h * 0.2, cx - w * 0.35, top + h * 0.1, cx - w * 0.28, top + h * 0.14);
  ctx.fillStyle = shadeColor(baseColor, -10); ctx.fill();

  // Right sleeve
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.28, top + h * 0.06);
  ctx.bezierCurveTo(cx + w * 0.45, top + h * 0.02, cx + w * 0.5, top + h * 0.15, cx + w * 0.48, top + h * 0.5);
  ctx.lineTo(cx + w * 0.37, top + h * 0.52);
  ctx.bezierCurveTo(cx + w * 0.38, top + h * 0.2, cx + w * 0.35, top + h * 0.1, cx + w * 0.28, top + h * 0.14);
  ctx.fillStyle = shadeColor(baseColor, -15); ctx.fill();

  // Zipper
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, top + h * 0.05); ctx.lineTo(cx, h * 0.78); ctx.stroke();
  for (let i = 0; i < 14; i++) {
    const zy = top + h * 0.07 + i * h * 0.05;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(cx - 4, zy, 8, 3);
  }

  // Chest pocket
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
  ctx.strokeRect(cx + w * 0.06, top + h * 0.18, w * 0.12, h * 0.07);
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.06, top + h * 0.22);
  ctx.lineTo(cx + w * 0.18, top + h * 0.22); ctx.stroke();

  // Red accent stripe on sleeve
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(cx - w * 0.48, top + h * 0.35, w * 0.11, 3);
  ctx.fillRect(cx + w * 0.37, top + h * 0.35, w * 0.11, 3);

  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = `bold ${w * 0.07}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('BLOOD', cx, h * 0.6);
  ctx.fillText('LINES', cx, h * 0.68);
  ctx.fillStyle = '#c0392b';
  ctx.font = `${w * 0.045}px "Space Grotesk", sans-serif`;
  ctx.fillText('INZZOUT', cx, h * 0.74);
  ctx.restore();
  addScanlines(ctx, w, h);
}

/** Draw shorts */
function drawShorts(ctx, w, h, baseColor) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0d0d0d'; ctx.fillRect(0, 0, w, h);
  const cx = w / 2, top = h * 0.15;

  const glow = ctx.createRadialGradient(cx, h * 0.5, 0, cx, h * 0.5, w * 0.5);
  glow.addColorStop(0, 'rgba(192,57,43,0.07)'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

  // Waistband
  ctx.fillStyle = shadeColor(baseColor, -30);
  ctx.fillRect(cx - w * 0.3, top, w * 0.6, h * 0.07);

  // Body
  const sGrad = ctx.createLinearGradient(0, top, w, h * 0.8);
  sGrad.addColorStop(0, shadeColor(baseColor, 10));
  sGrad.addColorStop(1, shadeColor(baseColor, -20));

  // Left leg
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.3, top + h * 0.07);
  ctx.lineTo(cx - w * 0.02, h * 0.52);
  ctx.lineTo(cx - w * 0.22, h * 0.75);
  ctx.lineTo(cx - w * 0.32, h * 0.75);
  ctx.lineTo(cx - w * 0.32, top + h * 0.07);
  ctx.fillStyle = shadeColor(baseColor, 5); ctx.fill();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.3, top + h * 0.07);
  ctx.lineTo(cx + w * 0.02, h * 0.52);
  ctx.lineTo(cx + w * 0.22, h * 0.75);
  ctx.lineTo(cx + w * 0.32, h * 0.75);
  ctx.lineTo(cx + w * 0.32, top + h * 0.07);
  ctx.fillStyle = shadeColor(baseColor, -10); ctx.fill();

  // Drawstring
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.08, top + h * 0.035);
  ctx.quadraticCurveTo(cx, top + h * 0.06, cx + w * 0.08, top + h * 0.035);
  ctx.stroke();

  // Logo
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = `bold ${w * 0.08}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('IZ', cx, h * 0.58);
  ctx.restore();

  addScanlines(ctx, w, h);
}

/** Draw crew neck sweatshirt */
function drawCrewNeck(ctx, w, h, baseColor) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0d0d0d'; ctx.fillRect(0, 0, w, h);
  const cx = w / 2, top = h * 0.08;

  const glow = ctx.createRadialGradient(cx, h * 0.4, 0, cx, h * 0.4, w * 0.55);
  glow.addColorStop(0, 'rgba(192,57,43,0.08)'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

  const cGrad = ctx.createLinearGradient(0, 0, w, 0);
  cGrad.addColorStop(0, shadeColor(baseColor, 10));
  cGrad.addColorStop(0.5, baseColor);
  cGrad.addColorStop(1, shadeColor(baseColor, -15));

  // Body
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.28, top + h * 0.06);
  ctx.lineTo(cx - w * 0.32, h * 0.8);
  ctx.lineTo(cx + w * 0.32, h * 0.8);
  ctx.lineTo(cx + w * 0.28, top + h * 0.06);
  ctx.bezierCurveTo(cx + w * 0.22, top + h * 0.02, cx - w * 0.22, top + h * 0.02, cx - w * 0.28, top + h * 0.06);
  ctx.fillStyle = cGrad; ctx.fill();

  // Collar (crew neck)
  ctx.beginPath();
  ctx.ellipse(cx, top + h * 0.06, w * 0.12, h * 0.04, 0, 0, Math.PI * 2);
  ctx.fillStyle = shadeColor(baseColor, -40); ctx.fill();
  ctx.strokeStyle = shadeColor(baseColor, -60); ctx.lineWidth = 3;
  ctx.stroke();

  // Left sleeve
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.28, top + h * 0.06);
  ctx.bezierCurveTo(cx - w * 0.42, top, cx - w * 0.5, top + h * 0.1, cx - w * 0.48, top + h * 0.48);
  ctx.lineTo(cx - w * 0.36, top + h * 0.5);
  ctx.bezierCurveTo(cx - w * 0.36, top + h * 0.15, cx - w * 0.32, top + h * 0.1, cx - w * 0.28, top + h * 0.1);
  ctx.fillStyle = shadeColor(baseColor, 8); ctx.fill();

  // Right sleeve
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.28, top + h * 0.06);
  ctx.bezierCurveTo(cx + w * 0.42, top, cx + w * 0.5, top + h * 0.1, cx + w * 0.48, top + h * 0.48);
  ctx.lineTo(cx + w * 0.36, top + h * 0.5);
  ctx.bezierCurveTo(cx + w * 0.36, top + h * 0.15, cx + w * 0.32, top + h * 0.1, cx + w * 0.28, top + h * 0.1);
  ctx.fillStyle = shadeColor(baseColor, -8); ctx.fill();

  // Ribbed hem
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `rgba(255,255,255,${0.04 + i * 0.01})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.32, h * 0.8 - i * 4);
    ctx.lineTo(cx + w * 0.32, h * 0.8 - i * 4);
    ctx.stroke();
  }

  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `bold ${w * 0.14}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('SHADOW', cx, h * 0.52);
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(cx - w * 0.22, h * 0.54, w * 0.44, 2);
  ctx.restore();

  addScanlines(ctx, w, h);
}

/** Draw joggers */
function drawJoggers(ctx, w, h, baseColor) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0d0d0d'; ctx.fillRect(0, 0, w, h);
  const cx = w / 2, top = h * 0.1;

  const glow = ctx.createRadialGradient(cx, h * 0.5, 0, cx, h * 0.5, w * 0.5);
  glow.addColorStop(0, 'rgba(192,57,43,0.06)'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

  // Waistband elastic
  ctx.fillStyle = shadeColor(baseColor, -35);
  ctx.fillRect(cx - w * 0.28, top, w * 0.56, h * 0.08);
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.28, top + i * h * 0.01);
    ctx.lineTo(cx + w * 0.28, top + i * h * 0.01); ctx.stroke();
  }

  // Drawstring
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.07, top + h * 0.04);
  ctx.bezierCurveTo(cx - w * 0.04, top + h * 0.09, cx + w * 0.04, top + h * 0.09, cx + w * 0.07, top + h * 0.04);
  ctx.stroke();

  const jGrad = ctx.createLinearGradient(0, 0, w, 0);
  jGrad.addColorStop(0, shadeColor(baseColor, 12)); jGrad.addColorStop(1, shadeColor(baseColor, -25));

  // Left leg — tapered
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.28, top + h * 0.08);
  ctx.lineTo(cx - w * 0.02, h * 0.5);
  ctx.lineTo(cx - w * 0.14, h * 0.88);
  ctx.lineTo(cx - w * 0.26, h * 0.88);
  ctx.lineTo(cx - w * 0.3, top + h * 0.08);
  ctx.fillStyle = jGrad; ctx.fill();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.28, top + h * 0.08);
  ctx.lineTo(cx + w * 0.02, h * 0.5);
  ctx.lineTo(cx + w * 0.14, h * 0.88);
  ctx.lineTo(cx + w * 0.26, h * 0.88);
  ctx.lineTo(cx + w * 0.3, top + h * 0.08);
  ctx.fillStyle = shadeColor(baseColor, -18); ctx.fill();

  // Ankle ribbing
  ctx.fillStyle = shadeColor(baseColor, -45);
  ctx.fillRect(cx - w * 0.26, h * 0.86, w * 0.12, h * 0.04);
  ctx.fillRect(cx + w * 0.14, h * 0.86, w * 0.12, h * 0.04);

  // Side stripe
  ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.28, top + h * 0.09);
  ctx.lineTo(cx - w * 0.25, h * 0.87); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.28, top + h * 0.09);
  ctx.lineTo(cx + w * 0.25, h * 0.87); ctx.stroke();

  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = `bold ${w * 0.07}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('IZ', cx, h * 0.67);
  ctx.restore();

  addScanlines(ctx, w, h);
}

/** Draw vest */
function drawVest(ctx, w, h, baseColor) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0d0d0d'; ctx.fillRect(0, 0, w, h);
  const cx = w / 2, top = h * 0.06;

  const glow = ctx.createRadialGradient(cx, h * 0.4, 0, cx, h * 0.4, w * 0.5);
  glow.addColorStop(0, 'rgba(192,57,43,0.09)'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

  const vGrad = ctx.createLinearGradient(0, 0, w, h);
  vGrad.addColorStop(0, shadeColor(baseColor, 20));
  vGrad.addColorStop(0.5, baseColor);
  vGrad.addColorStop(1, shadeColor(baseColor, -25));

  // Body
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.26, top + h * 0.06);
  ctx.lineTo(cx - w * 0.28, h * 0.82);
  ctx.lineTo(cx + w * 0.28, h * 0.82);
  ctx.lineTo(cx + w * 0.26, top + h * 0.06);
  ctx.bezierCurveTo(cx + w * 0.18, top, cx - w * 0.18, top, cx - w * 0.26, top + h * 0.06);
  ctx.fillStyle = vGrad; ctx.fill();

  // Armholes
  ctx.strokeStyle = shadeColor(baseColor, -50); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx - w * 0.26, top + h * 0.15, w * 0.07, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + w * 0.26, top + h * 0.15, w * 0.07, Math.PI * 0.5, -Math.PI * 0.5); ctx.stroke();

  // Center zip
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, top + h * 0.04); ctx.lineTo(cx, h * 0.8); ctx.stroke();
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(cx - 4, top + h * 0.06 + i * h * 0.059, 8, 3);
  }

  // Multiple pockets
  const pStyle = 'rgba(255,255,255,0.1)';
  ctx.strokeStyle = pStyle; ctx.lineWidth = 1;
  ctx.strokeRect(cx - w * 0.22, top + h * 0.16, w * 0.14, h * 0.08); // upper L
  ctx.strokeRect(cx + w * 0.08, top + h * 0.16, w * 0.14, h * 0.08); // upper R
  ctx.strokeRect(cx - w * 0.22, h * 0.48, w * 0.16, h * 0.1);        // lower L
  ctx.strokeRect(cx + w * 0.06, h * 0.48, w * 0.16, h * 0.1);        // lower R

  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = `bold ${w * 0.1}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('PHANTOM', cx, h * 0.7);
  ctx.restore();

  addScanlines(ctx, w, h);
}

/** Draw cap/hat */
function drawCap(ctx, w, h, baseColor) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0d0d0d'; ctx.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h * 0.42;

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.5);
  glow.addColorStop(0, 'rgba(192,57,43,0.1)'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

  const cGrad = ctx.createLinearGradient(cx - w * 0.35, cy - h * 0.3, cx + w * 0.35, cy);
  cGrad.addColorStop(0, shadeColor(baseColor, 20));
  cGrad.addColorStop(0.5, baseColor);
  cGrad.addColorStop(1, shadeColor(baseColor, -30));

  // Cap crown
  ctx.beginPath();
  ctx.ellipse(cx, cy, w * 0.35, h * 0.28, 0, Math.PI, 0);
  ctx.fillStyle = cGrad; ctx.fill();

  // Brim
  ctx.beginPath();
  ctx.ellipse(cx, cy + h * 0.01, w * 0.38, h * 0.07, 0, 0, Math.PI);
  ctx.fillStyle = shadeColor(baseColor, -25); ctx.fill();

  // Brim underside
  ctx.beginPath();
  ctx.ellipse(cx + w * 0.04, cy + h * 0.04, w * 0.35, h * 0.05, -0.1, 0, Math.PI);
  ctx.fillStyle = shadeColor(baseColor, -50); ctx.fill();

  // Crown seams
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
  for (let i = 1; i < 6; i++) {
    ctx.beginPath();
    const angle = (i / 6) * Math.PI;
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * w * 0.35, cy - Math.sin(angle) * h * 0.28);
    ctx.stroke();
  }

  // Front panel logo
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = `bold ${w * 0.12}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('IZ', cx, cy - h * 0.06);
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(cx - w * 0.08, cy - h * 0.04, w * 0.16, 2);

  // Sweatband line
  ctx.strokeStyle = shadeColor(baseColor, -45); ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.35, Math.PI, 0);
  ctx.stroke();

  // Adjustable strap
  ctx.fillStyle = shadeColor(baseColor, -40);
  ctx.fillRect(cx - w * 0.08, cy + h * 0.14, w * 0.16, h * 0.04);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
  ctx.strokeRect(cx - w * 0.08, cy + h * 0.14, w * 0.16, h * 0.04);

  addScanlines(ctx, w, h);
}

/** Shade a hex color by amount (-255 to 255) */
function shadeColor(hex, amount) {
  let r = parseInt(hex.slice(1,3), 16);
  let g = parseInt(hex.slice(3,5), 16);
  let b = parseInt(hex.slice(5,7), 16);
  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));
  return `rgb(${r},${g},${b})`;
}

/** Add scanline overlay to canvas */
function addScanlines(ctx, w, h) {
  for (let y = 0; y < h; y += 4) {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, y, w, 2);
  }
}

/** Dispatch the right drawer per product type */
function drawProductImage(ctx, w, h, type, baseColor) {
  baseColor = baseColor || '#141414';
  switch (type) {
    case 'cargo':   drawCargoPants(ctx, w, h, baseColor); break;
    case 'tee':     drawTee(ctx, w, h, baseColor);        break;
    case 'jacket':  drawJacket(ctx, w, h, baseColor);     break;
    case 'shorts':  drawShorts(ctx, w, h, baseColor);     break;
    case 'crew':    drawCrewNeck(ctx, w, h, baseColor);   break;
    case 'joggers': drawJoggers(ctx, w, h, baseColor);    break;
    case 'vest':    drawVest(ctx, w, h, baseColor);       break;
    case 'cap':     drawCap(ctx, w, h, baseColor);        break;
    default:        drawCard(ctx, w, h, 0);               break;
  }
}

/* ═══════════════════════════════════════════════════════════════
   7b. PRODUCT CAROUSEL — with ADD TO CART buttons + MISSION PASSED
═══════════════════════════════════════════════════════════════ */
(function initCarousel() {
  const track = qs('#carousel-track');
  if (!track) return;

  const products = [
    { name: 'NOIR CARGO PANTS',   price: '$290', img: 'assets/products/cargo_pants.jpg',    badge: 'NEW',      color: '#1a1a2e' },
    { name: 'PHANTOM TEE',        price: '$120', img: 'assets/products/phantom_tee.jpg',     badge: '',          color: '#0a0a0a' },
    { name: 'BLOOD LINES JACKET', price: '$580', img: 'assets/products/blood_jacket.jpg',   badge: 'LIMITED',   color: '#1a0808' },
    { name: 'DARK MOTION SHORTS', price: '$180', img: 'assets/products/dark_shorts.jpg',    badge: '',          color: '#141420' },
    { name: 'SHADOW CREW NECK',   price: '$260', img: 'assets/products/shadow_crew.jpg',    badge: 'LOW STOCK', color: '#111111' },
    { name: 'MOVEMENT JOGGERS',   price: '$220', img: 'assets/products/movement_joggers.jpg', badge: '',        color: '#181825' },
    { name: 'PHANTOM VEST',       price: '$340', img: 'assets/products/phantom_vest.jpg',   badge: 'NEW',       color: '#0d0d0d' },
    { name: 'NOIR CAP',           price: '$85',  img: 'assets/products/noir_cap.jpg',       badge: '',          color: '#131313' },
  ];

  products.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'carousel-product-card';
    card.innerHTML = `
      <div class="cp-card-img" style="position:relative;overflow:hidden">
        <img
          src="${p.img}"
          alt="${p.name}"
          loading="lazy"
          class="cp-product-photo"
          style="width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.5s cubic-bezier(0.16,1,0.3,1)"
        />
        <div class="cp-card-reflection"></div>
        <div class="cp-img-overlay"></div>
        ${p.badge ? `<div class="card-badge cp-badge">${p.badge}</div>` : ''}
      </div>
      <div class="cp-card-float-shadow"></div>
      <div class="cp-card-info">
        <div class="cp-card-name">${p.name}</div>
        <div class="cp-card-bottom-row">
          <div class="cp-card-price">${p.price}</div>
          <button class="cp-atc-btn magnetic" data-name="${p.name}" data-price="${p.price}" aria-label="Add to cart">
            <span class="cp-atc-icon">+</span>
            <span class="cp-atc-text">ADD TO CART</span>
            <span class="cp-atc-glow"></span>
          </button>
        </div>
      </div>`;
    track.appendChild(card);

    // Zoom on hover
    const img = card.querySelector('.cp-product-photo');
    card.addEventListener('mouseenter', () => { if (img) img.style.transform = 'scale(1.06)'; });
    card.addEventListener('mouseleave', () => { if (img) img.style.transform = 'scale(1)'; });

    // ADD TO CART button on each card
    card.querySelector('.cp-atc-btn').addEventListener('click', e => {
      e.stopPropagation();
      const btn = e.currentTarget;

      // Ripple on button
      btn.classList.add('cp-atc-loading');
      btn.querySelector('.cp-atc-text').textContent = '✓ ADDED';

      // Mission passed
      if (typeof showMissionPassed === 'function') {
        setTimeout(() => showMissionPassed(`${p.name} — ADDED TO WARDROBE`), 120);
      }
      // GTA toast
      if (typeof showGTAToast === 'function') {
        showGTAToast({ icon: '✓', iconClass: 'green', title: 'ITEM ACQUIRED', sub: `${p.name} — ${p.price}` });
      }
      // Wanted level
      if (typeof increaseWanted === 'function') increaseWanted(1);

      addToCart(p.name, p.price, p.color, 'M');

      setTimeout(() => {
        btn.classList.remove('cp-atc-loading');
        btn.querySelector('.cp-atc-text').textContent = 'ADD TO CART';
      }, 2800);
    });
  });

  // ── Prev/Next ───────────────────────────────────────────────
  const prev = qs('#carousel-prev');
  const next = qs('#carousel-next');
  const wrapper = qs('#carousel-track-wrapper');
  let offset = 0;

  function getCardWidth() {
    const card = track.querySelector('.carousel-product-card');
    return card ? card.offsetWidth + 20 : 240;
  }
  function getMaxOffset() {
    return -(track.scrollWidth - (wrapper ? wrapper.offsetWidth : 0));
  }

  next && next.addEventListener('click', e => {
    e.stopPropagation();
    offset = Math.max(offset - getCardWidth(), getMaxOffset());
    track.style.transform = `translateX(${offset}px)`;
  });
  prev && prev.addEventListener('click', e => {
    e.stopPropagation();
    offset = Math.min(offset + getCardWidth(), 0);
    track.style.transform = `translateX(${offset}px)`;
  });

  // Auto-scroll (pauses on hover)
  let autoId = setInterval(() => {
    offset -= getCardWidth();
    if (offset < getMaxOffset() - 10) offset = 0;
    track.style.transform = `translateX(${offset}px)`;
  }, 3800);

  wrapper && wrapper.addEventListener('mouseenter', () => clearInterval(autoId));
  wrapper && wrapper.addEventListener('mouseleave', () => {
    autoId = setInterval(() => {
      offset -= getCardWidth();
      if (offset < getMaxOffset() - 10) offset = 0;
      track.style.transform = `translateX(${offset}px)`;
    }, 3800);
  });
})();



/* ═══════════════════════════════════════════════════════════════
   8. ADD TO CART
═══════════════════════════════════════════════════════════════ */
function addToCart(name, price, color, size) {
  name  = name  || 'PHANTOM OVERSIZED HOODIE';
  price = price || '$380';
  color = color || currentColor;
  size  = size  || currentSize;

  cartItems.push({ name, price, color, size, id: Date.now() });
  updateCart();
  spawnRipple();
  openCart();
}

function updateCart() {
  const countEl = qs('#cart-count');
  const itemsEl = qs('#cart-items');
  const footer  = qs('#cart-footer');
  const totalEl = qs('#cart-total-price');

  if (countEl) {
    countEl.textContent = cartItems.length;
    countEl.classList.toggle('show', cartItems.length > 0);
  }

  if (!itemsEl) return;

  if (cartItems.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><p>Your cart is empty.</p><button class="btn btn-secondary magnetic">SHOP NOW &#8594;</button></div>`;
    footer && (footer.style.display = 'none');
    return;
  }

  footer && (footer.style.display = 'block');

  itemsEl.innerHTML = cartItems.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-img">
        <canvas id="ci-${item.id}" width="70" height="80"></canvas>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">SIZE: ${item.size} &nbsp;|&nbsp; COLOR: <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};vertical-align:middle;margin-left:4px"></span></div>
        <div class="cart-item-price">${item.price}</div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove">&#x2715;</button>
    </div>`).join('');

  // Draw mini canvas for each cart item
  cartItems.forEach(item => {
    setTimeout(() => {
      const c = qs(`#ci-${item.id}`);
      if (c) drawCard(c.getContext('2d'), 70, 80, 0);
    }, 50);
  });

  // Remove buttons
  qsa('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      cartItems = cartItems.filter(item => item.id !== id);
      updateCart();
    });
  });

  // Total
  if (totalEl) {
    const total = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.price.replace('$',''));
    }, 0);
    totalEl.textContent = '$' + total.toFixed(0);
  }
}

function openCart() {
  qs('#cart-drawer').classList.add('open');
  qs('#cart-overlay').classList.add('show');
  document.body.classList.add('cart-open');
}

function closeCart() {
  qs('#cart-drawer').classList.remove('open');
  qs('#cart-overlay').classList.remove('show');
  document.body.classList.remove('cart-open');
}

function spawnRipple() {
  const btn = qs('#add-to-cart');
  const container = qs('#ripple-container');
  if (!btn || !container) return;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  const size = Math.max(window.innerWidth, window.innerHeight) * 0.6;
  ripple.style.cssText = `
    left:${rect.left + rect.width/2}px;
    top:${rect.top + rect.height/2}px;
    width:${size}px;
    height:${size}px;
  `;
  container.appendChild(ripple);
  setTimeout(() => ripple.remove(), 1100);
}

// Cart event listeners
document.addEventListener('DOMContentLoaded', () => {
  qs('#add-to-cart') && qs('#add-to-cart').addEventListener('click', () => addToCart());
  qs('#cart-btn')    && qs('#cart-btn').addEventListener('click', openCart);
  qs('#cart-close')  && qs('#cart-close').addEventListener('click', closeCart);
  qs('#cart-overlay') && qs('#cart-overlay').addEventListener('click', closeCart);
});

/* ═══════════════════════════════════════════════════════════════
   9. LOOKBOOK
═══════════════════════════════════════════════════════════════ */
(function initLookbook() {
  const slides = qsa('.lookbook-slide');
  const navBtns = qsa('.lb-nav-btn');
  const flash = qs('#lb-flash');
  let current = 0;
  let autoId;

  // Draw lookbook canvases
  qsa('.lb-canvas').forEach(canvas => {
    const scene = parseInt(canvas.dataset.scene || 0);
    const ctx = canvas.getContext('2d');
    function resize() {
      canvas.width  = canvas.offsetWidth  || window.innerWidth;
      canvas.height = canvas.offsetHeight || 500;
      drawLookbookScene(ctx, canvas.width, canvas.height, scene);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement || canvas);
  });

  function goTo(idx) {
    if (idx === current) return;
    // Flash
    if (flash) {
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 150);
    }

    slides[current].classList.remove('active');
    navBtns[current].classList.remove('active');
    current = idx;
    slides[current].classList.add('active');
    navBtns[current].classList.add('active');
  }

  navBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => { goTo(i); resetAuto(); });
  });

  function resetAuto() {
    clearInterval(autoId);
    autoId = setInterval(() => { goTo((current + 1) % slides.length); }, 5000);
  }
  resetAuto();
})();

function drawLookbookScene(ctx, w, h, scene) {
  // Background
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, w, h);

  const scenes = [
    { primaryColor: 'rgba(80,15,15,0.9)',  accentHue: 0   },
    { primaryColor: 'rgba(10,15,40,0.9)',  accentHue: 220 },
    { primaryColor: 'rgba(80,10,10,0.95)', accentHue: 0   },
    { primaryColor: 'rgba(15,10,30,0.9)',  accentHue: 260 },
  ];

  const s = scenes[scene] || scenes[0];

  // Large gradient atmosphere
  const atmos = ctx.createRadialGradient(w * 0.3, h * 0.5, 0, w * 0.3, h * 0.5, w * 0.7);
  atmos.addColorStop(0, s.primaryColor);
  atmos.addColorStop(1, 'transparent');
  ctx.fillStyle = atmos;
  ctx.fillRect(0, 0, w, h);

  // Vertical lines / texture
  ctx.strokeStyle = 'rgba(255,255,255,0.015)';
  ctx.lineWidth = 1;
  for (let i = 0; i < w; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + rand(-5, 5), h);
    ctx.stroke();
  }

  // Large figure silhouette
  const fx = w * 0.35, fy = h * 0.1;
  const fh = h * 0.85;
  const fw = fh * 0.35;

  ctx.save();
  ctx.translate(fx, fy);

  // Body
  const figGrad = ctx.createLinearGradient(0, 0, fw, fh);
  figGrad.addColorStop(0, '#161616');
  figGrad.addColorStop(0.4, '#111111');
  figGrad.addColorStop(1, '#080808');
  ctx.fillStyle = figGrad;

  // Draw stylized figure
  ctx.beginPath();
  ctx.moveTo(fw * 0.3, 0);
  ctx.bezierCurveTo(fw * 0.2, fh * 0.08, fw * 0.05, fh * 0.15, fw * 0.1, fh * 0.35);
  ctx.bezierCurveTo(fw * 0.05, fh * 0.45, fw * 0.08, fh * 0.55, fw * 0.15, fh * 0.7);
  ctx.lineTo(fw * 0.1, fh);
  ctx.lineTo(fw * 0.45, fh);
  ctx.lineTo(fw * 0.4, fh * 0.7);
  ctx.bezierCurveTo(fw * 0.45, fh * 0.55, fw * 0.5, fh * 0.45, fw * 0.45, fh * 0.35);
  ctx.bezierCurveTo(fw * 0.5, fh * 0.15, fw * 0.35, fh * 0.08, fw * 0.25, 0);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(fw * 0.27, -fw * 0.15, fw * 0.14, 0, Math.PI * 2);
  ctx.fillStyle = '#141414';
  ctx.fill();

  // Red/color accent along edge
  const edgeGrad = ctx.createLinearGradient(0, fh * 0.3, fw * 0.5, fh * 0.7);
  edgeGrad.addColorStop(0, `hsla(${s.accentHue}, 80%, 35%, 0.3)`);
  edgeGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = edgeGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(fw * 0.05, fh * 0.35);
  ctx.bezierCurveTo(fw * 0.02, fh * 0.45, fw * 0.05, fh * 0.55, fw * 0.12, fh * 0.7);
  ctx.stroke();

  ctx.restore();

  // Ground reflection
  const reflGrad = ctx.createLinearGradient(0, h * 0.85, 0, h);
  reflGrad.addColorStop(0, 'rgba(0,0,0,0.5)');
  reflGrad.addColorStop(1, '#050505');
  ctx.fillStyle = reflGrad;
  ctx.fillRect(0, h * 0.85, w, h * 0.15);

  // Scene-specific effects
  if (scene === 2) {
    // Red scene — red light beam
    const beam = ctx.createLinearGradient(w * 0.2, 0, w * 0.5, h);
    beam.addColorStop(0, 'rgba(192,57,43,0.08)');
    beam.addColorStop(1, 'transparent');
    ctx.fillStyle = beam;
    ctx.fillRect(0, 0, w, h);
  }

  if (scene === 0 || scene === 3) {
    // Smoke particles overlay
    for (let i = 0; i < 8; i++) {
      const sx = rand(0, w), sy = rand(h * 0.4, h);
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, rand(50, 150));
      sg.addColorStop(0, 'rgba(100,80,80,0.04)');
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(sx, sy, 150, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   10. BRAND STORY — SMOKE BACKGROUND
═══════════════════════════════════════════════════════════════ */
(function initSmokeBg() {
  const canvas = qs('#smoke-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || 600;
    particles = Array.from({ length: 12 }, () => createSmokeParticle(canvas));
  }

  function createSmokeParticle(c) {
    return {
      x: rand(0, c.width),
      y: rand(0, c.height),
      r: rand(60, 180),
      alpha: rand(0.02, 0.06),
      vx: rand(-0.2, 0.2),
      vy: rand(-0.3, -0.05),
      life: 0,
      maxLife: rand(200, 400),
    };
  }

  function draw() {
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p, i) => {
      const ratio = p.life / p.maxLife;
      const a = p.alpha * Math.sin(ratio * Math.PI);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(180,50,50,${a})`);
      g.addColorStop(0.5, `rgba(100,20,20,${a * 0.3})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.vx; p.y += p.vy;
      p.r += 0.3; p.life++;
      if (p.life >= p.maxLife) particles[i] = createSmokeParticle(canvas);
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
})();

/* ═══════════════════════════════════════════════════════════════
   11. SCROLL REVEAL
═══════════════════════════════════════════════════════════════ */
(function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  qsa('.reveal-up').forEach(el => observer.observe(el));
})();

/* ═══════════════════════════════════════════════════════════════
   12. NEWSLETTER
═══════════════════════════════════════════════════════════════ */
(function initNewsletter() {
  const form = qs('#newsletter-form');
  const success = qs('#newsletter-success');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = qs('#newsletter-email').value.trim();
    if (!email || !email.includes('@')) return;
    form.style.opacity = '0';
    form.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      form.style.display = 'none';
      success.classList.add('show');
    }, 400);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   13. SMOOTH SCROLL
═══════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = qs(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  qs('#shop-btn') && qs('#shop-btn').addEventListener('click', () => {
    qs('#products').scrollIntoView({ behavior: 'smooth' });
  });

  qs('#lookbook-btn') && qs('#lookbook-btn').addEventListener('click', () => {
    qs('#lookbook').scrollIntoView({ behavior: 'smooth' });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   14. SCROLL-BASED PARALLAX HERO
═══════════════════════════════════════════════════════════════ */
(function initScrollParallax() {
  const hero = qs('#hero');
  const heroContent = qs('#hero-content');
  if (!hero) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroH = hero.offsetHeight;
        if (scrollY <= heroH) {
          const ratio = scrollY / heroH;
          if (heroContent) {
            heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
            heroContent.style.opacity = 1 - ratio * 1.5;
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════
   15. CARD SPOTLIGHT MOUSE TRACKING
═══════════════════════════════════════════════════════════════ */
document.addEventListener('mousemove', e => {
  qsa('.collection-card').forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const spotlight = card.querySelector('.card-spotlight');
    if (spotlight) {
      spotlight.style.setProperty('--mx', x + 'px');
      spotlight.style.setProperty('--my', y + 'px');
    }
  });

  qsa('.review-card').forEach(card => {
    const rect = card.getBoundingClientRect();
    if (e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top  && e.clientY <= rect.bottom) {
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
      card.style.transform = `translateY(-8px) rotateX(${-y * 0.3}deg) rotateY(${x * 0.3}deg)`;
    } else {
      card.style.transform = '';
    }
  });
});

/* ═══════════════════════════════════════════════════════════════
   16. CHECKOUT BUTTON
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  qs('#checkout-btn') && qs('#checkout-btn').addEventListener('click', () => {
    const btn = qs('#checkout-btn');
    btn.querySelector('.btn-text').textContent = 'PROCESSING...';
    setTimeout(() => {
      btn.querySelector('.btn-text').textContent = 'ORDER PLACED ✓';
      btn.style.background = '#1a472a';
      cartItems = [];
      updateCart();
      setTimeout(closeCart, 1500);
    }, 1800);
  });
});

/* ═══════════════════════════════════════════════════════════════
   17. MOBILE TOUCH DRAG FOR CAROUSEL
═══════════════════════════════════════════════════════════════ */
(function initTouchDrag() {
  const track = qs('#carousel-track');
  const wrapper = qs('#carousel-track-wrapper');
  if (!track || !wrapper) return;

  let startX = 0, isDragging = false, startOffset = 0;
  let offset = 0;

  function getMaxOffset() {
    return -(track.scrollWidth - wrapper.offsetWidth);
  }

  wrapper.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startOffset = offset;
    isDragging = true;
    track.style.transition = 'none';
  }, { passive: true });

  wrapper.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX;
    offset = clamp(startOffset + dx, getMaxOffset(), 0);
    track.style.transform = `translateX(${offset}px)`;
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    isDragging = false;
    track.style.transition = '';
  });
})();

/* ═══════════════════════════════════════════════════════════════
   GTA SYSTEMS — WASTED, MISSION PASSED, WANTED, RADIO,
   MINIMAP, HEALTH, TOASTS, CINEMATIC, POLICE, GLITCH
═══════════════════════════════════════════════════════════════ */

/* ─── PAGE LOAD BAR ─────────────────────────────────────────── */
(function initPageLoadBar() {
  const bar = qs('#page-load-bar');
  if (!bar) return;
  let w = 0;
  bar.style.width = '0%';
  bar.style.display = 'block';
  const iv = setInterval(() => {
    w += rand(5, 15);
    if (w >= 90) { w = 90; clearInterval(iv); }
    bar.style.width = w + '%';
  }, 80);
  window.addEventListener('load', () => {
    clearInterval(iv);
    bar.style.width = '100%';
    setTimeout(() => { bar.style.opacity = '0'; }, 400);
    setTimeout(() => { bar.style.display = 'none'; }, 800);
  });
})();

/* ─── GTA TOAST SYSTEM ──────────────────────────────────────── */
function showGTAToast(options) {
  const { title, sub, iconClass = 'green', icon = '★', type = '' } = options;
  const container = qs('#gta-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `gta-toast ${type}`;
  toast.innerHTML = `
    <div class="gta-toast-icon ${iconClass}">${icon}</div>
    <div class="gta-toast-body">
      <div class="gta-toast-title">${title}</div>
      ${sub ? `<div class="gta-toast-sub">${sub}</div>` : ''}
    </div>
    <div class="gta-toast-timer"></div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ─── WANTED LEVEL SYSTEM ───────────────────────────────────── */
let wantedLevel = 0;
const MAX_WANTED = 5;
let wantedDecayTimer = null;

function setWantedLevel(level) {
  wantedLevel = clamp(level, 0, MAX_WANTED);
  const hud = qs('#wanted-hud');
  if (!hud) return;

  hud.classList.toggle('show', wantedLevel > 0);

  qsa('.wanted-star').forEach((star, i) => {
    star.classList.toggle('active', i < wantedLevel);
  });

  // Show police alert at 4+ stars
  const policeAlert = qs('#police-alert');
  if (policeAlert) {
    policeAlert.classList.toggle('show', wantedLevel >= 4);
  }

  // Decay
  clearTimeout(wantedDecayTimer);
  if (wantedLevel > 0) {
    wantedDecayTimer = setTimeout(() => {
      decreaseWanted();
    }, 4000);
  }
}

function increaseWanted(amount = 1) {
  setWantedLevel(wantedLevel + amount);
  if (wantedLevel >= 3) {
    showGTAToast({
      icon: '⚠',
      iconClass: 'yellow',
      title: 'ATTENTION LEVEL RAISED',
      sub: `${wantedLevel} STAR${wantedLevel > 1 ? 'S' : ''} — AUTHORITIES NOTIFIED`,
      type: 'yellow'
    });
  }
}

function decreaseWanted() {
  if (wantedLevel <= 0) return;
  setWantedLevel(wantedLevel - 1);
  if (wantedLevel === 0) {
    showGTAToast({
      icon: '✓',
      iconClass: 'green',
      title: 'EVADED AUTHORITIES',
      sub: 'WANTED LEVEL CLEARED',
      type: ''
    });
  } else {
    wantedDecayTimer = setTimeout(decreaseWanted, 3000);
  }
}

// Earn wanted stars for browsing (easter egg)
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    showGTAToast({
      icon: '◉',
      iconClass: 'green',
      title: 'INZZOUT LOADED',
      sub: 'LOS INZZOUT — FASHION DISTRICT',
    });
    qs('#wanted-hud') && qs('#wanted-hud').classList.add('show');
    qs('#radio-hud') && qs('#radio-hud').classList.add('show');
    qs('#minimap-hud') && qs('#minimap-hud').classList.add('show');
    qs('#health-hud') && qs('#health-hud').classList.add('show');
    initMinimapCanvas();
  }, 1800);

  // Earn stars for rapid scrolling (easter egg)
  let scrollCount = 0;
  let lastScrollTime = 0;
  window.addEventListener('scroll', () => {
    const now = Date.now();
    if (now - lastScrollTime < 200) scrollCount++;
    else scrollCount = 0;
    lastScrollTime = now;
    if (scrollCount === 8) { increaseWanted(1); scrollCount = 0; }
  }, { passive: true });

  // Rapid clicking earns stars
  let clickCount = 0;
  let clickTimer;
  document.addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 1000);
    if (clickCount >= 6) { increaseWanted(1); clickCount = 0; }
  });
});

/* ─── WASTED SCREEN ─────────────────────────────────────────── */
function showWasted(callback) {
  const screen = qs('#wasted-screen');
  if (!screen) return;

  // Desaturate whole page
  document.body.style.filter = 'saturate(0) brightness(0.7)';
  document.body.style.transition = 'filter 0.5s';

  screen.classList.add('show');

  setTimeout(() => {
    screen.classList.remove('show');
    document.body.style.filter = '';
    if (callback) callback();
  }, 2800);
}

/* ─── MISSION PASSED ────────────────────────────────────────── */
function showMissionPassed(subtitle, cb) {
  const screen = qs('#mission-passed');
  if (!screen) return;
  const subEl = screen.querySelector('.mp-sub');
  if (subEl && subtitle) subEl.textContent = subtitle;

  screen.classList.add('show');

  setTimeout(() => {
    screen.style.opacity = '0';
    setTimeout(() => {
      screen.classList.remove('show');
      screen.style.opacity = '';
    }, 400);
    if (cb) cb();
  }, 2500);
}

/* ─── CINEMATIC BARS ─────────────────────────────────────────── */
function enterCinematicMode() {
  document.body.classList.add('cinematic-active');
}

function exitCinematicMode() {
  document.body.classList.remove('cinematic-active');
}

/* ─── RADIO HUD SYSTEM ──────────────────────────────────────── */
(function initRadio() {
  const stations = [
    { name: 'INZZ FM',        tracks: ['PHANTOM — The Streets', 'NOIR NIGHTS — Phantom', 'BLOOD LINES — After Hours'] },
    { name: 'WEST COAST FM',  tracks: ['LOWRIDER SZN — Droptop', 'SUNSET BLVD — Night Cruise'] },
    { name: 'K-DST',          tracks: ['MOVEMENT — Los Inzzout', 'STREETS ALIVE — Midnight'] },
    { name: 'GROOVE STREET',  tracks: ['HUSTLE MODE — Dark Hours', 'PHANTOM CITY — Rooftop'] },
  ];

  let stationIdx = 0;
  let trackIdx   = 0;

  const stationEl = qs('#radio-station-name');
  const trackEl   = qs('#radio-track-name');

  function updateRadio() {
    if (!stationEl || !trackEl) return;
    const st = stations[stationIdx];
    trackIdx = Math.floor(rand(0, st.tracks.length));
    stationEl.textContent = st.name;
    trackEl.textContent = st.tracks[trackIdx];
  }

  // Change track every 15s
  setInterval(() => {
    stationIdx = (stationIdx + 1) % stations.length;
    updateRadio();
    showGTAToast({
      icon: '♪',
      iconClass: 'red',
      title: stations[stationIdx].name,
      sub: stations[stationIdx].tracks[0],
      type: 'red'
    });
  }, 15000);

  // Click radio to change
  const radioHud = qs('#radio-hud');
  if (radioHud) {
    radioHud.style.pointerEvents = 'all';
    radioHud.style.cursor = 'pointer';
    radioHud.addEventListener('click', () => {
      stationIdx = (stationIdx + 1) % stations.length;
      updateRadio();
    });
  }
})();

/* ─── MINIMAP CANVAS ─────────────────────────────────────────── */
function initMinimapCanvas() {
  const canvas = qs('#minimap-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 140, H = 140;
  canvas.width = W; canvas.height = H;

  // Draw stylized city grid
  function drawMinimap() {
    ctx.fillStyle = '#0f1015';
    ctx.fillRect(0, 0, W, H);

    // City blocks
    const blocks = [
      { x:0, y:0, w:55, h:40, c:'#1a1a20' },
      { x:60, y:0, w:80, h:30, c:'#161618' },
      { x:0, y:45, w:40, h:55, c:'#1c1c22' },
      { x:45, y:35, w:50, h:45, c:'#181820' },
      { x:100, y:35, w:40, h:40, c:'#1a1a1e' },
      { x:0, y:105, w:W, h:35, c:'#12121a' },
      { x:50, y:82, w:45, h:20, c:'#1e1e26' },
    ];

    blocks.forEach(b => {
      ctx.fillStyle = b.c;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    // Roads
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 3;

    // Horizontal roads
    [42, 82, 108].forEach(y => {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    });

    // Vertical roads
    [55, 100].forEach(x => {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    });

    // Road markings (dashed center)
    ctx.strokeStyle = 'rgba(255,200,0,0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    [42, 82].forEach(y => {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    });
    ctx.setLineDash([]);

    // Red accent buildings
    ctx.fillStyle = 'rgba(192,57,43,0.3)';
    ctx.fillRect(62, 37, 18, 12);
    ctx.fillRect(102, 37, 12, 8);

    // Blips
    // Shop blip
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath(); ctx.arc(68, 43, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(231,76,60,0.3)';
    ctx.beginPath(); ctx.arc(68, 43, 7, 0, Math.PI*2); ctx.fill();

    // Minimap dark vignette
    const vig = ctx.createRadialGradient(W/2, H/2, W*0.3, W/2, H/2, W*0.8);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  drawMinimap();

  // Animate player dot arrow direction on scroll
  let playerAngle = 0;
  window.addEventListener('scroll', () => {
    playerAngle = (playerAngle + 2) % 360;
  }, { passive: true });
}

/* ─── COORDINATE ANIMATION IN HERO ──────────────────────────── */
(function initHeroCoords() {
  const coordEl = qs('#hero-coord');
  if (!coordEl) return;

  let lat = 34.0522, lng = 118.2437;
  setInterval(() => {
    lat  += (Math.random() - 0.5) * 0.0002;
    lng  += (Math.random() - 0.5) * 0.0002;
    coordEl.textContent = `N ${lat.toFixed(4)}° W ${lng.toFixed(4)}°`;
  }, 800);
})();

/* ─── GLITCH HEADLINE UPDATES ───────────────────────────────── */
(function initGlitchHeadline() {
  const hl1 = qs('#hl1');
  if (!hl1) return;

  // Update data-text attr for glitch effect after text is set
  const observer = new MutationObserver(() => {
    if (hl1.textContent) {
      hl1.setAttribute('data-text', hl1.textContent);
    }
  });
  observer.observe(hl1, { childList: true, characterData: true, subtree: true });
})();

/* ─── CINEMATIC COLLECTION CLICK ─────────────────────────────── */
qsa('.collection-card').forEach(card => {
  card.addEventListener('click', () => {
    enterCinematicMode();
    increaseWanted(1);
    showGTAToast({
      icon: '▶',
      iconClass: 'red',
      title: 'COLLECTION LOADING',
      sub: 'ENTERING FASHION DISTRICT',
      type: 'red'
    });
    setTimeout(exitCinematicMode, 2000);
  });
});

/* ─── OVERRIDE ADD-TO-CART WITH GTA EFFECTS ──────────────────── */
const originalAddToCart = addToCart;
window.addToCartGTA = function(name, price, color, size) {
  // Call original
  originalAddToCart(name, price, color, size);

  // Show MISSION PASSED
  setTimeout(() => {
    showMissionPassed(
      `${name || 'PHANTOM HOODIE'} — ADDED TO WARDROBE`,
      () => {}
    );
  }, 200);

  // GTA Toast
  showGTAToast({
    icon: '✓',
    iconClass: 'green',
    title: 'ITEM ACQUIRED',
    sub: `${name || 'PHANTOM HOODIE'} — $${price || '380'}`,
    type: ''
  });

  // Increase wanted (you're shopping illegally stylish)
  increaseWanted(1);
};

// Override add-to-cart button
document.addEventListener('DOMContentLoaded', () => {
  const atcBtn = qs('#add-to-cart');
  if (atcBtn) {
    // Remove old listener by cloning
    const newBtn = atcBtn.cloneNode(true);
    atcBtn.parentNode.replaceChild(newBtn, atcBtn);
    newBtn.addEventListener('click', () => {
      window.addToCartGTA();
    });
  }
});

/* ─── INTERACTIVE GLITCH ON HOVER ────────────────────────────── */
qsa('.section-title').forEach(title => {
  title.addEventListener('mouseenter', () => {
    title.style.animation = 'none';
    title.dataset.glitchActive = '1';
    let frames = 0;
    const glitchInterval = setInterval(() => {
      if (frames++ > 6 || !title.dataset.glitchActive) {
        clearInterval(glitchInterval);
        title.style.transform = '';
        title.style.color = '';
        return;
      }
      title.style.transform = `translate(${rand(-3,3)}px, ${rand(-1,1)}px)`;
      if (frames % 2 === 0) title.style.color = '#e74c3c';
      else title.style.color = '';
    }, 40);
  });
  title.addEventListener('mouseleave', () => {
    delete title.dataset.glitchActive;
    title.style.transform = '';
    title.style.color = '';
  });
});

/* ─── CINEMATIC SCROLL ZONES ─────────────────────────────────── */
(function initCinematicScrollZones() {
  const lookbook = qs('#lookbook');
  const story = qs('#story');
  if (!lookbook || !story) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        enterCinematicMode();
        if (entry.target === story) {
          showGTAToast({
            icon: '◈',
            iconClass: 'red',
            title: 'STORY MODE',
            sub: 'THE STREETS NEVER FORGET',
            type: 'red'
          });
        }
      } else {
        // Only exit if neither is visible
        exitCinematicMode();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(lookbook);
  observer.observe(story);
})();

/* ─── STAT: HEALTH BAR ANIMATION ON SCROLL ───────────────────── */
(function initHealthAnimations() {
  const healthBar = qs('#health-bar');
  const armorBar  = qs('#armor-bar');

  window.addEventListener('scroll', () => {
    const ratio = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    if (healthBar) healthBar.style.width = Math.max(20, 85 - ratio * 50) + '%';
    if (armorBar)  armorBar.style.width  = Math.max(10, 60 - ratio * 40) + '%';
  }, { passive: true });
})();

/* ─── SECTION ENTRY TOASTS ───────────────────────────────────── */
(function initSectionToasts() {
  const sections = [
    { id: 'collections', icon: '🗂', title: 'COLLECTIONS UNLOCKED', sub: 'Browse the latest drops' },
    { id: 'products',    icon: '🛍', title: 'SHOP ENTERED',         sub: 'Fashion district — sector 7' },
    { id: 'story',       icon: '◈',  title: 'STORY MODE',           sub: 'The origin of INZZOUT', type: 'red' },
    { id: 'reviews',     icon: '★',  title: 'REP POINTS',           sub: 'See what the streets say', type: 'yellow' },
  ];

  const seen = new Set();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !seen.has(entry.target.id)) {
        seen.add(entry.target.id);
        const s = sections.find(sec => sec.id === entry.target.id);
        if (s) {
          setTimeout(() => {
            showGTAToast({
              icon: s.icon,
              iconClass: s.type === 'red' ? 'red' : s.type === 'yellow' ? 'yellow' : 'green',
              title: s.title,
              sub: s.sub,
              type: s.type || ''
            });
          }, 300);
        }
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(s => {
    const el = qs(`#${s.id}`);
    if (el) observer.observe(el);
  });
})();

/* ─── EASTER EGG: KONAMI CODE → WASTED ──────────────────────── */
(function initKonami() {
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;
  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[idx]) {
      idx++;
      if (idx === KONAMI.length) {
        idx = 0;
        setWantedLevel(5);
        setTimeout(() => showWasted(() => {
          setWantedLevel(0);
          showGTAToast({ icon: '💀', iconClass: 'red', title: 'WASTED', sub: 'You tried...', type: 'red' });
        }), 200);
      }
    } else {
      idx = 0;
    }
  });
})();

/* ─── GTA-STYLE NUMBER TICKER ────────────────────────────────── */
function animateNumber(el, from, to, duration = 1000, prefix = '', suffix = '') {
  const start = performance.now();
  function frame(now) {
    const progress = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.floor(from + (to - from) * eased) + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* Animate product badge count */
(function initProductCounter() {
  const badge = qs('.product-badge');
  if (!badge) return;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      let count = 47;
      const iv = setInterval(() => {
        count = Math.max(1, count - Math.floor(rand(1, 3)));
        badge.textContent = `LIMITED DROP — ${count} LEFT`;
        if (count <= 5) {
          badge.style.color = '#e74c3c';
          badge.style.textShadow = '0 0 10px rgba(231,76,60,0.5)';
        }
      }, 8000);
      obs.disconnect();
    }
  }, { threshold: 0.5 });
  if (badge.parentElement) obs.observe(badge.parentElement);
})();

/* ─── GTA AMBIENT FLICKER ────────────────────────────────────── */
(function initAmbientFlicker() {
  // Randomly flicker the body::before scanlines opacity
  setInterval(() => {
    const intensity = rand(0.02, 0.05);
    document.documentElement.style.setProperty('--scanline-opacity', intensity.toString());
  }, 3000);
})();

/* ═══════════════════════════════════════════════════════════════
   COLLECTION CARD CTAs — RED ADD TO CART with MISSION PASSED
═══════════════════════════════════════════════════════════════ */
(function initCollectionCardCTAs() {
  const collectionData = [
    { cardId: 'col-1', name: 'PHANTOM SERIES',    price: '$380', type: 'vest',   color: '#0a0a0a' },
    { cardId: 'col-2', name: 'NOIR DIVISION',     price: '$290', type: 'cargo',  color: '#1a1a2e' },
    { cardId: 'col-3', name: 'BLOOD LINES',       price: '$580', type: 'jacket', color: '#1a0808' },
  ];

  // Re-draw collection card canvases with proper product art
  qsa('.card-canvas').forEach(canvas => {
    const card = canvas.closest('.collection-card');
    if (!card) return;
    const data = collectionData.find(d => d.cardId === card.id);
    if (!data) return;

    function renderCardCanvas() {
      canvas.width  = canvas.offsetWidth  || 400;
      canvas.height = canvas.offsetHeight || 500;
      drawProductImage(canvas.getContext('2d'), canvas.width, canvas.height, data.type, data.color);
    }
    renderCardCanvas();

    const ro = new ResizeObserver(renderCardCanvas);
    ro.observe(canvas.parentElement || canvas);
  });

  // Wire up CTA buttons on collection cards
  collectionData.forEach(data => {
    const card = qs(`#${data.cardId}`);
    if (!card) return;
    const cta = card.querySelector('.card-cta');
    if (!cta) return;

    cta.addEventListener('click', e => {
      e.stopPropagation();

      // Check if sold out
      const badge = card.querySelector('.card-badge');
      if (badge && badge.classList.contains('sold')) {
        // Waitlist toast
        if (typeof showGTAToast === 'function') {
          showGTAToast({ icon: '⏳', iconClass: 'yellow', title: 'ADDED TO WAITLIST', sub: `${data.name} — Notify me on drop`, type: 'yellow' });
        }
        cta.textContent = 'ON WAITLIST ✓';
        cta.style.opacity = '0.6';
        return;
      }

      // Button loading state
      const origText = cta.querySelector('.btn-text') ? cta.querySelector('.btn-text').textContent : cta.textContent;
      cta.innerHTML = '<span class="btn-text">✓ ADDED</span><span class="btn-arrow">→</span><span class="btn-glow"></span>';
      cta.style.background = '#1a472a';
      cta.style.borderColor = '#1a472a';

      // Mission Passed
      if (typeof showMissionPassed === 'function') {
        setTimeout(() => showMissionPassed(`${data.name} — ADDED TO WARDROBE`), 100);
      }

      // GTA Toast
      if (typeof showGTAToast === 'function') {
        showGTAToast({ icon: '✓', iconClass: 'green', title: 'ITEM ACQUIRED', sub: `${data.name} — ${data.price}` });
      }

      if (typeof increaseWanted === 'function') increaseWanted(1);

      addToCart(data.name, data.price, data.color, 'M');

      setTimeout(() => {
        cta.innerHTML = `<span class="btn-text">${origText}</span><span class="btn-arrow">→</span><span class="btn-glow"></span>`;
        cta.style.background = '';
        cta.style.borderColor = '';
      }, 2800);
    });
  });
})();

console.log('%cINZZOUT', 'font-size:3rem;font-family:"Bebas Neue",sans-serif;color:#c0392b;font-weight:900;letter-spacing:0.3em;');
console.log('%cNot just a brand. A movement.', 'font-size:0.9rem;color:#888;font-style:italic;');
console.log('%c[ GTA MODE ACTIVATED ]', 'font-size:0.8rem;color:#5eba2f;font-family:monospace;');


