/* LF secnav v14: barra de seccoes sticky em mobile para artigos LiteraciaFinanceira.pt.
   Config em window.LF_SECNAV (definida no head da pagina). Servido via jsDelivr. */
(function () {
  var CFG = window.LF_SECNAV || {};
  var slug = (location.pathname.split('/').filter(Boolean).pop() || '').toLowerCase();
  if (location.search.indexOf('secnav') === -1 && (CFG.slugs || []).indexOf(slug) === -1) return;
  if (!window.matchMedia || !window.matchMedia('(max-width: 991px)').matches) return;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var rt = document.querySelector('.text-rich-text.is-artigo');
    if (!rt) return;
    var h2s = Array.prototype.slice.call(rt.querySelectorAll('h2'));
    if (h2s.length < 3) return;

    var GAP = 20;

    function shorten(t) {
      t = t.replace(/\s+/g, ' ').trim();
      var c = t.split(/[:?(]/)[0].trim();
      if (c.length > 3) t = c;
      if (t.length <= 24) return t;
      var s = t.slice(0, 24), p = s.lastIndexOf(' ');
      if (p > 10) s = s.slice(0, p);
      return s.trim() + '\u2026';
    }

    /* ---------- navbar (fixa-se ao fazer scroll) ---------- */
    var nav = document.querySelector('.w-nav'), navFix = false, navH = 0, navTop = 0, ph = null, pinned = false, navBg = false, padL = 16;
    if (nav) {
      var ncs = window.getComputedStyle(nav);
      navFix = ncs.position === 'fixed' || ncs.position === 'sticky';
      if (!navFix) {
        ph = document.createElement('div');
        ph.style.height = '0px';
        nav.parentNode.insertBefore(ph, nav);
        var bg = ncs.backgroundColor;
        navBg = !bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)';
      }
    }
    function pin(on) {
      if (!nav || navFix || on === pinned) return;
      pinned = on;
      var s = nav.style;
      if (on) {
        ph.style.height = navH + 'px';
        s.position = 'fixed'; s.top = '0'; s.left = '0'; s.right = '0'; s.width = '100%'; s.zIndex = '950';
        if (navBg) s.background = '#fff';
      } else {
        ph.style.height = '0px';
        s.position = ''; s.top = ''; s.left = ''; s.right = ''; s.width = ''; s.zIndex = ''; s.background = '';
      }
    }
    function navBottom() {
      if (!nav) return 0;
      if (navFix) { var b = nav.getBoundingClientRect().bottom; return b > 0 && b < 200 ? b : 0; }
      return pinned ? navH : 0;
    }

    /* ---------- barra: vive no fluxo antes do artigo, fixa-se ao passar ---------- */
    var slot = document.createElement('div');
    slot.className = 'lf-secnav_slot';
    var bar = document.createElement('nav');
    bar.className = 'lf-secnav';
    bar.setAttribute('aria-label', 'Secções do artigo');
    var track = document.createElement('div');
    track.className = 'lf-secnav_track';
    bar.appendChild(track);
    var fade = document.createElement('div');
    fade.className = 'lf-secnav_fade';
    bar.appendChild(fade);
    slot.appendChild(bar);
    rt.parentNode.insertBefore(slot, rt);

    var manual = (CFG.labels || {})[slug] || [];
    h2s.forEach(function (h, i) {
      var text = (h.textContent || '').trim() || 'Secção ' + (i + 1);
      var base = text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || 'secao';
      var id = base, n = 1;
      while (document.getElementById(id)) id = base + '-' + n++;
      h.id = id;
      /* Sem href: o webflow.js apanha cliques em a[href^="#"] e faz o seu proprio scroll animado. */
      var a = document.createElement('a');
      a.className = 'lf-secnav_tab';
      a.setAttribute('role', 'button');
      a.setAttribute('tabindex', '0');
      a.textContent = manual[i] || shorten(text);
      a.__h = h;
      track.appendChild(a);
    });
    var pills = Array.prototype.slice.call(track.querySelectorAll('a'));

    var tops = [], slotTop = 0, rtBot = 0, barH = 36, fixed = false, idxOld = -1, tick = false;

    function measure() {
      var y = window.pageYOffset;
      if (nav) {
        if (!navFix && !pinned) navTop = nav.getBoundingClientRect().top + y;
        navH = nav.offsetHeight || navH;
        var brand = nav.querySelector('.w-nav-brand') || nav.querySelector('a,img');
        if (brand) { var pl = Math.round(brand.getBoundingClientRect().left); if (pl >= 8 && pl <= 80) padL = pl; }
      }
      if (!fixed) { barH = bar.offsetHeight || barH; slot.style.height = barH + 'px'; }
      slotTop = slot.getBoundingClientRect().top + y;
      tops = pills.map(function (p) { return p.__h.getBoundingClientRect().top + y; });
      rtBot = rt.getBoundingClientRect().bottom + y;
      try { document.documentElement.style.setProperty('--lf-secnav-off', (navH + barH + GAP) + 'px'); } catch (err) {}
    }
    function setFixed(on, top) {
      if (on) {
        bar.style.top = top + 'px';
        track.style.paddingLeft = padL + 'px';
        track.style.paddingRight = padL + 'px';
      }
      if (on === fixed) return;
      fixed = on;
      bar.classList.toggle('is-fixed', on);
      if (!on) { bar.style.top = ''; track.style.paddingLeft = ''; track.style.paddingRight = ''; }
    }
    function barBot() {
      var b = bar.getBoundingClientRect().bottom;
      return b > 0 ? b : navBottom() + barH;
    }
    function reveal(p, now) {
      /* centra o item ativo; nos extremos o browser limita ao inicio/fim */
      var l = Math.max(0, Math.round(p.offsetLeft + p.offsetWidth / 2 - track.clientWidth / 2));
      try { track.scrollTo({ left: l, behavior: now ? 'auto' : 'smooth' }); }
      catch (err) { track.scrollLeft = l; }
    }

    function frame() {
      tick = false;
      var y = window.pageYOffset;
      if (nav && !navFix) pin(y > navTop + 4);
      var off = navBottom();
      setFixed(y + off >= slotTop && y < rtBot - 120, off);
      var line = y + barBot() + GAP + 6, idx = 0;
      for (var i = 0; i < tops.length; i++) { if (tops[i] <= line) idx = i; else break; }
      if (y + off < slotTop) idx = 0;
      if (idx !== idxOld) {
        if (pills[idxOld]) pills[idxOld].classList.remove('is-active');
        pills[idx].classList.add('is-active');
        reveal(pills[idx], idxOld === -1);
        idxOld = idx;
      }
    }
    function onScroll() {
      if (!tick) { tick = true; window.requestAnimationFrame(frame); }
    }

    /* ---------- clique: salto instantaneo + assentamento curto ---------- */
    var settleH = null, settleUntil = 0, armH = null, armUntil = 0;
    function jumpTo(y) {
      try { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); }
      catch (err) { window.scrollTo(0, y); }
    }
    function targetY(h) {
      measure();
      var y = window.pageYOffset;
      var off = navBottom();
      /* depois do salto a barra estara fixa: usa a altura, nao a posicao atual */
      var bb = (y + off >= slotTop) ? barBot() : off + barH;
      return Math.max(0, Math.round(h.getBoundingClientRect().top + y - bb - GAP));
    }
    function settle() {
      if (!settleH) return;
      var want = barBot() + GAP;
      var diff = Math.round(settleH.getBoundingClientRect().top - want);
      if (Math.abs(diff) > 2) jumpTo(window.pageYOffset + diff);
      frame();
      if (Date.now() < settleUntil) { window.requestAnimationFrame(settle); return; }
      document.documentElement.classList.remove('lf-nosmooth');
      settleH = null;
    }
    function rearm() {
      if (!armH || Date.now() > armUntil) return;
      settleH = armH; settleUntil = Date.now() + 250;
      document.documentElement.classList.add('lf-nosmooth');
      window.requestAnimationFrame(settle);
    }
    function go(link) {
      document.documentElement.classList.add('lf-nosmooth');
      var y = targetY(link.__h);
      jumpTo(y);
      frame();
      /* a barra acabou de ficar fixa: recalcula ja com a posicao real */
      jumpTo(targetY(link.__h));
      frame();
      settleH = link.__h; settleUntil = Date.now() + 600;
      armH = link.__h; armUntil = Date.now() + 2000;
      window.requestAnimationFrame(settle);
    }
    track.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('.lf-secnav_tab') : null;
      if (!link || !link.__h) return;
      e.preventDefault(); e.stopPropagation();
      go(link);
    });
    track.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var link = e.target.closest ? e.target.closest('.lf-secnav_tab') : null;
      if (!link || !link.__h) return;
      e.preventDefault();
      go(link);
    });
    ['touchstart', 'wheel'].forEach(function (ev) {
      window.addEventListener(ev, function () { settleH = null; armH = null; document.documentElement.classList.remove('lf-nosmooth'); }, { passive: true });
    });
    window.addEventListener('resize', rearm, { passive: true });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', rearm, { passive: true });

    /* ---------- menu mobile aberto: esconder a barra ----------
       A navbar da LF usa um bloco .nav_menu com interacao propria (sem w--open),
       por isso verificamos se o menu esta de facto visivel no ecra. */
    if (nav) {
      var menuEl = nav.querySelector('.nav_menu') || nav.querySelector('.w-nav-menu');
      var menuOpen = false;
      function menuVisible() {
        if (nav.querySelector('.w-nav-button.w--open')) return true;
        if (!menuEl) return false;
        var cs = window.getComputedStyle(menuEl);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
        var r = menuEl.getBoundingClientRect();
        return r.height > 40 && r.width > 40 && r.top < window.innerHeight && r.bottom > 0;
      }
      function checkMenu() {
        var open = menuVisible();
        if (open !== menuOpen) { menuOpen = open; bar.classList.toggle('is-hidden', open); }
      }
      if (window.MutationObserver) {
        new MutationObserver(checkMenu).observe(nav, { attributes: true, subtree: true, attributeFilter: ['class', 'style', 'data-nav-menu-open'] });
      }
      nav.addEventListener('click', function () {
        setTimeout(checkMenu, 50); setTimeout(checkMenu, 350); setTimeout(checkMenu, 800);
      }, true);
      setInterval(checkMenu, 700);
    }

    /* ---------- arranque ---------- */
    measure();
    frame();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { measure(); onScroll(); }, { passive: true });
    window.addEventListener('orientationchange', function () { setTimeout(function () { measure(); onScroll(); }, 250); });
    window.addEventListener('load', function () { measure(); onScroll(); });
    setTimeout(function () { measure(); onScroll(); }, 900);
    setTimeout(function () { measure(); onScroll(); }, 2500);
    if (window.ResizeObserver) new ResizeObserver(function () { measure(); onScroll(); }).observe(rt);
  });
})();
