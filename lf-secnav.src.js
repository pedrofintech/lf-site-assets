/* LF secnav v18: barra de seccoes sticky em mobile para artigos LiteraciaFinanceira.pt.
   Config em window.LF_SECNAV (definida no head da pagina). Servido via jsDelivr. */
(function () {
  var CFG = window.LF_SECNAV || {};
  var slug = (location.pathname.split('/').filter(Boolean).pop() || '').toLowerCase();
  var enabled = CFG.all === true || location.search.indexOf('secnav') > -1 || (CFG.slugs || []).indexOf(slug) > -1;
  if (!enabled || (CFG.exclude || []).indexOf(slug) > -1) return;
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

    var MAX = 30, SOFT = 34, MIN = 6, FULL = 38;
    function cap(t) { return t && !/^[a-z][A-Z]/.test(t) ? t.charAt(0).toUpperCase() + t.slice(1) : t; }
    /* Palavras de ligacao (PT, EN, NL, PL, ET). Um rotulo nunca acaba numa delas e,
       quando o titulo nao cabe, o corte faz-se antes da ultima, para a frase ficar inteira. */
    var LINK = {};
    ('a o as os um uma uns umas de da do das dos em no na nos nas ao aos à às e ou que com por para pela pelo pelas pelos sobre entre até sem se não mais como quando onde ' +
     'the an and or of in on at to for with without from by vs via not is are your you & ' +
     'de het een en van voor met op per je moet kun kan bij naar om te ' +
     'w we z ze i oraz lub do dla na po od przy czy ' +
     'ja ning või kas kuidas').split(' ').forEach(function (w) { LINK[w] = 1; });
    function isLink(w) { return LINK[w.toLowerCase().replace(/[.,;:]+$/, '')] === 1; }
    function trimEnd(words) {
      while (words.length > 1 && isLink(words[words.length - 1])) words.pop();
      return words.join(' ').replace(/[.,;:&\s]+$/, '');
    }
    /* Encaixa o titulo sem reticencias: corta numa virgula, senao
       antes da ultima palavra de ligacao, senao na ultima palavra que cabe. */
    function fit(t) {
      /* ate SOFT caracteres o titulo entra inteiro: a barra desliza na horizontal */
      if (t.length <= SOFT) return t;
      var ci = t.lastIndexOf(',', MAX);
      if (ci >= MIN) return trimEnd(t.slice(0, ci).split(' '));
      var words = t.split(' '), kept = [], len = 0;
      for (var i = 0; i < words.length; i++) {
        var add = (kept.length ? 1 : 0) + words[i].length;
        if (len + add > MAX) break;
        kept.push(words[i]); len += add;
      }
      if (!kept.length) return t.slice(0, MAX);
      for (var j = kept.length - 1; j > 0; j--) {
        if (!isLink(kept[j])) continue;
        var c = trimEnd(kept.slice(0, j));
        if (c.length >= MIN) return c;
        break;
      }
      return t.length <= FULL ? t : trimEnd(kept);
    }
    /* Versao curta do H2 para a barra. Regras PT + EN + NL + PL + ET, sempre ancoradas
       ao inicio ou ao fim do titulo para nao haver falsos positivos entre linguas. */
    function shorten(t) {
      t = t.replace(/[“”„"']/g, '').replace(/\s+/g, ' ').trim();
      /* parenteses: corta ai se o que fica chega para rotulo, senao tira so o parentese */
      var pi = t.indexOf('(');
      if (pi > -1) t = (pi >= 12 ? t.slice(0, pi) : t.replace(/\s*\([^)]*\)/g, '')).trim() || t;
      var c = t.split(/:|\?|\s[-–—]\s/)[0].trim();
      if (c.length > 3) t = c;
      /* prefixos PT */
      t = t.replace(/^(e|mas|afinal|então|agora)[,\s]+/i, '');
      t = t.replace(/^(o que é|o que são|quais são|qual é|como funciona|como funcionam)(\s+(uns|umas|um|uma|os|as|o|a))?\s+/i, '');
      /* prefixos EN */
      t = t.replace(/^(what is|what are|what's|who is|which are|which is)(\s+(a|an|the))?\s+/i, '');
      t = t.replace(/^(how to|how does|how do|how can|should you|should i|is it|why)(\s+(a|an|the|i|you|we|it))?\s+/i, '');
      t = t.replace(/\s+work$/i, '');
      /* prefixos ET */
      t = t.replace(/^(mis on|millised on|milline on|mida|kes on|kuidas|miks|kas)\s+/i, '');
      /* artigos iniciais PT/EN (e NL nas paginas em neerlandes) */
      t = t.replace(/^(os|as|o|a|an|the)\s+/i, '');
      if (/^nl/i.test(document.documentElement.lang || '')) t = t.replace(/^(de|het|een)\s+/i, '');
      /* sufixos: ano e local, primeiro o ano sempre, o local so se ainda for longo */
      t = t.replace(/\s+(em|in|aastal|w)\s+20\d\d$/i, '').replace(/\s+20\d\d\.?\s*aastal$/i, '').replace(/\s+20\d\d$/, '');
      if (t.length > MAX) {
        t = t.replace(/\s+(em|no|na)\s+portugal$/i, '')
             .replace(/\s+in\s+(the\s+)?(uae|dubai|abu dhabi|europe|europa|eu|estonia|portugal|brazil|netherlands|nederland|poland|uk)$/i, '')
             .replace(/\s+(eestis|eesti|euroopas)$/i, '')
             .replace(/\s+w\s+(polsce|europie)$/i, '')
             .replace(/\s+no\s+brasil$/i, '');
      }
      /* conector + marca no fim (PT/EN): tira o conector, e se ainda for longo, a marca */
      var brand = /\s+(da|do|na|no|de|com a|com o|pela|pelo|with|at|on|for|from|of|via)\s+([A-Za-z][\w.&-]*(?:\s(?:212|Bank|Markets|Brokers|Republic|Invest|Investing|Broker))?)$/;
      if (t.length > MAX && brand.test(t)) {
        var t2 = t.replace(brand, ' $2');
        t = t2.length <= MAX ? t2 : t.replace(brand, '');
      }
      t = t.replace(/\s+(vs\.?|and|e|ja)$/i, '').trim().replace(/[.,;]+$/, '');
      t = fit(t);
      return cap(t) || 'Secção';
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
    /* Labels escritas a mao no CMS (campo "Labels menu mobile"), ligadas ao texto do H2
       e nao a posicao: "Titulo do H2 => Label | Titulo do H2 => Label". O template expoe
       o campo em <div id="lf-secnav-labels" hidden>...</div>. Um H2 sem label no CMS
       usa a lista por slug (CFG.labels) e, por fim, a regra automatica. */
    function key(s) {
      s = (s || '').toLowerCase();
      if (s.normalize) s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return s.replace(/[^a-z0-9]+/g, ' ').trim();
    }
    var cms = {}, cmsEl = document.getElementById('lf-secnav-labels');
    if (cmsEl) {
      (cmsEl.getAttribute('data-labels') || cmsEl.textContent || '').split(/\s*\|\s*|\r?\n/).forEach(function (p) {
        var i = p.indexOf('=>');
        if (i < 1) return;
        var k = key(p.slice(0, i)), v = p.slice(i + 2).replace(/\s+/g, ' ').trim();
        if (k && v) cms[k] = v;
      });
    }
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
      a.textContent = cms[key(text)] || manual[i] || shorten(text);
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
      /* menuVisible() le o layout (getComputedStyle + getBoundingClientRect).
         Agendar por frame evita repetir a leitura a cada mutacao da animacao. */
      var checkAgendado = false;
      function agendarCheck() {
        if (checkAgendado) return;
        checkAgendado = true;
        window.requestAnimationFrame(function () { checkAgendado = false; checkMenu(); });
      }
      if (window.MutationObserver) {
        new MutationObserver(agendarCheck).observe(nav, { attributes: true, subtree: true, attributeFilter: ['class', 'style', 'data-nav-menu-open'] });
      }
      nav.addEventListener('click', function () {
        setTimeout(checkMenu, 50); setTimeout(checkMenu, 350); setTimeout(checkMenu, 800);
      }, true);
      /* O menu abre com transicao: o fim dela e o momento certo para reavaliar.
         Substitui o setInterval(700) que corria para sempre, mesmo com o menu
         fechado e a pagina parada, e lia o layout em cada volta. */
      ['transitionend', 'animationend'].forEach(function (ev) {
        nav.addEventListener(ev, agendarCheck, { passive: true });
      });
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
