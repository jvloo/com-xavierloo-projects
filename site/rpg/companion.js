(function () {
  'use strict';
  var root = document.documentElement;
  if (root.getAttribute('data-skin') !== 'rpg') return;

  var script = document.currentScript;
  var SPRITE = (script && script.getAttribute('data-sprite')) ||
    (script && script.src ? script.src.replace(/companion[^\/]*\.js.*$/, 'companions.svg') : '/rpg/companions.svg');
  var KEY = 'projects.motion';
  var CHAPTERS = [
    ['intro', 'Start', '.intro-card', 'trav-idle'],
    ['featured', 'Spotlight', '.featured-hero', 'trav-idle'],
    ['built', 'Built', '[data-section="built"]', 'pose-built'],
    ['contributions', 'Relay', '[data-section="contributions"]', 'pose-contrib'],
    ['side', 'Map', '[data-section="side"]', 'pose-side'],
    ['opensource', 'Open', '[data-section="opensource"]', 'pose-opensource'],
    ['experiments', 'Arcade', '[data-section="experiments"]', 'pose-experiments'],
    ['earlier', 'Archive', '[data-section="earlier"]', 'pose-earlier']
  ];
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function ref(id) { return SPRITE + '#cp-' + id; }
  function art(id, w, h, cls) {
    return '<svg class="cp-svg ' + (cls || '') + '" width="' + w + '" height="' + h +
      '" viewBox="0 0 ' + (w === h ? '24 24' : id.indexOf('drone') > -1 ? '16 12' : '40 56') +
      '" aria-hidden="true" focusable="false" shape-rendering="crispEdges"><use href="' + ref(id) + '"></use></svg>';
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  }
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* ignore */ } }

  var userPaused = stored() === 'paused';
  var dialogOpen = false;
  function paused() { return mqReduce.matches || userPaused || dialogOpen; }

  /* motion button */
  var btn = el('button', 'cp-motion',
    '<svg class="cp-svg cp-i-pause" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="currentColor"><path d="M3 2h4v12H3zM9 2h4v12H9z"/></svg>' +
    '<svg class="cp-svg cp-i-play" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="currentColor"><path d="M4 2h2v12H4zM6 3h2v10H6zM8 4h2v8H8zM10 5h2v6h-2zM12 6h2v4h-2z"/></svg>');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Pause animations');
  var actions = document.querySelector('.masthead-actions');
  var links = actions && actions.querySelector('.header-links');
  if (links && links.parentNode) links.parentNode.insertBefore(btn, links);
  else if (actions) actions.appendChild(btn);
  btn.addEventListener('click', function () {
    if (mqReduce.matches) return;
    userPaused = !userPaused;
    store(userPaused ? 'paused' : 'running');
    applyMotion();
  });

  /* dock + mini */
  var dock = el('div', 'cp-dock',
    '<div class="cp-rail"></div><div class="cp-nodes"></div>' +
    '<div class="cp-walker"><div class="cp-drone">' + art('drone', 24, 18) + '</div>' +
    '<div class="cp-hero"><div class="cp-flip">' + art('trav-idle', 48, 67) + '</div></div>' +
    '<div class="cp-label"></div></div>');
  dock.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dock);
  var rail = dock.querySelector('.cp-rail');
  var nodesBox = dock.querySelector('.cp-nodes');
  var walker = dock.querySelector('.cp-walker');
  var label = dock.querySelector('.cp-label');
  var dockUse = dock.querySelector('.cp-hero use');

  var mini = el('span', 'cp-mini', art('trav-idle', 28, 39));
  mini.setAttribute('aria-hidden', 'true');
  mini.setAttribute('data-companion-mini', '');
  var tools = document.querySelector('.browse-bar');
  if (tools) tools.insertBefore(mini, tools.firstChild);
  var miniUse = mini.querySelector('use');

  /* chapter props */
  var propIds = { built: 'built', contributions: 'contrib', side: 'side', opensource: 'opensource', experiments: 'experiments', earlier: 'earlier' };
  var targets = CHAPTERS.map(function (c) {
    var node = el('i', 'cp-node');
    node.hidden = true;
    nodesBox.appendChild(node);
    var e = document.querySelector(c[2]);
    if (e && propIds[c[0]]) {
      var head = e.querySelector('.section-head');
      if (head && !head.querySelector('.cp-prop')) {
        var p = el('span', 'cp-prop', art('prop-' + propIds[c[0]], 24, 24));
        p.setAttribute('aria-hidden', 'true');
        head.appendChild(p);
      }
    }
    return { key: c[0], label: c[1], pose: c[3], el: e, node: node };
  }).filter(function (t) { return t.el; });

  /* state */
  var raf = 0, settleT = 0, stepT = 0, stepFrame = 0;
  var active = -1, pose = 'trav-idle', moving = false, lastY = window.pageYOffset, left = false;
  var sig = '', railTop = 0, railH = 0;

  function setHref(id) {
    var h = ref(id);
    dockUse.setAttribute('href', h);
    miniUse.setAttribute('href', h);
  }
  function setMoving(m) {
    if (m === moving) return;
    moving = m;
    dock.classList.toggle('cp-moving', m);
    mini.classList.toggle('cp-moving', m);
    clearInterval(stepT);
    if (m) {
      stepT = setInterval(function () {
        stepFrame ^= 1;
        setHref(stepFrame ? 'trav-stepa' : 'trav-stepb');
      }, 150);
    } else {
      setHref(pose);
    }
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(frame); }

  function frame() {
    raf = 0;
    var vh = window.innerHeight, line = vh * 0.38, i;
    var rects = [], vis = [];
    for (i = 0; i < targets.length && i < 8; i++) rects.push(targets[i].el.getBoundingClientRect());
    var y = window.pageYOffset;
    var atEnd = y + vh >= document.documentElement.scrollHeight - 120;
    for (i = 0; i < targets.length && i < 8; i++) {
      if (rects[i].height > 0) vis.push({ t: targets[i], top: rects[i].top, h: rects[i].height });
    }

    /* writes */
    var s = vis.map(function (v) { return v.t.key; }).join();
    var n = vis.length;
    var span = Math.max(160, Math.min(420, vh - 340));
    if (s !== sig || railH !== span) {
      sig = s; railTop = 120; railH = span;
      rail.style.top = railTop + 'px';
      rail.style.height = span + 'px';
      targets.forEach(function (t) { t.node.hidden = true; });
      vis.forEach(function (v, k) {
        v.t.node.hidden = false;
        v.t.node.style.transform = 'translateY(' + Math.round(railTop + (n > 1 ? k / (n - 1) : 0) * span) + 'px)';
      });
      active = -1;
    }
    if (!n) { dock.classList.remove('cp-on'); return; }

    function pick(ln) {
      var c = 0;
      for (var k = 0; k < n; k++) if (vis[k].top <= ln) c = k;
      return c;
    }
    var cand = pick(line);
    if (atEnd) cand = n - 1;
    var prev = active;
    if (active < 0 || active >= n) active = cand;
    else if (cand !== active && pick(line + (cand > active ? 24 : -24)) === cand) active = cand;

    var gate = vis[Math.min(1, n - 1)];
    var show = gate.top < vh * 0.8 && y + vh < document.documentElement.scrollHeight - 120;
    dock.classList.toggle('cp-on', show);

    var cur = vis[active];
    var prog = Math.max(0, Math.min(1, (line - cur.top) / cur.h));
    var frac = n > 1 ? Math.min(1, (active + prog * 0.8) / (n - 1)) : 0;
    var wy = paused() ? Math.round(vh * 0.28) : Math.round(railTop + frac * span - 34);
    walker.style.transform = 'translate3d(0,' + wy + 'px,0)';

    if (active !== prev) {
      label.textContent = cur.t.label;
      targets.forEach(function (t) { t.node.classList.toggle('cp-cur', t === cur.t); });
      pose = cur.t.pose;
      if (!moving) setHref(pose);
    }

    var dy = y - lastY;
    lastY = y;
    if (dy) {
      var l = dy < 0;
      if (l !== left) { left = l; dock.classList.toggle('cp-left', l); }
      if (!paused()) {
        setMoving(true);
        clearTimeout(settleT);
        settleT = setTimeout(function () { setMoving(false); }, 180);
      }
    }
  }

  function applyMotion() {
    var p = paused();
    root.classList.toggle('world-paused', p);
    btn.setAttribute('aria-pressed', userPaused || mqReduce.matches ? 'true' : 'false');
    btn.setAttribute('aria-disabled', mqReduce.matches ? 'true' : 'false');
    btn.title = mqReduce.matches ? 'Animations are off (system reduced-motion setting)' :
      userPaused ? 'Resume animations' : 'Pause animations';
    if (p) {
      clearTimeout(settleT);
      setMoving(false);
    }
    schedule();
  }

  function checkDialogs() {
    var o = !!document.querySelector('dialog[open]');
    if (o !== dialogOpen) { dialogOpen = o; applyMotion(); }
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', function () { sig = ''; schedule(); });
  window.addEventListener('pageshow', schedule);
  document.addEventListener('directory:updated', function () { sig = ''; schedule(); });
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(document.body);
  if (window.MutationObserver) {
    new MutationObserver(checkDialogs).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
  }
  document.addEventListener('close', checkDialogs, true);
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', applyMotion);
  else if (mqReduce.addListener) mqReduce.addListener(applyMotion);

  checkDialogs();
  applyMotion();
}());
