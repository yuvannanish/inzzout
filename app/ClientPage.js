'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';

/* ─── helpers ────────────────────────────────────────────────── */
const rand = (min, max) => Math.random() * (max - min) + min;
const lerp = (a, b, t) => a + (b - a) * t;

/* ════════════════════════════════════════════════════════════════
   CLIENT PAGE — all existing HTML/JS logic ported to React
════════════════════════════════════════════════════════════════ */
export default function ClientPage({ products }) {
  const { cart, addToCart, removeFromCart, updateQty, clearCart, total, count } = useCart();

  /* ─── state ──────────────────────────────────────────────────── */
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#0a0a0a');
  const [selectedSize, setSelectedSize] = useState('S');
  const [lookbookIndex, setLookbookIndex] = useState(0);
  const [carouselOffset, setCarouselOffset] = useState(0);
  const [wantedStars, setWantedStars] = useState(0);
  const [missionPassed, setMissionPassed] = useState(false);
  const [lastAddedPrice, setLastAddedPrice] = useState(0);
  const [wasted, setWasted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '' });
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [navScrolled, setNavScrolled] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, live: false });

  /* ─── drop countdown ──────────────────────────────────────────── */
  useEffect(() => {
    const TARGET = new Date('2026-09-27T00:00:00+05:30').getTime();
    const tick = () => {
      const now = Date.now();
      const diff = TARGET - now;
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, live: true });
        return;
      }
      const days    = Math.floor(diff / 86400000);
      const hours   = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000)  / 60000);
      const seconds = Math.floor((diff % 60000)    / 1000);
      setCountdown({ days, hours, minutes, seconds, live: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* ─── refs ───────────────────────────────────────────────────── */
  const cursorRef = useRef(null);
  const cursorTrailRef = useRef(null);
  const heroCanvasRef = useRef(null);
  const rainCanvasRef = useRef(null);
  const smokeCanvasRef = useRef(null);
  const skylineCanvasRef = useRef(null);
  const minimapCanvasRef = useRef(null);
  const productCanvasRef = useRef(null);
  const grainCanvasRef = useRef(null);
  const smokeBgRef = useRef(null);
  const lookbookCanvasRefs = useRef([]);
  const carouselTrackRef = useRef(null);
  const heroHeadlineRef = useRef(null);
  const heroReflectionRef = useRef(null);
  const productRotation = useRef(0);
  const rafRef = useRef(null);

  /* ─── toast helper ───────────────────────────────────────────── */
  const showToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  /* ─── preloader ──────────────────────────────────────────────── */
  useEffect(() => {
    let progress = 0;
    const iv = setInterval(() => {
      progress += rand(3, 8);
      if (progress >= 100) { progress = 100; clearInterval(iv); }
      setPreloadProgress(Math.floor(progress));
      if (progress === 100) {
        setTimeout(() => setPreloaderDone(true), 400);
      }
    }, 40);
    return () => clearInterval(iv);
  }, []);

  /* ─── film grain ─────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = grainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let id;
    const resize = () => { canvas.width = canvas.offsetWidth || window.innerWidth; canvas.height = canvas.offsetHeight || window.innerHeight; };
    resize();
    const draw = () => {
      const { width, height } = canvas;
      const img = ctx.createImageData(width, height);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(id);
  }, []);

  /* ─── custom cursor ──────────────────────────────────────────── */
  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = cursorTrailRef.current;
    if (!cursor || !trail) return;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.style.left = tx + 'px';
      cursor.style.top = ty + 'px';
    };
    const animate = () => {
      cx = lerp(cx, tx, 0.12); cy = lerp(cy, ty, 0.12);
      trail.style.left = cx + 'px'; trail.style.top = cy + 'px';
      requestAnimationFrame(animate);
    };
    document.addEventListener('mousemove', onMove);
    animate();

    const onEnter = () => cursor.classList.add('hovering');
    const onLeave = () => cursor.classList.remove('hovering');
    const hoverEls = document.querySelectorAll('a, button, .swatch, .size-btn, .card-cta');
    hoverEls.forEach((el) => { el.addEventListener('mouseenter', onEnter); el.addEventListener('mouseleave', onLeave); });

    return () => {
      document.removeEventListener('mousemove', onMove);
      hoverEls.forEach((el) => { el.removeEventListener('mouseenter', onEnter); el.removeEventListener('mouseleave', onLeave); });
    };
  }, [preloaderDone]);

  /* ─── navbar scroll ──────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ─── hero headline typewriter ───────────────────────────────── */
  useEffect(() => {
    if (!preloaderDone) return;
    const lines = ['REBEL WITH', 'PURPOSE'];
    const els = document.querySelectorAll('.headline-line');
    let delay = 200;
    lines.forEach((text, i) => {
      setTimeout(() => {
        if (els[i]) {
          els[i].style.opacity = '1';
          els[i].style.transform = 'translateY(0)';
          if (i === 0) els[i].setAttribute('data-text', text);
          typeText(els[i], text);
        }
      }, delay);
      delay += 600;
    });
  }, [preloaderDone]);

  function typeText(el, text) {
    el.textContent = '';
    let i = 0;
    const iv = setInterval(() => {
      el.textContent += text[i];
      if (i === 0 && el.getAttribute('data-text') !== undefined) el.setAttribute('data-text', el.textContent);
      i++;
      if (i >= text.length) clearInterval(iv);
    }, 60);
  }

  /* ─── rain canvas ────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = rainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let id;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const drops = Array.from({ length: 120 }, () => ({ x: rand(0, canvas.width), y: rand(-canvas.height, 0), len: rand(15, 35), speed: rand(12, 22), op: rand(0.1, 0.3) }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1, d.y + d.len);
        ctx.strokeStyle = `rgba(192,57,43,${d.op})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        d.y += d.speed;
        if (d.y > canvas.height) { d.y = -d.len; d.x = rand(0, canvas.width); }
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, []);

  /* ─── smoke canvas ───────────────────────────────────────────── */
  useEffect(() => {
    const canvas = smokeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let id;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles = Array.from({ length: 30 }, () => ({
      x: rand(0, canvas.width), y: rand(canvas.height * 0.5, canvas.height),
      vx: rand(-0.3, 0.3), vy: rand(-0.8, -0.2),
      size: rand(60, 150), op: rand(0.02, 0.08), life: 1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        g.addColorStop(0, `rgba(50,50,50,${p.op})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx; p.y += p.vy; p.size += 0.3; p.op *= 0.995;
        if (p.op < 0.005) {
          p.x = rand(0, canvas.width); p.y = rand(canvas.height * 0.6, canvas.height);
          p.vx = rand(-0.3, 0.3); p.vy = rand(-0.8, -0.2);
          p.size = rand(60, 150); p.op = rand(0.02, 0.08);
        }
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, []);

  /* ─── skyline canvas (animated GTA city) ───────────────────── */
  useEffect(() => {
    const canvas = skylineCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let t = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    // ── buildings (two layers for parallax depth) ──────────────
    const makeBuildingRow = (count, minH, maxH, minW, maxW) => {
      const arr = [];
      let x = -200;
      for (let i = 0; i < count; i++) {
        const bw = rand(minW, maxW);
        const bh = rand(minH, maxH);
        // pre-generate windows
        const wins = [];
        for (let wx = 6; wx < bw - 6; wx += 11) {
          for (let wy = 12; wy < bh - 6; wy += 15) {
            if (Math.random() > 0.45) {
              wins.push({ dx: wx, dy: wy, lit: Math.random() > 0.4,
                red: Math.random() > 0.82, flicker: Math.random() > 0.88,
                flickerSpeed: rand(0.04, 0.12) });
            }
          }
        }
        arr.push({ x, w: bw, h: bh, wins, shade: rand(4, 11) });
        x += bw + rand(0, 10);
      }
      return arr;
    };

    const bgBuildings  = makeBuildingRow(40, 0.18, 0.55, 35, 80);
    const fgBuildings  = makeBuildingRow(28, 0.28, 0.70, 50, 110);

    // ── neon signs ─────────────────────────────────────────────
    const neonSigns = [
      { text: 'INZZOUT', x: 0.12, y: 0.38, size: 22, pulse: 0,   speed: 0.03 },
      { text: 'DROP NOW', x: 0.35, y: 0.44, size: 16, pulse: 1.1, speed: 0.05 },
      { text: 'STREETWEAR', x: 0.62, y: 0.40, size: 14, pulse: 2.4, speed: 0.04 },
      { text: '// SEP 2026 //', x: 0.80, y: 0.48, size: 13, pulse: 0.7, speed: 0.06 },
      { text: 'REBEL', x: 0.50, y: 0.35, size: 28, pulse: 1.8, speed: 0.025 },
    ];

    // ── cars on road ────────────────────────────────────────────
    const cars = Array.from({ length: 7 }, (_, i) => ({
      x: rand(0, 1),
      speed: rand(0.0015, 0.004),
      lane: i % 2,          // 0 = left, 1 = right
      headlight: Math.random() > 0.3,
    }));

    // ── floating tags / particles ────────────────────────────────
    const tags = Array.from({ length: 18 }, () => ({
      x: rand(0, 1), y: rand(0, 0.8),
      vy: rand(-0.00015, -0.00008),
      vx: rand(-0.00006, 0.00006),
      size: rand(3, 7), op: rand(0.08, 0.28),
      char: ['✦','★','◆','▲','//','×','#'][Math.floor(rand(0,7))],
    }));

    const draw = () => {
      t += 0.016;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#030303');
      sky.addColorStop(0.5, '#0d0204');
      sky.addColorStop(1, '#1a0304');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // red horizon glow
      const hGlow = ctx.createRadialGradient(w * 0.5, h * 0.72, 0, w * 0.5, h * 0.72, w * 0.65);
      hGlow.addColorStop(0, 'rgba(192,57,43,0.22)');
      hGlow.addColorStop(0.6, 'rgba(120,20,10,0.08)');
      hGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hGlow;
      ctx.fillRect(0, 0, w, h);

      // ── bg buildings (far, slow parallax)
      ctx.save();
      const scrollBg = (t * 8) % (w + 200);
      bgBuildings.forEach((b) => {
        const bx = ((b.x - scrollBg * 0.4) % (w + 200) + w + 200) % (w + 200) - 200;
        const bh = b.h * h;
        ctx.fillStyle = `hsl(0,0%,${b.shade}%)`;
        ctx.fillRect(bx, h - bh, b.w, bh);
        b.wins.forEach((win) => {
          if (!win.lit) return;
          let alpha = win.red ? rand(0.3, 0.7) : rand(0.12, 0.35);
          if (win.flicker) alpha *= (Math.sin(t * win.flickerSpeed * 60) > 0 ? 1 : 0.15);
          ctx.fillStyle = win.red ? `rgba(192,57,43,${alpha})` : `rgba(255,210,100,${alpha})`;
          ctx.fillRect(bx + win.dx, h - bh + win.dy, 5, 7);
        });
      });
      ctx.restore();

      // ── road
      const roadY = h * 0.76;
      const roadH = h * 0.24;
      const road = ctx.createLinearGradient(0, roadY, 0, h);
      road.addColorStop(0, '#0c0c0c');
      road.addColorStop(1, '#050505');
      ctx.fillStyle = road;
      ctx.fillRect(0, roadY, w, roadH);
      // dashes
      ctx.strokeStyle = 'rgba(180,30,20,0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([40, 60]);
      ctx.lineDashOffset = -(t * 200) % 100;
      ctx.beginPath();
      ctx.moveTo(0, roadY + roadH * 0.45);
      ctx.lineTo(w, roadY + roadH * 0.45);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── fg buildings (close, fast parallax)
      const scrollFg = (t * 20) % (w + 300);
      fgBuildings.forEach((b) => {
        const bx = ((b.x - scrollFg) % (w + 300) + w + 300) % (w + 300) - 300;
        const bh = b.h * h;
        ctx.fillStyle = `hsl(0,0%,${b.shade - 2}%)`;
        ctx.fillRect(bx, h - bh, b.w, bh);
        b.wins.forEach((win) => {
          if (!win.lit) return;
          let alpha = win.red ? rand(0.35, 0.8) : rand(0.15, 0.4);
          if (win.flicker) alpha *= (Math.sin(t * win.flickerSpeed * 60 + 1) > 0.3 ? 1 : 0.1);
          ctx.fillStyle = win.red ? `rgba(220,50,30,${alpha})` : `rgba(255,215,110,${alpha})`;
          ctx.fillRect(bx + win.dx, h - bh + win.dy, 5, 7);
        });
      });

      // ── cars
      cars.forEach((car) => {
        car.x += car.speed;
        if (car.x > 1.1) car.x = -0.1;
        const cx = car.x * w;
        const cy = car.lane === 0 ? h * 0.84 : h * 0.91;
        const carW = 60, carH = 20;
        // body
        ctx.fillStyle = car.lane === 0 ? '#1a0a0a' : '#0a0a12';
        ctx.beginPath();
        ctx.roundRect(cx - carW * 0.5, cy - carH, carW, carH, 4);
        ctx.fill();
        // headlights / taillights
        if (car.headlight) {
          const hg = ctx.createRadialGradient(cx + carW * 0.5, cy - carH * 0.5, 0,
                                               cx + carW * 0.5, cy - carH * 0.5, 80);
          hg.addColorStop(0, 'rgba(255,240,200,0.18)');
          hg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = hg;
          ctx.fillRect(cx, cy - 60, 120, 60);
          ctx.fillStyle = 'rgba(255,240,180,0.9)';
          ctx.fillRect(cx + carW * 0.45, cy - carH * 0.6, 5, 5);
        } else {
          // taillights (red)
          ctx.fillStyle = `rgba(220,40,20,${0.6 + Math.sin(t * 3) * 0.2})`;
          ctx.fillRect(cx - carW * 0.48, cy - carH * 0.6, 5, 5);
        }
      });

      // ── neon signs
      neonSigns.forEach((sign) => {
        const pulse = 0.55 + 0.45 * Math.sin(t * sign.speed * 60 + sign.pulse);
        const flicker = Math.sin(t * sign.speed * 120 + sign.pulse * 3) > -0.1 ? 1 : 0.05;
        const alpha = pulse * flicker;
        const sx = sign.x * w, sy = sign.y * h;
        ctx.save();
        ctx.font = `bold ${sign.size}px 'Bebas Neue', sans-serif`;
        ctx.textAlign = 'center';
        // glow
        ctx.shadowBlur = 18 * alpha;
        ctx.shadowColor = `rgba(220,50,30,${alpha})`;
        ctx.fillStyle = `rgba(220,50,30,${alpha * 0.85})`;
        ctx.fillText(sign.text, sx, sy);
        // bright core
        ctx.shadowBlur = 6;
        ctx.fillStyle = `rgba(255,120,100,${alpha * 0.5})`;
        ctx.fillText(sign.text, sx, sy);
        ctx.restore();
      });

      // ── floating tags
      tags.forEach((tag) => {
        tag.x += tag.vx; tag.y += tag.vy;
        if (tag.y < -0.05) { tag.y = 1.05; tag.x = rand(0, 1); }
        if (tag.x < 0 || tag.x > 1) tag.vx *= -1;
        ctx.fillStyle = `rgba(192,57,43,${tag.op})`;
        ctx.font = `${tag.size * (h / 800)}px 'Bebas Neue', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(tag.char, tag.x * w, tag.y * h);
      });

      // ── scanlines overlay
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2);

      // ── vignette
      const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.1, w * 0.5, h * 0.5, h * 0.85);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.72)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  /* ─── smoke-bg canvas (story section) ───────────────────────── */
  useEffect(() => {
    const canvas = smokeBgRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let id;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const particles = Array.from({ length: 20 }, () => ({
      x: rand(0, canvas.width), y: rand(canvas.height * 0.5, canvas.height),
      vx: rand(-0.2, 0.2), vy: rand(-0.5, -0.1),
      size: rand(80, 200), op: rand(0.01, 0.04),
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        g.addColorStop(0, `rgba(192,57,43,${p.op * 0.5})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx; p.y += p.vy; p.size += 0.2; p.op *= 0.998;
        if (p.op < 0.002) {
          p.x = rand(0, canvas.width); p.y = canvas.height;
          p.size = rand(80, 200); p.op = rand(0.01, 0.04);
        }
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(id);
  }, []);

  /* ─── minimap canvas ─────────────────────────────────────────── */
  useEffect(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 140, 140);
    const roads = [
      [0, 70, 140, 70], [70, 0, 70, 140],
      [0, 40, 140, 40], [0, 100, 140, 100],
      [40, 0, 40, 140], [100, 0, 100, 140],
    ];
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 8;
    roads.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    });
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2;
    roads.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    });
  }, []);

  /* ─── product 3d canvas ──────────────────────────────────────── */
  useEffect(() => {
    const canvas = productCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 400; canvas.height = 400;
    let id;
    const draw = () => {
      ctx.clearRect(0, 0, 400, 400);
      productRotation.current += 0.005;
      const r = productRotation.current;
      const cx = 200, cy = 200;
      // Draw stylized hoodie shape
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin(r) * 0.08);
      // body
      ctx.beginPath();
      ctx.fillStyle = selectedColor;
      ctx.roundRect(-70, -60, 140, 130, 8);
      ctx.fill();
      // hood
      ctx.beginPath();
      ctx.fillStyle = selectedColor;
      ctx.arc(0, -70, 55, Math.PI, 0);
      ctx.fill();
      // sleeves
      ctx.save(); ctx.rotate(-0.3);
      ctx.fillRect(-130, -40, 65, 35);
      ctx.restore();
      ctx.save(); ctx.rotate(0.3);
      ctx.fillRect(65, -40, 65, 35);
      ctx.restore();
      // highlight
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.roundRect(-55, -50, 50, 100, 4);
      ctx.fill();
      // INZZOUT label
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 11px "Space Grotesk", sans-serif';
      ctx.letterSpacing = '3px';
      ctx.textAlign = 'center';
      ctx.fillText('INZZOUT', 0, 20);
      ctx.restore();
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(id);
  }, [selectedColor]);

  /* ─── lookbook canvases ──────────────────────────────────────── */
  useEffect(() => {
    const scenes = [
      { primary: '#c0392b', label: 'PHANTOM' },
      { primary: '#1a1a2e', label: 'NOIR' },
      { primary: '#2c0a0a', label: 'BLOOD' },
      { primary: '#0a0a1a', label: 'MOVEMENT' },
    ];
    lookbookCanvasRefs.current.forEach((canvas, i) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth || 800;
      canvas.height = canvas.offsetHeight || 600;
      const w = canvas.width, h = canvas.height;
      const s = scenes[i];
      // Background gradient
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0a0a0a');
      g.addColorStop(1, s.primary);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // Geometric shapes
      ctx.strokeStyle = `rgba(192,57,43,0.3)`;
      ctx.lineWidth = 1;
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.arc(w * 0.6, h * 0.4, 80 + j * 40, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Figure silhouette
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.35, 40, 50, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(w * 0.5 - 30, h * 0.5, 60, 120);
      // Label
      ctx.fillStyle = 'rgba(192,57,43,0.4)';
      ctx.font = `bold ${Math.min(w * 0.12, 80)}px "Bebas Neue", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(s.label, w * 0.5, h * 0.85);
    });
  }, []);

  /* ─── scroll reveal ──────────────────────────────────────────── */
  useEffect(() => {
    if (!preloaderDone) return;
    const els = document.querySelectorAll('.reveal-up');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [preloaderDone]);

  /* ─── magnetic buttons ───────────────────────────────────────── */
  useEffect(() => {
    const btns = document.querySelectorAll('.magnetic');
    const handlers = [];
    btns.forEach((btn) => {
      const onMove = (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
      };
      const onLeave = () => { btn.style.transform = ''; };
      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
      handlers.push({ btn, onMove, onLeave });
    });
    return () => handlers.forEach(({ btn, onMove, onLeave }) => {
      btn.removeEventListener('mousemove', onMove);
      btn.removeEventListener('mouseleave', onLeave);
    });
  }, [preloaderDone, products]);

  /* ─── wanted stars (add to cart) ────────────────────────────── */
  function incrementWanted() {
    setWantedStars((s) => {
      const next = Math.min(s + 1, 5);
      setTimeout(() => setWantedStars(0), 4000);
      return next;
    });
  }

  /* ─── GTA money / mission-passed sound ───────────────────────── */
  function playMoneySound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      // Helper — plays a short sine tone
      function tone(freq, startT, dur, vol = 0.35, type = 'sine') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startT);
        gain.gain.setValueAtTime(0, startT);
        gain.gain.linearRampToValueAtTime(vol, startT + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startT);
        osc.stop(startT + dur + 0.05);
      }

      // Rising arpeggio — classic GTA "mission passed" 5-note figure
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5 E5 G5 C6 E6
      notes.forEach((f, i) => tone(f, now + i * 0.11, 0.35, 0.28));

      // Cash-register "cha-ching" click at the end
      const bufSize = ctx.sampleRate * 0.07;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 4);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now + 0.56);
      src.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      src.start(now + 0.56);

      // High ping on top
      tone(2093, now + 0.56, 0.3, 0.2);
    } catch (_) { /* AudioContext blocked — silent fail */ }
  }

  /* ─── add to cart handler ────────────────────────────────────── */
  function handleAddToCart(product) {
    if (product.stock === 0) { showToast('SOLD OUT — Join the waitlist', 'error'); return; }
    addToCart(product, selectedSize, selectedColor);
    setLastAddedPrice(product.price);
    setMissionPassed(true);
    playMoneySound();
    setTimeout(() => setMissionPassed(false), 2800);
    incrementWanted();
    showToast(`${product.name} added to cart`, 'success');
  }


  /* ─── newsletter submit ──────────────────────────────────────── */
  async function handleNewsletter(e) {
    e.preventDefault();
    if (!newsletterEmail.includes('@')) { showToast('Enter a valid email address', 'error'); return; }
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (data.success) { setNewsletterDone(true); showToast("You're in. Welcome to the movement.", 'success'); }
      else showToast(data.error || 'Something went wrong', 'error');
    } catch { showToast('Network error. Try again.', 'error'); }
  }

  /* ─── checkout handler ───────────────────────────────────────── */
  async function handleCheckout() {
    if (cart.length === 0) return;
    if (!customer.name || !customer.email || !customer.phone || !customer.addressLine1 || !customer.city || !customer.state || !customer.postalCode) {
      showToast('Complete your delivery details first.', 'error'); return;
    }
    setPaying(true);
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customer }),
      });
      const data = await res.json();
      if (!data.orderId) throw new Error(data.error || 'Order creation failed');

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'INZZOUT',
        description: 'Luxury Streetwear',
        order_id: data.orderId,
        handler: async (response) => {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            clearCart();
            setCartOpen(false);
            setMissionPassed(true);
            setTimeout(() => setMissionPassed(false), 3000);
            showToast('Order confirmed! Mission passed.', 'success');
          } else {
            showToast('Payment verification failed', 'error');
          }
        },
        prefill: { name: customer.name, email: customer.email, contact: customer.phone },
        theme: { color: '#c0392b' },
        modal: { ondismiss: () => setPaying(false) },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        showToast('Razorpay not loaded. Check your internet connection.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Checkout failed', 'error');
    } finally {
      setPaying(false);
    }
  }

  /* ─── lookbook nav ───────────────────────────────────────────── */
  function goLookbook(idx) {
    setLookbookIndex(idx);
  }

  /* ─── carousel ───────────────────────────────────────────────── */
  const CARD_W = 280;
  function carouselPrev() { setCarouselOffset((o) => Math.max(0, o - CARD_W)); }
  function carouselNext() { setCarouselOffset((o) => Math.min((products.length - 3) * CARD_W, o + CARD_W)); }

  /* ─── featured product (first one) ──────────────────────────── */
  const featured = products[0];

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      {/* ── GTA OVERLAYS ── */}
      <div id="page-load-bar" />
      <div id="police-alert" />
      <div id="cinematic-top" />
      <div id="cinematic-bottom" />

      {/* WASTED */}
      {wasted && (
        <div id="wasted-screen" className="active">
          <div className="wasted-text">WASTED</div>
        </div>
      )}

      {/* MISSION PASSED */}
      <div id="mission-passed" className={missionPassed ? 'active' : ''}>
        <div className="mp-text">MISSION PASSED</div>
        <div className="mp-sub">ITEM ADDED TO WARDROBE</div>
        {lastAddedPrice > 0 && (
          <div className="mp-money">- ₹{lastAddedPrice.toLocaleString('en-IN')}</div>
        )}
      </div>

      {/* WANTED HUD */}
      <div id="wanted-hud">
        <span className="wanted-label">WANTED</span>
        <div className="wanted-stars">
          {[1,2,3,4,5].map((s) => (
            <div key={s} className={`wanted-star${wantedStars >= s ? ' active' : ''}`} />
          ))}
        </div>
      </div>

      {/* RADIO HUD */}
      <div id="radio-hud">
        <div className="radio-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M1 6a2 2 0 012-2h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V6zm10 9a3 3 0 110-6 3 3 0 010 6zm6.5-5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>
        </div>
        <div className="radio-info">
          <div className="radio-station">INZZ FM</div>
          <div className="radio-track">PHANTOM — The Streets</div>
        </div>
      </div>

      {/* MINIMAP HUD */}
      <div id="minimap-hud">
        <canvas ref={minimapCanvasRef} id="minimap-canvas" width="140" height="140" />
        <div className="minimap-player-dot" />
        <div className="minimap-label">LOS INZZOUT</div>
      </div>

      {/* HEALTH HUD */}
      <div id="health-hud">
        <div className="hud-bar-row">
          <span className="hud-bar-label">HP</span>
          <div className="hud-bar-track"><div className="hud-bar-fill health" id="health-bar" style={{width:'100%'}} /></div>
        </div>
        <div className="hud-bar-row">
          <span className="hud-bar-label">AR</span>
          <div className="hud-bar-track"><div className="hud-bar-fill armor" id="armor-bar" style={{width:'85%'}} /></div>
        </div>
      </div>

      {/* TOAST CONTAINER */}
      <div id="gta-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`gta-toast gta-toast--${t.type}`}>{t.msg}</div>
        ))}
      </div>

      {/* CUSTOM CURSOR */}
      <div ref={cursorRef} id="cursor" className="cursor" />
      <div ref={cursorTrailRef} id="cursor-trail" className="cursor-trail" />

      {/* PRELOADER */}
      <div id="preloader" className={`preloader${preloaderDone ? ' hidden' : ''}`}>
        <div className="preloader-inner">
          <div className="preloader-emblem">
            <svg viewBox="0 0 200 200" className="emblem-svg">
              <defs><filter id="glow-filter"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
              <circle cx="100" cy="100" r="90" fill="none" stroke="#c0392b" strokeWidth="1.5" opacity="0.6"/>
              <circle cx="100" cy="100" r="80" fill="none" stroke="#c0392b" strokeWidth="0.5" opacity="0.3"/>
              <rect x="88" y="55" width="24" height="4" fill="#c0392b"/>
              <rect x="96" y="59" width="8" height="82" fill="#c0392b"/>
              <rect x="88" y="141" width="24" height="4" fill="#c0392b"/>
              <line x1="100" y1="10" x2="100" y2="22" stroke="#c0392b" strokeWidth="1.5" opacity="0.5"/>
              <line x1="100" y1="178" x2="100" y2="190" stroke="#c0392b" strokeWidth="1.5" opacity="0.5"/>
              <line x1="10" y1="100" x2="22" y2="100" stroke="#c0392b" strokeWidth="1.5" opacity="0.5"/>
              <line x1="178" y1="100" x2="190" y2="100" stroke="#c0392b" strokeWidth="1.5" opacity="0.5"/>
            </svg>
          </div>
          <div className="preloader-text">INZZOUT</div>
          <div className="preloader-sub">EST. MMXXIV</div>
          <div className="preloader-bar">
            <div className="preloader-fill" style={{width: `${preloadProgress}%`}} />
          </div>
        </div>
        <canvas ref={grainCanvasRef} id="grain-canvas" className="grain-canvas" />
      </div>

      {/* NAVBAR */}
      <nav id="navbar" className={`navbar${navScrolled ? ' scrolled' : ''}`}>
        <div className="nav-logo">
          <img
            src="/assets/collections/logowithoutbg.png"
            alt="INZZOUT"
            style={{
              height: '48px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              filter: 'brightness(1.05)',
            }}
          />
        </div>
        <div className="nav-links">
          <a href="#collections" className="nav-link" data-text="COLLECTIONS">COLLECTIONS</a>
          <a href="#products" className="nav-link" data-text="SHOP">SHOP</a>
          <a href="#lookbook" className="nav-link" data-text="LOOKBOOK">LOOKBOOK</a>
          <a href="#story" className="nav-link" data-text="STORY">STORY</a>
        </div>
        <div className="nav-actions">
          <button className="nav-icon-btn" id="search-btn" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button className="nav-icon-btn" id="cart-btn" aria-label="Cart" onClick={() => setCartOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>
          <button className="nav-hamburger" id="nav-hamburger" aria-label="Menu" onClick={() => setMobileOpen(true)}>
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div className="mobile-overlay active" id="mobile-overlay">
          <button className="mobile-close" onClick={() => setMobileOpen(false)}>&#x2715;</button>
          <nav className="mobile-nav">
            {['COLLECTIONS','SHOP','LOOKBOOK','STORY'].map((l, i) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>{l}</a>
            ))}
          </nav>
          <div className="mobile-nav-footer"><p>@INZZOUT</p></div>
        </div>
      )}

      {/* HERO */}
      <section id="hero" className="hero">
        <div className="hero-parallax" id="hero-parallax">
          <div className="parallax-layer skyline-layer" data-depth="0.1">
            <canvas ref={skylineCanvasRef} id="skyline-canvas" className="skyline-canvas" />
          </div>
          <div className="parallax-layer rain-layer" data-depth="0.2">
            <canvas ref={rainCanvasRef} id="rain-canvas" className="rain-canvas" />
          </div>
          <div className="parallax-layer smoke-layer" data-depth="0.05">
            <canvas ref={smokeCanvasRef} id="smoke-canvas" className="smoke-canvas" />
          </div>
          <div className="hero-red-reflection" id="hero-reflection" />
          <div className="parallax-layer car-layer" data-depth="0.15">
            <div className="car-silhouette" />
          </div>
          <div className="parallax-layer model-layer" data-depth="0.25">
            <div className="model-silhouette" />
          </div>
        </div>
        <div className="hero-content" id="hero-content">
          <div className="hero-badge">NEW DROP &mdash; SEP 2026</div>
          <h1 className="hero-headline" id="hero-headline" aria-label="REBEL WITH PURPOSE">
            <span className="headline-line glitch" id="hl1" data-text="" style={{opacity:0,transform:'translateY(30px)',transition:'all 0.6s ease'}} />
            <span className="headline-line accent" id="hl2" style={{opacity:0,transform:'translateY(30px)',transition:'all 0.6s ease 0.2s'}} />
            <span className="headline-line" id="hl3" style={{opacity:0,transform:'translateY(30px)',transition:'all 0.6s ease 0.4s'}} />
          </h1>
          <p className="hero-sub">Luxury streetwear for those who move different.</p>
          <div className="hero-buttons">
            <button className="btn btn-primary magnetic" id="shop-btn" onClick={() => document.getElementById('products')?.scrollIntoView({behavior:'smooth'})}>
              <span className="btn-text">SHOP NOW</span>
              <span className="btn-arrow">&#8594;</span>
              <span className="btn-glow" />
            </button>
            <button className="btn btn-secondary magnetic" id="lookbook-btn" onClick={() => document.getElementById('lookbook')?.scrollIntoView({behavior:'smooth'})}>
              <span className="btn-text">LOOKBOOK</span>
              <span className="btn-arrow">&#8594;</span>
              <span className="btn-glow" />
            </button>
          </div>
        </div>
        <div className="hero-gta-ui">
          <span className="hero-coord">N 34.0522&#176; W 118.2437&#176;</span>
          <span className="hero-location">LOS INZZOUT</span>
          <span className="hero-district">FASHION DISTRICT &mdash; SECTOR 7</span>
        </div>
        <div className="hero-scroll-hint">
          <div className="scroll-line" />
          <span>SCROLL</span>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-strip">
        <div className="marquee-inner">
          {['LUXURY STREETWEAR','LIMITED DROPS','NOT JUST A BRAND','REBEL WITH PURPOSE','SEP 2026 COLLECTION','INZZOUT'].flatMap((t,i) => [
            <span key={`${t}-${i}`}>{t}</span>,
            <span key={`sep-${i}`} className="sep">&#10022;</span>
          ])}
          {['LUXURY STREETWEAR','LIMITED DROPS','NOT JUST A BRAND','REBEL WITH PURPOSE','SEP 2026 COLLECTION','INZZOUT'].flatMap((t,i) => [
            <span key={`${t}-${i}-2`}>{t}</span>,
            <span key={`sep-${i}-2`} className="sep">&#10022;</span>
          ])}
        </div>
      </div>

      {/* DROP COUNTDOWN */}
      <section id="drop-countdown" className="drop-countdown-section">
        <div className="drop-countdown-inner">
          <span className="drop-countdown-label">INZZOUT DROP</span>
          {countdown.live ? (
            <div className="drop-live-wrap">
              <span className="drop-live-text" id="drop-live-text">DROP IS LIVE</span>
            </div>
          ) : (
            <>
              <div className="drop-countdown-digits" id="drop-countdown-digits">
                <div className="drop-digit-block">
                  <span className="drop-digit">{String(countdown.days).padStart(2,'0')}</span>
                  <span className="drop-digit-label">DAYS</span>
                </div>
                <span className="drop-digit-sep">:</span>
                <div className="drop-digit-block">
                  <span className="drop-digit">{String(countdown.hours).padStart(2,'0')}</span>
                  <span className="drop-digit-label">HOURS</span>
                </div>
                <span className="drop-digit-sep">:</span>
                <div className="drop-digit-block">
                  <span className="drop-digit">{String(countdown.minutes).padStart(2,'0')}</span>
                  <span className="drop-digit-label">MINS</span>
                </div>
                <span className="drop-digit-sep">:</span>
                <div className="drop-digit-block">
                  <span className="drop-digit">{String(countdown.seconds).padStart(2,'0')}</span>
                  <span className="drop-digit-label">SECS</span>
                </div>
              </div>
              <p className="drop-countdown-sub">SEP 27, 2026 &mdash; 12:00 AM IST</p>
            </>
          )}
        </div>
      </section>

      {/* COLLECTIONS */}
      <section id="collections" className="collections section">
        <div className="section-header reveal-up">
          <span className="section-label">&mdash; COLLECTIONS</span>
          <h2 className="section-title">DROP SEASON</h2>
        </div>
        <div className="collections-grid collections-grid--4">
          {[
            {
              id: 'col-tees',
              img: '/assets/products/phantom_tee.jpg',
              alt: 'Tees',
              season: 'SEP 2026',
              title: 'TEES',
              desc: 'Heavyweight cotton. Oversized cuts. Street-ready.',
              badge: 'NEW ARRIVAL',
              badgeCls: 'new',
              cta: 'SHOP TEES',
              productName: 'PHANTOM TEE',
            },
            {
              id: 'col-hoodies',
              img: '/assets/products/shadow_crew.jpg',
              alt: 'Hoodies',
              season: 'SEP 2026',
              title: 'HOODIES',
              desc: '600gsm fleece. Built for the streets.',
              badge: 'LIMITED DROP',
              badgeCls: '',
              cta: 'SHOP HOODIES',
              productName: 'PHANTOM OVERSIZED HOODIE',
              tall: true,
            },
            {
              id: 'col-accessories',
              img: '/assets/products/noir_cap.jpg',
              alt: 'Accessories — Caps',
              season: 'AW 2024',
              title: 'ACCESSORIES',
              desc: 'Caps, extras & finishing pieces.',
              badge: 'NEW ARRIVAL',
              badgeCls: 'new',
              cta: 'SHOP CAPS',
              productName: 'NOIR CAP',
            },
            {
              id: 'col-limited',
              img: '/assets/products/blood_jacket.jpg',
              alt: 'Limited Drops',
              season: 'FW 2023',
              title: 'LIMITED DROPS',
              desc: 'The drops that changed everything.',
              badge: 'SOLD OUT',
              badgeCls: 'sold',
              cta: 'WAITLIST',
              productName: 'BLOOD JACKET',
            },
          ].map((c) => (
            <article key={c.id} className={`collection-card reveal-up${c.tall ? ' collection-card--tall' : ''}`} id={c.id}>
              <div className="card-media">
                <img src={c.img} alt={c.alt} className="card-bg-img" loading="lazy" />
                <div className="card-overlay" />
                <div className="card-spotlight" />
                <div className={`card-badge${c.badgeCls ? ' '+c.badgeCls : ''}`}>{c.badge}</div>
              </div>
              <div className="card-info">
                <span className="card-season">{c.season}</span>
                <h3 className="card-title">{c.title}</h3>
                <p className="card-desc">{c.desc}</p>
                <button
                  className="card-cta btn btn-secondary magnetic"
                  onClick={() => {
                    const p = products.find(pr => pr.name === c.productName);
                    if (p && c.cta !== 'WAITLIST') handleAddToCart(p);
                    else document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="btn-text">{c.cta}</span>
                  <span className="btn-arrow">&#8594;</span>
                  <span className="btn-glow" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="products section">
        <div className="section-header reveal-up">
          <span className="section-label">&mdash; PRODUCTS</span>
          <h2 className="section-title">SHOP THE DROP</h2>
        </div>
        <div className="product-showcase">
          <div className="product-3d reveal-up" id="product-3d">
            <div className="product-stage">
              <canvas ref={productCanvasRef} id="product-canvas" className="product-canvas" />
              <div className="product-glow-ring" />
            </div>
            <div className="product-controls">
              <div className="color-picker">
                <span className="control-label">COLOR</span>
                <div className="color-swatches">
                  {['#0a0a0a','#1a1a2e','#2c2c2c','#c0392b'].map((c) => (
                    <button key={c} className={`swatch${selectedColor === c ? ' active' : ''}`} style={{background:c}} onClick={() => setSelectedColor(c)} aria-label={c} />
                  ))}
                </div>
              </div>
              <div className="size-picker">
                <span className="control-label">SIZE</span>
                <div className="size-options">
                  {['XS','S','M','L','XL'].map((s) => (
                    <button key={s} className={`size-btn${selectedSize === s ? ' active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="product-info reveal-up" data-delay="150">
            <div className="product-badge">LIMITED DROP &mdash; {featured?.stock} LEFT</div>
            <h3 className="product-name">{featured?.name}</h3>
            <p className="product-price">₹{featured?.price} <span className="product-orig">₹{featured?.originalPrice}</span></p>
            <p className="product-desc">{featured?.description}</p>
            <div className="product-features">
              <span className="feature-tag">HEAVYWEIGHT</span>
              <span className="feature-tag">OVERSIZED FIT</span>
              <span className="feature-tag">600GSM</span>
            </div>
            <button className="btn btn-primary magnetic full-width" id="add-to-cart" onClick={() => handleAddToCart({ ...featured, price: featured.price })}>
              <span className="btn-text">ADD TO CART</span>
              <span className="btn-arrow">&#8594;</span>
              <span className="btn-glow" />
            </button>
            <div className="product-meta">
              <span>Free shipping across India</span>
              <span>Delivered in 3&ndash;5 business days</span>
            </div>
          </div>
        </div>

        {/* CAROUSEL — 2 featured cards */}
        <div className="carousel-wrapper reveal-up">
          <div className="carousel-header carousel-header--center">
            <h3 className="carousel-title">MORE FROM THE DROP</h3>
          </div>
          <div className="carousel-two-col">
            {[
              products.find(p => p.name === 'PHANTOM OVERSIZED HOODIE'),
              products.find(p => p.name === 'NOIR CAP'),
            ].filter(Boolean).map((p) => (
              <div key={p.id} className="carousel-card carousel-card--lg">
                <div
                  className="carousel-card-img carousel-card-img--lg"
                  style={{ backgroundImage: `url(${p.imageUrl || p.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                <div className="carousel-card-info">
                  <span className="carousel-card-name">{p.name}</span>
                  <span className="carousel-card-price">₹{p.price}</span>
                </div>
                <button className="carousel-card-btn magnetic" onClick={() => handleAddToCart(p)}>
                  <span className="btn-text">ADD TO CART</span>
                  <span className="btn-arrow">&#8594;</span>
                  <span className="btn-glow" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOOKBOOK */}
      <section id="lookbook" className="lookbook section">
        <div className="lookbook-header reveal-up">
          <span className="section-label">&mdash; LOOKBOOK</span>
          <h2 className="section-title">CHAPTER ONE</h2>
        </div>
        <div className="lookbook-slides" id="lookbook-slides">
          {[
            {
              num: '01 / 02', title: 'DROP ONE',
              sub: null,
              img: '/assets/lookbook_drop_one_gta_1787900998967.jpg',
              locked: false,
            },
            {
              num: '02 / 02', title: 'TOP SECRET', sub: 'Drop Two. Details classified.',
              img: '/assets/lookbook_top_secret_locked_1787901017232.jpg',
              locked: true,
            },
          ].map((slide, i) => (
            <div key={i} className={`lookbook-slide${lookbookIndex === i ? ' active' : ''}${slide.locked ? ' lb-locked' : ''}`} id={`lb-slide-${i}`}>

              {/* Background — real image or canvas */}
              {slide.img ? (
                <img src={slide.img} alt={slide.title} className="lb-bg-img" />
              ) : (
                <canvas className="lb-canvas" ref={(el) => { lookbookCanvasRefs.current[i] = el; }} data-scene={i} />
              )}

              <div className="lb-overlay" />

              {/* Locked layer for slide 2 */}
              {slide.locked && (
                <div className="lb-lock-layer">
                  <div className="lb-lock-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="1.5" width="52" height="52">
                      <rect x="3" y="11" width="18" height="11" rx="2" fill="rgba(192,57,43,0.15)" stroke="#c0392b"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#c0392b"/>
                    </svg>
                    <span className="lb-lock-text">LOCKED</span>
                  </div>
                  <div className="lb-lock-badge">🔴 ACCESS DENIED — DROP TWO COMING SOON</div>
                </div>
              )}

              <div className="lb-content">
                <span className="lb-num">{slide.num}</span>
                <h3 className="lb-title">{slide.title}</h3>
                {slide.sub && (
                  <p className="lb-sub">{slide.sub}</p>
                )}
                {!slide.locked && !slide.sub && (
                  <p className="lb-sub lb-sub--highlight">GTA THEMED DROP</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="lookbook-nav">
          {[0,1].map((i) => (
            <button key={i} className={`lb-nav-btn${lookbookIndex === i ? ' active' : ''}`} onClick={() => goLookbook(i)} />
          ))}
        </div>
        <div className="lb-flash" id="lb-flash" />
      </section>

      {/* BRAND STORY */}
      <section id="story" className="story section">
        <canvas ref={smokeBgRef} id="smoke-bg-canvas" className="smoke-bg-canvas" />
        <div className="story-content">
          <div className="story-label reveal-up">&mdash; OUR STORY</div>
          <div className="story-big reveal-up">NOT JUST A BRAND —</div>
          <div className="story-movement reveal-up">
            <span className="movement-word" id="movement-word">IT&apos;S A MOVEMENT.</span>
          </div>
          <p className="story-body reveal-up">
            INZZOUT was born at the intersection of luxury and the streets.<br />
            We don&apos;t follow trends. We set the standard.<br />
            Every piece is a statement. Every drop is a chapter.
          </p>
          <button className="btn btn-primary magnetic reveal-up">
            <span className="btn-text">OUR STORY</span>
            <span className="btn-arrow">&#8594;</span>
            <span className="btn-glow" />
          </button>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="reviews section">
        <div className="section-header reveal-up">
          <span className="section-label">&mdash; REVIEWS</span>
          <h2 className="section-title">WHAT THEY SAY</h2>
        </div>
        <div className="reviews-grid">
          {[
            { stars: 5, text: '"The Phantom hoodie is the most premium piece I\'ve ever worn. The weight, the fit, the fabric — everything feels expensive."', initial: 'M', name: 'Marcus T.', loc: 'Los Angeles, CA', hue: 0 },
            { stars: 5, text: '"INZZOUT is what happens when the streets finally get the luxury brand they deserve. Nothing comes close."', initial: 'J', name: 'Jordan K.', loc: 'New York, NY', hue: 200 },
            { stars: 5, text: '"The Blood Lines collection was art. I\'ve worn it twice and both times someone stopped me to ask where it\'s from."', initial: 'A', name: 'Andre S.', loc: 'Atlanta, GA', hue: 120 },
            { stars: 5, text: '"Best brand alive right now. The details, the quality, the whole aesthetic — it\'s on another level. INZZOUT is a lifestyle."', initial: 'R', name: 'Riana L.', loc: 'Miami, FL', hue: 280 },
          ].map((r, i) => (
            <article key={i} className="review-card reveal-up">
              <div className="review-stars">{'★'.repeat(r.stars)}</div>
              <p className="review-text">{r.text}</p>
              <div className="review-author">
                <div className="review-avatar" style={{'--hue': r.hue}}>{r.initial}</div>
                <div>
                  <span className="review-name">{r.name}</span>
                  <span className="review-loc">{r.loc}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter" className="newsletter section">
        <div className="newsletter-inner reveal-up">
          <span className="section-label">&mdash; GET ACCESS</span>
          <h2 className="newsletter-title">JOIN THE MOVEMENT</h2>
          <p className="newsletter-sub">Early access to drops. Exclusive content. Members only.</p>
          {!newsletterDone ? (
            <form className="newsletter-form" id="newsletter-form" onSubmit={handleNewsletter} noValidate>
              <div className="input-wrapper">
                <input
                  type="email"
                  className="newsletter-input"
                  id="newsletter-email"
                  placeholder="YOUR EMAIL ADDRESS"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  autoComplete="email"
                />
                <button type="submit" className="newsletter-submit magnetic" id="newsletter-submit" aria-label="Subscribe">
                  <span className="submit-arrow">&#8594;</span>
                </button>
              </div>
              <p className="newsletter-disclaimer">No spam. Ever. Unsubscribe anytime.</p>
            </form>
          ) : (
            <div className="newsletter-success" id="newsletter-success">
              <span className="success-icon">&#10003;</span>
              <span>You&apos;re in. Welcome to the movement.</span>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">INZZOUT</div>
            <p className="footer-tagline">Not just a brand. A movement.</p>
            <div className="footer-socials">
              {[
                { id: 'social-ig', label: 'Instagram', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg> },
                { id: 'social-tt', label: 'TikTok', svg: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.93a8.17 8.17 0 004.78 1.52V7.01a4.85 4.85 0 01-1.01-.32z"/></svg> },
                { id: 'social-x', label: 'X', svg: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { id: 'social-yt', label: 'YouTube', svg: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M23 7s-.3-1.9-1.2-2.7c-1.1-1.2-2.4-1.2-3-1.3C16.2 3 12 3 12 3s-4.2 0-6.8.3c-.6.1-1.9.1-3 1.3C1.3 5.4 1 7 1 7S.7 9.1.7 11.2v1.9c0 2.1.3 4.2.3 4.2s.3 1.9 1.2 2.7c1.1 1.2 2.6 1.1 3.3 1.2C7.2 21.3 12 21.3 12 21.3s4.2 0 6.8-.3c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.7 1.2-2.7s.3-2.1.3-4.2v-1.9C23.3 9.1 23 7 23 7zm-13.5 8.5v-7.3l8.1 3.7-8.1 3.6z"/></svg> },
              ].map((s) => (
                <a key={s.id} href="#" className="social-icon" id={s.id} aria-label={s.label}>{s.svg}</a>
              ))}
            </div>
          </div>
          <div className="footer-links-group">
            <h4>SHOP</h4>
            <a href="#">New Arrivals</a>
            <a href="#">Collections</a>
          </div>
          <div className="footer-links-group">
            <h4>SUPPORT</h4>
            <button className="footer-link-btn" id="footer-size-chart" onClick={() => setSizeChartOpen(true)}>Size Chart</button>
            <a href="#">FAQ</a>
            <button className="footer-link-btn" id="footer-contact" onClick={() => setContactOpen(true)}>Contact</button>
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">
          <p>&copy; 2024 INZZOUT. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">Cookie Policy</a>
          </div>
        </div>
      </footer>

      {/* CART DRAWER */}
      <div className={`cart-drawer${cartOpen ? ' open' : ''}`} id="cart-drawer">
        <div className="cart-drawer-header">
          <h3>YOUR CART</h3>
          <button className="cart-close" id="cart-close" onClick={() => setCartOpen(false)}>&#x2715;</button>
        </div>
        <div className="cart-items" id="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty.</p>
              <button className="btn btn-secondary magnetic" onClick={() => { setCartOpen(false); document.getElementById('products')?.scrollIntoView({behavior:'smooth'}); }}>SHOP NOW &#8594;</button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._cartKey} className="cart-item">
                <div className="cart-item-img" style={{backgroundImage:`url(${item.imageUrl || item.image_url || ''})`, backgroundSize:'cover', backgroundPosition:'center', width:60, height:60, borderRadius:4, flexShrink:0}} />
                <div className="cart-item-info" style={{flex:1, marginLeft:12}}>
                  <div className="cart-item-name" style={{fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.1em'}}>{item.name}</div>
                  <div className="cart-item-meta" style={{fontSize:'0.65rem', color:'#666', marginTop:4}}>{item.size} &bull; <span style={{display:'inline-block', width:10, height:10, background:item.color, borderRadius:2, verticalAlign:'middle'}} /></div>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8}}>
                    <button onClick={() => updateQty(item._cartKey, item.qty - 1)} style={{background:'#1a1a1a', border:'none', color:'#fff', width:22, height:22, cursor:'pointer', fontSize:14}}>−</button>
                    <span style={{fontSize:'0.8rem'}}>{item.qty}</span>
                    <button onClick={() => updateQty(item._cartKey, item.qty + 1)} style={{background:'#1a1a1a', border:'none', color:'#fff', width:22, height:22, cursor:'pointer', fontSize:14}}>+</button>
                  </div>
                </div>
                <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8}}>
                  <span style={{fontSize:'0.85rem', fontWeight:700}}>₹{(item.price * item.qty).toFixed(0)}</span>
                  <button onClick={() => removeFromCart(item._cartKey)} style={{background:'none', border:'none', color:'#666', cursor:'pointer', fontSize:12}}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer" id="cart-footer">
            <div style={{display:'grid', gap:8, marginBottom:12}}>
              {[['name','FULL NAME','text'],['email','EMAIL','email'],['phone','PHONE','tel'],['addressLine1','DELIVERY ADDRESS','text'],['addressLine2','ADDRESS LINE 2 (OPTIONAL)','text'],['city','CITY','text'],['state','STATE','text'],['postalCode','PIN CODE','text']].map(([field, placeholder, type]) => <input key={field} type={type} placeholder={placeholder} value={customer[field]} onChange={(e) => setCustomer((current) => ({...current, [field]: e.target.value}))} autoComplete={field === 'email' ? 'email' : undefined} style={{width:'100%', background:'#111', border:'1px solid #222', color:'#fff', padding:'10px 14px', fontSize:'0.75rem', letterSpacing:'0.05em', boxSizing:'border-box'}} />)}
            </div>
            <div className="cart-total">
              <span>TOTAL</span>
              <span id="cart-total-price">₹{total.toFixed(0)}</span>
            </div>
            <button className="btn btn-primary magnetic full-width" id="checkout-btn" onClick={handleCheckout} disabled={paying}>
              <span className="btn-text">{paying ? 'PROCESSING...' : 'CHECKOUT'}</span>
              <span className="btn-arrow">&#8594;</span>
              <span className="btn-glow" />
            </button>
          </div>
        )}
      </div>
      {cartOpen && <div className="cart-overlay active" id="cart-overlay" onClick={() => setCartOpen(false)} />}

      <div className="ripple-container" id="ripple-container" />

      {/* SIZE CHART MODAL */}
      {sizeChartOpen && (
        <div className="modal-overlay" id="size-chart-overlay" onClick={() => setSizeChartOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSizeChartOpen(false)}>&#x2715;</button>
            <h3 className="modal-title">SIZE CHART</h3>
            <p className="modal-sub">All measurements in centimetres (CM)</p>
            <div className="size-chart-table-wrap">
              <table className="size-chart-table">
                <thead>
                  <tr>
                    <th>SIZE</th><th>CHEST</th><th>SHOULDER</th><th>LENGTH</th><th>SLEEVE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>XS</td><td>88</td><td>42</td><td>66</td><td>60</td></tr>
                  <tr><td>S</td><td>94</td><td>44</td><td>69</td><td>62</td></tr>
                  <tr><td>M</td><td>100</td><td>46</td><td>72</td><td>64</td></tr>
                  <tr><td>L</td><td>106</td><td>48</td><td>75</td><td>66</td></tr>
                  <tr><td>XL</td><td>112</td><td>50</td><td>78</td><td>68</td></tr>
                </tbody>
              </table>
            </div>
            <p className="modal-note">&#x2605; INZZOUT fits oversized. For a regular fit, size down.</p>
          </div>
        </div>
      )}

      {/* CONTACT MODAL */}
      {contactOpen && (
        <div className="modal-overlay" id="contact-overlay" onClick={() => setContactOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setContactOpen(false)}>&#x2715;</button>
            <h3 className="modal-title">CONTACT US</h3>
            <div className="contact-rows">
              <div className="contact-row">
                <span className="contact-icon">&#128222;</span>
                <div>
                  <div className="contact-label">PERSONAL</div>
                  <a href="tel:9789163680" className="contact-value">9789163680</a>
                </div>
              </div>
              <div className="contact-row">
                <span className="contact-icon">&#128222;</span>
                <div>
                  <div className="contact-label">OFFICIAL</div>
                  <a href="tel:8608882609" className="contact-value">8608882609</a>
                </div>
              </div>
              <div className="contact-row">
                <span className="contact-icon">&#9993;</span>
                <div>
                  <div className="contact-label">EMAIL</div>
                  <a href="mailto:innzoutofficial@gmail.com" className="contact-value">innzoutofficial@gmail.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
