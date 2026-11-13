/**
 * Section background patterns (vanilla canvas, no build step).
 * Usage: <section (or wrapper div) data-bg="waves|diagonals|rings|grid|aurora|particles" data-bg-tone="light|dark">
 *
 *  waves      flowing horizontal lines that bulge around the cursor      (lively)
 *  rings      ripple rings expanding from anchor points and from clicks  (lively)
 *  particles  small glowing dots drifting upward                         (medium)
 *  diagonals  slow diagonal hairlines with travelling light streaks      (calm)
 *  grid       fine square grid whose cells softly light up               (calm)
 *  aurora     large blurred colour glows drifting slowly                 (calm)
 *
 * Only sections on screen animate. Skipped entirely for prefers-reduced-motion.
 */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var TAU = 6.2832;
  var TONES = {
    light: { line: '15,46,89', soft: '37,99,235', gold: '201,138,44', k: 1 },
    dark: { line: '147,197,253', soft: '96,165,250', gold: '251,191,36', k: 1.7 }
  };
  function rgba(c, a) { return 'rgba(' + c + ',' + (a < 0 ? 0 : a > 1 ? 1 : a).toFixed(3) + ')'; }

  var PATTERNS = {
    /* ---------------------------------------------------------------- waves */
    waves: function (S) {
      var GAP = 78, STEP = 18;
      return {
        draw: function (ctx, t) {
          var T = S.tone, rows = Math.ceil(S.h / GAP) + 1;
          ctx.lineWidth = 1.2;
          for (var k = 0; k < rows; k++) {
            var gold = k % 4 === 2, y0 = k * GAP + 20;
            ctx.strokeStyle = rgba(gold ? T.gold : T.line, (gold ? 0.2 : 0.11) * T.k);
            ctx.beginPath();
            for (var x = -STEP; x <= S.w + STEP; x += STEP) {
              var y = y0 + Math.sin(x * 0.006 + t * 0.55 + k * 0.7) * 16 + Math.sin(x * 0.0135 - t * 0.38 + k * 1.9) * 8;
              if (S.mouse.s > 0.01) {
                var dx = x - S.mouse.x, dy = y - S.mouse.y, d2 = dx * dx + dy * dy;
                if (d2 < 48400) y += (dy < 0 ? -1 : 1) * Math.exp(-d2 / 9000) * 26 * S.mouse.s;
              }
              if (x === -STEP) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        }
      };
    },

    /* ------------------------------------------------------------ diagonals */
    diagonals: function (S) {
      var GAP = 38, streaks = [];
      function spawn() {
        streaks.push({ line: Math.floor(Math.random() * 400), p: -0.1, v: 0.1 + Math.random() * 0.14, gold: Math.random() < 0.4 });
      }
      function lines(ctx, off, alpha, color) {
        ctx.strokeStyle = rgba(color, alpha);
        ctx.beginPath();
        for (var c = -S.h + off; c < S.w + GAP; c += GAP) { ctx.moveTo(c, 0); ctx.lineTo(c + S.h, S.h); }
        ctx.stroke();
      }
      return {
        draw: function (ctx, t, dt) {
          var T = S.tone, off = (t * 7) % GAP, i;
          ctx.lineWidth = 1;
          lines(ctx, off, 0.05 * T.k, T.line);
          if (S.mouse.s > 0.01) {           // lines brighten in a soft circle around the cursor
            ctx.save();
            ctx.beginPath(); ctx.arc(S.mouse.x, S.mouse.y, 150, 0, TAU); ctx.clip();
            lines(ctx, off, 0.2 * T.k * S.mouse.s, T.gold);
            ctx.restore();
          }
          var want = Math.max(3, Math.round((S.w + S.h) / 420));
          if (streaks.length < want && Math.random() < 0.04) spawn();
          var count = Math.ceil((S.w + S.h) / GAP), len = 150;
          ctx.lineWidth = 1.6; ctx.lineCap = 'round';
          for (i = streaks.length - 1; i >= 0; i--) {
            var s = streaks[i];
            s.p += s.v * dt;
            if (s.p > 1.1) { streaks.splice(i, 1); continue; }
            var c = -S.h + off + (s.line % count) * GAP;
            var x = c + s.p * S.h, y = s.p * S.h;
            var g = ctx.createLinearGradient(x - len * 0.707, y - len * 0.707, x, y);
            g.addColorStop(0, rgba(s.gold ? T.gold : T.soft, 0));
            g.addColorStop(1, rgba(s.gold ? T.gold : T.soft, 0.5 * T.k));
            ctx.strokeStyle = g;
            ctx.beginPath(); ctx.moveTo(x - len * 0.707, y - len * 0.707); ctx.lineTo(x, y); ctx.stroke();
          }
        }
      };
    },

    /* ---------------------------------------------------------------- rings */
    rings: function (S) {
      var rings = [], anchors = [], last = 0, lastMove = { x: -999, y: -999 };
      var LIFE = 5.5, MAXR = 440;
      return {
        resize: function () {
          anchors = [];
          var n = Math.max(2, Math.round(S.h / 420));
          for (var i = 0; i < n; i++) {
            anchors.push({ x: S.w * (i % 2 ? 0.86 : 0.14), y: (S.h / n) * (i + 0.5) });
          }
        },
        down: function (p) { rings.push({ x: p.x, y: p.y, age: 0, gold: true }); },
        move: function (p) {
          var dx = p.x - lastMove.x, dy = p.y - lastMove.y;
          if (dx * dx + dy * dy > 260 * 260) { rings.push({ x: p.x, y: p.y, age: 0, gold: false, small: true }); lastMove = p; }
        },
        draw: function (ctx, t, dt) {
          var T = S.tone, i;
          if (t - last > 1.5 && anchors.length) {
            var a = anchors[Math.floor(Math.random() * anchors.length)];
            rings.push({ x: a.x, y: a.y, age: 0, gold: Math.random() < 0.3 });
            last = t;
          }
          if (rings.length > 40) rings.splice(0, rings.length - 40);
          ctx.lineWidth = 1.3;
          for (i = rings.length - 1; i >= 0; i--) {
            var r = rings[i];
            r.age += dt;
            var life = r.small ? LIFE * 0.45 : LIFE, k = r.age / life;
            if (k >= 1) { rings.splice(i, 1); continue; }
            var rad = (r.small ? MAXR * 0.4 : MAXR) * (1 - Math.pow(1 - k, 2));
            ctx.strokeStyle = rgba(r.gold ? T.gold : T.line, (r.gold ? 0.3 : 0.17) * (1 - k) * T.k);
            ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, TAU); ctx.stroke();
            if (rad > 60) {
              ctx.strokeStyle = rgba(T.soft, 0.09 * (1 - k) * T.k);
              ctx.beginPath(); ctx.arc(r.x, r.y, rad - 46, 0, TAU); ctx.stroke();
            }
          }
        }
      };
    },

    /* ----------------------------------------------------------------- grid */
    grid: function (S) {
      var CELL = 46, cells = [];
      return {
        draw: function (ctx, t, dt) {
          var T = S.tone, cols = Math.ceil(S.w / CELL), rows = Math.ceil(S.h / CELL), i;
          ctx.lineWidth = 1;
          ctx.strokeStyle = rgba(T.line, 0.045 * T.k);
          ctx.beginPath();
          for (i = 0; i <= cols; i++) { ctx.moveTo(i * CELL + 0.5, 0); ctx.lineTo(i * CELL + 0.5, S.h); }
          for (i = 0; i <= rows; i++) { ctx.moveTo(0, i * CELL + 0.5); ctx.lineTo(S.w, i * CELL + 0.5); }
          ctx.stroke();

          var want = Math.min(46, Math.round((S.w * S.h) / 52000));
          if (cells.length < want && Math.random() < 0.3) {
            cells.push({ c: Math.floor(Math.random() * cols), r: Math.floor(Math.random() * rows), age: 0, life: 2.4 + Math.random() * 3, gold: Math.random() < 0.28 });
          }
          for (i = cells.length - 1; i >= 0; i--) {
            var c = cells[i];
            c.age += dt;
            if (c.age >= c.life) { cells.splice(i, 1); continue; }
            ctx.fillStyle = rgba(c.gold ? T.gold : T.soft, Math.sin((c.age / c.life) * Math.PI) * (c.gold ? 0.16 : 0.1) * T.k);
            ctx.fillRect(c.c * CELL + 1, c.r * CELL + 1, CELL - 1, CELL - 1);
          }
          if (S.mouse.s > 0.01) {           // cells under the cursor glow gold
            var mc = Math.floor(S.mouse.x / CELL), mr = Math.floor(S.mouse.y / CELL);
            for (var a = -2; a <= 2; a++) for (var b = -2; b <= 2; b++) {
              var d = Math.sqrt(a * a + b * b);
              if (d > 2.3) continue;
              ctx.fillStyle = rgba(T.gold, (0.24 - d * 0.09) * S.mouse.s * T.k);
              ctx.fillRect((mc + a) * CELL + 1, (mr + b) * CELL + 1, CELL - 1, CELL - 1);
            }
          }
        }
      };
    },

    /* --------------------------------------------------------------- aurora */
    aurora: function (S) {
      var blobs = [
        { c: 'soft', a: 0.13, fx: 0.11, fy: 0.07, px: 0.0, py: 1.3, r: 0.55 },
        { c: 'gold', a: 0.12, fx: 0.07, fy: 0.10, px: 2.1, py: 0.4, r: 0.48 },
        { c: 'line', a: 0.08, fx: 0.09, fy: 0.05, px: 4.0, py: 2.7, r: 0.6 },
        { c: 'soft', a: 0.09, fx: 0.05, fy: 0.12, px: 5.2, py: 4.1, r: 0.42 }
      ];
      function blob(ctx, x, y, rad, color, alpha) {
        var g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, rgba(color, alpha)); g.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      return {
        draw: function (ctx, t) {
          var T = S.tone, base = Math.max(260, Math.min(S.w, S.h, 900));
          for (var i = 0; i < blobs.length; i++) {
            var b = blobs[i];
            blob(ctx, S.w * (0.5 + 0.42 * Math.sin(t * b.fx + b.px)), S.h * (0.5 + 0.4 * Math.cos(t * b.fy + b.py)), base * b.r, T[b.c], b.a * T.k);
          }
          if (S.mouse.s > 0.01) blob(ctx, S.mouse.x, S.mouse.y, 230, T.gold, 0.14 * S.mouse.s * T.k);
        }
      };
    },

    /* --------------------------------------------------------------- hexgrid */
    hexgrid: function (S) {
      var SIZE = 36, pulses = [], lastPulse = 0;
      var cols, rows, hexes = [];

      function hexPath(ctx, cx, cy, r) {
        ctx.beginPath();
        for (var i = 0; i < 6; i++) {
          var a = Math.PI / 180 * (60 * i - 30);
          if (i === 0) ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
          else ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
        }
        ctx.closePath();
      }

      return {
        resize: function () {
          var w = SIZE * 2, h = Math.sqrt(3) * SIZE;
          cols = Math.ceil(S.w / (w * 0.75)) + 2;
          rows = Math.ceil(S.h / h) + 2;
          hexes = [];
          for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
              var cx = c * w * 0.75 - SIZE;
              var cy = r * h + (c % 2 ? h / 2 : 0) - h / 2;
              hexes.push({ cx: cx, cy: cy, ph: Math.random() * TAU });
            }
          }
        },
        draw: function (ctx, t, dt) {
          var T = S.tone, i, h = Math.sqrt(3) * SIZE;

          // Spawn pulse at random hex every 0.6s
          if (t - lastPulse > 0.6 && hexes.length) {
            var idx = Math.floor(Math.random() * hexes.length);
            pulses.push({ cx: hexes[idx].cx, cy: hexes[idx].cy, age: 0, life: 2.2 + Math.random() * 1.8, gold: Math.random() < 0.32 });
            lastPulse = t;
          }

          // Static faint hex grid
          ctx.lineWidth = 0.8;
          ctx.strokeStyle = rgba(T.line, 0.055 * T.k);
          for (i = 0; i < hexes.length; i++) {
            hexPath(ctx, hexes[i].cx, hexes[i].cy, SIZE - 1);
            ctx.stroke();
          }

          // Animated pulses: hex fills that fade in and out
          for (i = pulses.length - 1; i >= 0; i--) {
            var p = pulses[i];
            p.age += dt;
            if (p.age >= p.life) { pulses.splice(i, 1); continue; }
            var k = p.age / p.life;
            var alpha = Math.sin(k * Math.PI) * (p.gold ? 0.18 : 0.10) * T.k;
            ctx.fillStyle = rgba(p.gold ? T.gold : T.soft, alpha);
            hexPath(ctx, p.cx, p.cy, SIZE - 2);
            ctx.fill();
            // Edge glow
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = rgba(p.gold ? T.gold : T.line, alpha * 0.7);
            hexPath(ctx, p.cx, p.cy, SIZE - 2);
            ctx.stroke();
          }

          // Mouse: illuminate nearby hexes
          if (S.mouse.s > 0.01) {
            for (i = 0; i < hexes.length; i++) {
              var dx = hexes[i].cx - S.mouse.x, dy = hexes[i].cy - S.mouse.y;
              var d2 = dx * dx + dy * dy;
              if (d2 < 180 * 180) {
                var fade = (1 - Math.sqrt(d2) / 180) * S.mouse.s;
                ctx.fillStyle = rgba(T.gold, 0.15 * fade * T.k);
                hexPath(ctx, hexes[i].cx, hexes[i].cy, SIZE - 2);
                ctx.fill();
              }
            }
          }
        }
      };
    },

    /* ------------------------------------------------------------ particles */
    particles: function (S) {
      var ps = [];
      function make(anyY) {
        return {
          x: Math.random() * S.w, y: anyY ? Math.random() * S.h : S.h + 12,
          r: 0.9 + Math.random() * 2.3, v: 9 + Math.random() * 20, ph: Math.random() * TAU,
          sway: 6 + Math.random() * 16, gold: Math.random() < 0.26, vx: 0
        };
      }
      return {
        resize: function () {
          var n = Math.min(130, Math.round((S.w * S.h) / 8500));
          ps = [];
          for (var i = 0; i < n; i++) ps.push(make(true));
        },
        down: function (p) {
          for (var i = 0; i < ps.length; i++) {
            var dx = ps[i].x - p.x, dy = ps[i].y - p.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
            if (d < 220) { ps[i].vx += (dx / d) * (1 - d / 220) * 160; ps[i].y += (dy / d) * (1 - d / 220) * 30; }
          }
        },
        draw: function (ctx, t, dt) {
          var T = S.tone;
          for (var i = 0; i < ps.length; i++) {
            var p = ps[i];
            p.y -= p.v * dt;
            p.x += p.vx * dt; p.vx *= 0.94;
            if (S.mouse.s > 0.01) {
              var dx = p.x - S.mouse.x, dy = p.y - S.mouse.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
              if (d < 130) { p.x += (dx / d) * (1 - d / 130) * 70 * dt; p.y += (dy / d) * (1 - d / 130) * 70 * dt; }
            }
            if (p.y < -12 || p.x < -40 || p.x > S.w + 40) { ps[i] = p = make(false); }
            var x = p.x + Math.sin(t * 0.6 + p.ph) * p.sway;
            var tw = 0.55 + 0.45 * Math.sin(t * 1.3 + p.ph * 2);
            ctx.fillStyle = rgba(p.gold ? T.gold : T.line, (p.gold ? 0.5 : 0.3) * tw * T.k * 0.75);
            ctx.beginPath(); ctx.arc(x, p.y, p.r, 0, TAU); ctx.fill();
            if (p.r > 2.4) {
              ctx.fillStyle = rgba(p.gold ? T.gold : T.soft, 0.07 * tw * T.k);
              ctx.beginPath(); ctx.arc(x, p.y, p.r * 3.4, 0, TAU); ctx.fill();
            }
          }
        }
      };
    }
  };

  function mount(section) {
    var make = PATTERNS[section.getAttribute('data-bg')];
    if (!make) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'sbg-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    section.insertBefore(canvas, section.firstChild);
    section.classList.add('has-sbg', 'has-kinetic');

    var ctx = canvas.getContext('2d');
    var S = {
      w: 1, h: 1,
      tone: TONES[section.getAttribute('data-bg-tone') === 'dark' ? 'dark' : 'light'],
      mouse: { x: -9999, y: -9999, s: 0, on: false }
    };
    var pattern = make(S);
    var visible = false, running = false, prev = 0;

    function resize() {
      var r = section.getBoundingClientRect();
      S.w = Math.max(1, Math.round(r.width));
      S.h = Math.max(1, Math.round(r.height));
      // keep very tall sections cheap: fewer backing pixels
      var dpr = Math.min(window.devicePixelRatio || 1, S.h > 1500 ? 1 : 1.5);
      canvas.width = Math.round(S.w * dpr);
      canvas.height = Math.round(S.h * dpr);
      canvas.style.width = S.w + 'px';
      canvas.style.height = S.h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (pattern.resize) pattern.resize();
      wake();
    }
    function local(e) {
      var r = section.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function wake() {
      if (!running && visible) { running = true; prev = 0; requestAnimationFrame(tick); }
    }
    function tick(now) {
      if (!visible) { running = false; return; }
      var dt = prev ? Math.min(0.05, (now - prev) / 1000) : 0.016;
      prev = now;
      S.mouse.s += ((S.mouse.on ? 1 : 0) - S.mouse.s) * 0.1;
      ctx.clearRect(0, 0, S.w, S.h);
      pattern.draw(ctx, now / 1000, dt);
      requestAnimationFrame(tick);
    }

    section.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var p = local(e);
      S.mouse.x = p.x; S.mouse.y = p.y; S.mouse.on = true;
      if (pattern.move) pattern.move(p);
    });
    section.addEventListener('pointerleave', function () { S.mouse.on = false; });
    section.addEventListener('pointerdown', function (e) { if (pattern.down) pattern.down(local(e)); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible) wake();
      }, { rootMargin: '80px' }).observe(section);
    } else { visible = true; }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(section);
    else window.addEventListener('resize', resize);
    resize();
  }

  function init() {
    document.querySelectorAll('[data-bg]').forEach(mount);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
