/**
 * Interactive network-lines background for the "Tentang" section (vanilla canvas).
 * - Drifting nodes connect with fading lines when close to each other.
 * - The cursor pulls gold lines to nearby nodes and gently attracts them.
 * - A click / tap releases a burst of new nodes that fade out.
 * Skipped when the visitor prefers reduced motion.
 */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var section = document.getElementById('tentang');
  if (!section) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'lines-bg-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  section.insertBefore(canvas, section.firstChild);
  section.classList.add('has-lines');

  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = 0, h = 0, nodes = [], burst = [];
  var mouse = { x: -9999, y: -9999, on: false };
  var visible = false, running = false;

  var LINK = 150, MOUSE_R = 210;
  var BLUE = '147,197,253', GOLD = '251,191,36';

  function makeNode(x, y, life) {
    var a = Math.random() * 6.2832, s = 0.12 + Math.random() * 0.28;
    return { x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 1 + Math.random() * 1.4, life: life || 0 };
  }

  function seed() {
    var count = Math.min(95, Math.round((w * h) / 11000));
    nodes = [];
    for (var i = 0; i < count; i++) nodes.push(makeNode(Math.random() * w, Math.random() * h));
  }

  function resize() {
    var r = section.getBoundingClientRect();
    w = Math.max(1, Math.round(r.width));
    h = Math.max(1, Math.round(r.height));
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function local(e) {
    var r = section.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function wake() {
    if (!running && visible) { running = true; requestAnimationFrame(tick); }
  }

  section.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var p = local(e); mouse.x = p.x; mouse.y = p.y; mouse.on = true;
  });
  section.addEventListener('pointerleave', function () { mouse.on = false; });
  section.addEventListener('pointerdown', function (e) {
    var p = local(e);
    for (var i = 0; i < 9; i++) {
      var n = makeNode(p.x, p.y, 1);
      var a = (i / 9) * 6.2832 + Math.random() * 0.5, s = 1.2 + Math.random() * 1.6;
      n.vx = Math.cos(a) * s; n.vy = Math.sin(a) * s; n.r = 1.6 + Math.random() * 1.4;
      burst.push(n);
    }
    if (burst.length > 60) burst.splice(0, burst.length - 60);
  });

  function step(list, isBurst) {
    for (var i = list.length - 1; i >= 0; i--) {
      var n = list[i];
      if (mouse.on && !isBurst) {
        var dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_R && d > 1) { n.vx += (dx / d) * 0.012; n.vy += (dy / d) * 0.012; }
      }
      n.x += n.vx; n.y += n.vy;
      if (isBurst) {
        n.vx *= 0.96; n.vy *= 0.96; n.life -= 0.012;
        if (n.life <= 0) { list.splice(i, 1); continue; }
      } else {
        // speed limit + wrap around edges
        var sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (sp > 0.9) { n.vx *= 0.9; n.vy *= 0.9; }
        if (n.x < -10) n.x = w + 10; else if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10; else if (n.y > h + 10) n.y = -10;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    var all = nodes.concat(burst), i, j, a, b, dx, dy, d, alpha;

    ctx.lineWidth = 1;
    for (i = 0; i < all.length; i++) {
      a = all[i];
      for (j = i + 1; j < all.length; j++) {
        b = all[j]; dx = a.x - b.x; dy = a.y - b.y;
        if (dx > LINK || dx < -LINK || dy > LINK || dy < -LINK) continue;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          alpha = (1 - d / LINK) * 0.38 * Math.min(a.life || 1, b.life || 1);
          ctx.strokeStyle = 'rgba(' + BLUE + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      if (mouse.on) {
        dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_R) {
          alpha = (1 - d / MOUSE_R) * 0.75;
          ctx.strokeStyle = 'rgba(' + GOLD + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
    }
    for (i = 0; i < all.length; i++) {
      a = all[i];
      var near = 0;
      if (mouse.on) {
        dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_R) near = 1 - d / MOUSE_R;
      }
      ctx.fillStyle = near > 0.05 ? 'rgba(' + GOLD + ',' + (0.55 + near * 0.45).toFixed(2) + ')'
        : 'rgba(' + BLUE + ',' + (0.55 * (a.life || 1)).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r + near * 1.6, 0, 6.2832); ctx.fill();
    }
    if (mouse.on) {
      var g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_R);
      g.addColorStop(0, 'rgba(' + GOLD + ',0.10)'); g.addColorStop(1, 'rgba(' + GOLD + ',0)');
      ctx.fillStyle = g; ctx.fillRect(mouse.x - MOUSE_R, mouse.y - MOUSE_R, MOUSE_R * 2, MOUSE_R * 2);
    }
  }

  function tick() {
    step(nodes, false); step(burst, true); draw();
    if (!visible) { running = false; return; }
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) wake(); }).observe(section);
  } else { visible = true; wake(); }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(section);
  else window.addEventListener('resize', resize);
  resize();
})();
