/**
 * Kinetic dot-grid background (vanilla JS, no build step).
 * Behaviour inspired by the "Kinetic Grid" idea on 21st.dev: dots bend toward the
 * cursor and a click sends a ripple outward. Palette is IKAPMI navy + gold.
 * Falls back to the static CSS dot pattern if reduced-motion is requested.
 */
(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SPACING = 26;            // px between dots
  var RADIUS = 170;            // cursor influence radius
  var PULL = 16;               // max px a dot bends toward the cursor
  var RIPPLE_SPEED = 460;      // px / second
  var RIPPLE_LIFE = 1.5;       // seconds
  var RIPPLE_BAND = 70;        // px thickness of the wave
  var LIGHT = { base: [203, 213, 225], hover: [15, 46, 89] };   // dots on light sections
  var DARK = { base: [48, 78, 124], hover: [147, 197, 253] };   // dots on the blue section
  var GOLD = [201, 138, 44];

  function mix(a, b, t) {
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' +
      Math.round(a[1] + (b[1] - a[1]) * t) + ',' +
      Math.round(a[2] + (b[2] - a[2]) * t) + ')';
  }

  function Grid(section) {
    var self = this;
    var canvas = document.createElement('canvas');
    canvas.className = 'kinetic-bg-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    section.insertBefore(canvas, section.firstChild);
    section.classList.add('has-kinetic');

    var ambient = section.getAttribute('data-kinetic') === 'ambient';
    var radius = ambient ? 230 : RADIUS, pullMax = ambient ? 24 : PULL;
    var lastTrail = { x: -9999, y: -9999 };
    var pal = section.classList.contains('bg-section-blue') ? DARK : LIGHT;
    var BASE = pal.base, NAVY = pal.hover;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var target = { x: -9999, y: -9999 };
    var pos = { x: -9999, y: -9999 };
    var strength = 0, strengthTarget = 0;
    var ripples = [];
    var visible = false, running = false;

    function resize() {
      var r = section.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }

    function local(e) {
      var r = section.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function wake() {
      if (!running && visible) {
        running = true;
        requestAnimationFrame(tick);
      }
    }

    section.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var p = local(e);
      target.x = p.x; target.y = p.y;
      if (strengthTarget === 0) { pos.x = p.x; pos.y = p.y; }
      if (ambient) {
        var mx = p.x - lastTrail.x, my = p.y - lastTrail.y;
        if (mx * mx + my * my > 140 * 140) {
          ripples.push({ x: p.x, y: p.y, t0: performance.now() });
          if (ripples.length > 5) ripples.shift();
          lastTrail.x = p.x; lastTrail.y = p.y;
        }
      }
      strengthTarget = 1;
      wake();
    });
    section.addEventListener('pointerleave', function () {
      strengthTarget = 0;
      wake();
    });
    section.addEventListener('pointerdown', function (e) {
      var p = local(e);
      ripples.push({ x: p.x, y: p.y, t0: performance.now() });
      if (ripples.length > 5) ripples.shift();
      wake();
    });

    function draw(now) {
      ctx.clearRect(0, 0, w, h);
      var cols = Math.ceil(w / SPACING) + 1;
      var rows = Math.ceil(h / SPACING) + 1;
      var offX = (w - (cols - 1) * SPACING) / 2;
      var offY = (h - (rows - 1) * SPACING) / 2;
      var R2 = radius * radius;

      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var ox = offX + i * SPACING;
          var oy = offY + j * SPACING;
          var x = ox, y = oy;
          var size = 1.05 + (ambient ? (Math.sin(now / 1100 + i * 0.42 + j * 0.31) + 1) * 0.32 : 0);
          var navyT = 0, goldT = 0;

          // Cursor: dots bend toward the pointer
          if (strength > 0.01) {
            var dx = pos.x - ox, dy = pos.y - oy;
            var d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              var d = Math.sqrt(d2) || 1;
              var f = Math.pow(1 - d / radius, 2) * strength;
              var pull = Math.min(pullMax * f, d);
              x += (dx / d) * pull;
              y += (dy / d) * pull;
              size += f * 2.1;
              navyT = Math.max(navyT, f);
            }
          }

          // Click ripples: wave travels outward, pushing dots away
          for (var k = 0; k < ripples.length; k++) {
            var rp = ripples[k];
            var age = (now - rp.t0) / 1000;
            if (age > RIPPLE_LIFE) continue;
            var rx = ox - rp.x, ry = oy - rp.y;
            var rd = Math.sqrt(rx * rx + ry * ry) || 1;
            var front = age * RIPPLE_SPEED;
            var diff = Math.abs(rd - front);
            if (diff < RIPPLE_BAND) {
              var wv = (1 - diff / RIPPLE_BAND) * (1 - age / RIPPLE_LIFE);
              x += (rx / rd) * wv * 11;
              y += (ry / rd) * wv * 11;
              size += wv * 2.4;
              goldT = Math.max(goldT, wv);
            }
          }

          ctx.fillStyle = goldT > 0.02 ? mix(BASE, GOLD, Math.min(1, goldT * 1.2))
            : navyT > 0.02 ? mix(BASE, NAVY, Math.min(1, navyT * 1.1))
            : 'rgb(' + BASE[0] + ',' + BASE[1] + ',' + BASE[2] + ')';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, 6.2832);
          ctx.fill();
        }
      }
    }

    function tick(now) {
      // ease pointer + strength so motion feels fluid
      pos.x += (target.x - pos.x) * 0.2;
      pos.y += (target.y - pos.y) * 0.2;
      strength += (strengthTarget - strength) * 0.12;

      ripples = ripples.filter(function (r) { return (now - r.t0) / 1000 < RIPPLE_LIFE; });
      draw(now);

      var settled = !ambient && strengthTarget === 0 && strength < 0.01 && ripples.length === 0;
      if (settled || !visible) {
        strength = settled ? 0 : strength;
        running = false;
        if (settled) draw(now);
        return;
      }
      requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) { draw(performance.now()); wake(); }
      }, { rootMargin: '100px' }).observe(section);
    } else {
      visible = true;
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(resize).observe(section);
    } else {
      window.addEventListener('resize', resize);
    }
    resize();
  }

  function init() {
    document.querySelectorAll('.bg-section:not([data-bg])').forEach(function (s) { new Grid(s); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
