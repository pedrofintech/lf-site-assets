/* lf-ic-embed.js v1.0.0 - Literacia Financeira
   Início de simulação de crédito habitação a meio dos artigos: só inputs, sem resultados.
   O botão abre o formulário do intermediário com as respostas na URL, para não as pedir outra vez.
   Parceiro: mesma regra do A/B do site (?ab=, window.LFAB.v, localStorage lf_ab_ch, sorteio 50-50).
   No artigo dos melhores intermediários é sempre o Balcão do Crédito. */
(function () {
  var m = location.pathname.match(/^\/artigos\/([^/]+)\/?$/);
  if (!m) return;
  var slug = m[1];

  var ARTIGOS = {
    'melhores-intermediarios-credito-portugal': { partner: 'balcao', link: true, h2: 3 },
    'melhor-banco-para-credito-habitacao': {},
    'melhor-credito-habitacao': {},
    'transferir-credito-habitacao': { tipo: 'transferencia' },
    'spread-credito-habitacao': {},
    'taxa-fixa-variavel-ou-mista': {},
    'credito-habitacao': {},
    'credito-habitacao-jovem': {},
    'aprovacao-credito-habitacao': {},
    'taxa-de-esforco-maxima': {},
    'idade-maxima-credito-habitacao': {},
    'quanto-custa-comprar-casa': {},
    'credito-para-obras': {},
    'comprar-segunda-habitacao': {}
  };
  var CFG = window.LF_IC_CFG || {};
  var conf = (CFG.artigos && CFG.artigos[slug]) || ARTIGOS[slug];
  if (!conf) return;

  var TIPOS = {
    compra: { label: 'Comprar casa', f1: ['valor_imovel', 'Valor do imóvel a adquirir', '250.000'], f2: ['valor_credito', 'Valor do crédito', '200.000'],
      hint: 'O valor do crédito é o valor da casa menos a entrada.', resumo: 'Imóvel e crédito' },
    transferencia: { label: 'Transferir crédito', f1: ['valor_imovel', 'Valor atual da casa', '250.000'], f2: ['capital_divida', 'Capital em dívida', '120.000'],
      hint: 'O capital em dívida está no extrato do crédito. Se não souberes ao certo, mete um valor aproximado.', resumo: 'Casa e dívida' }
  };

  var P = {
    balcao: {
      nome: 'Balcão do Crédito',
      logo: 'https://cdn.prod.website-files.com/67922c46c9da6bf5d9bfdf09/6ab3dd9f0dcbc1c5129bb44a_logo-balcao-do-credito.svg',
      url: 'https://balcaodocredito.pt/pedido',
      legal: 'Meridiano Feliz, intermediário de crédito vinculado, registado no Banco de Portugal com o n.º 0006480. Parceiro do Literacia Financeira.'
    },
    credivel: {
      nome: 'Credível',
      logo: 'https://cdn.prod.website-files.com/67922c46c9da6bf5d9bfdf09/6ab525960ca382528b0b9ee7_logo-credivel.png',
      url: 'https://forms.gle/vnCS3CgHEBnUadH8A',
      legal: 'Credível - Intermediação de Crédito, Unipessoal Lda, intermediário de crédito vinculado, registado no Banco de Portugal com o n.º 2663. Parceiro do Literacia Financeira.',
      /* Pré-preenchimento do Google Form: { url: 'https://docs.google.com/forms/d/e/.../viewform', campos: { tipo: 'entry.1', valor_imovel: 'entry.2', ... }, opcoes: { compra: 'Texto exato da opção', transferencia: '...' } } */
      prefill: null
    }
  };
  if (CFG.credivel_prefill) P.credivel.prefill = CFG.credivel_prefill;

  var SETA = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CADEADO = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" stroke-width="1.6"/></svg>';

  var CSS = [
    '.lfic{box-sizing:border-box;margin:2rem 0;font-family:inherit;line-height:1.4;letter-spacing:-.01em;text-align:left}',
    '.lfic *,.lfic *::before,.lfic *::after{box-sizing:border-box}',
    '.lfic .lfic__top{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin:0 0 1.25rem}',
    '.lfic img.lfic__logo{display:block;width:auto;margin:0;border:0;max-width:62%}',
    '.lfic .lfic__tag{flex:none;font-size:.75rem;line-height:1.2;font-weight:500;border-radius:.375rem;padding:.25rem .5rem;white-space:nowrap}',
    '.lfic h3.lfic__q,.lfic h3.lfic__title{font-family:inherit;margin:0}',
    '.lfic .lfic__opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem;margin:0}',
    '.lfic button.lfic__opt{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin:0;font:inherit;font-size:1rem;font-weight:500;text-align:left;cursor:pointer;background:#fff;transition:border-color .15s,background .15s,color .15s}',
    '.lfic .lfic__dot{width:1.125rem;height:1.125rem;flex:none;border-radius:50%;display:inline-flex;align-items:center;justify-content:center}',
    '.lfic .lfic__fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin:0}',
    '.lfic .lfic__field{display:flex;flex-direction:column;gap:.5rem;margin:0}',
    '.lfic label.lfic__label{display:block;margin:0;font-size:1rem;font-weight:500}',
    '.lfic .lfic__wrap{position:relative}',
    '.lfic input.lfic__input{display:block;width:100%;margin:0;padding:0 2.5rem 0 1rem;font:inherit;font-size:1.125rem;font-weight:500;outline:none;-webkit-appearance:none;appearance:none;box-shadow:none;transition:border-color .15s,background .15s,box-shadow .15s}',
    '.lfic .lfic__unit{position:absolute;right:1rem;top:50%;transform:translateY(-50%);font-size:1.0625rem;font-weight:600;pointer-events:none}',
    '.lfic a.lfic__btn{text-decoration:none !important;cursor:pointer}',
    '.lfic a.lfic__btn svg{width:1.125rem;height:1.125rem;flex:none}',
    '@media (prefers-reduced-motion:reduce){.lfic *{transition:none !important}}',
    /* Balcão do Crédito */
    '.lfic--balcao{--k:#1c1917;--k2:#57534e;--k3:#78716c;--ln:#e7e5e4;--gold:#c9a45c;--cr:#fdf3e7;--cr2:#fdf8f2;display:grid;grid-template-columns:minmax(0,1fr) 15rem;border:1px solid var(--ln);border-radius:1.25rem;overflow:hidden;background:#fff;color:var(--k)}',
    '.lfic--balcao .lfic__main{padding:1.5rem 1.5rem 1.75rem;min-width:0}',
    '.lfic--balcao img.lfic__logo{height:1.5rem}',
    '.lfic--balcao .lfic__tag{color:var(--k3);border:1px solid var(--ln)}',
    '.lfic--balcao p.lfic__step{margin:0 0 .5rem;font-size:.75rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--k2)}',
    '.lfic--balcao h3.lfic__q{margin:0 0 1rem;font-size:1.75rem;line-height:1.15;font-weight:600;letter-spacing:-.03em;color:var(--k)}',
    '.lfic--balcao h3.lfic__q.is-2{margin-top:1.5rem}',
    '.lfic--balcao button.lfic__opt{padding:.875rem 1rem;border:1.5px solid var(--ln);border-radius:.875rem;color:var(--k)}',
    '.lfic--balcao button.lfic__opt:hover{border-color:var(--k3)}',
    '.lfic--balcao button.lfic__opt.is-on{border:2px solid var(--k);padding:calc(.875rem - .5px) calc(1rem - .5px)}',
    '.lfic--balcao .lfic__dot{border:1.5px solid var(--ln)}',
    '.lfic--balcao button.lfic__opt.is-on .lfic__dot{border-color:var(--gold);background:var(--gold)}',
    '.lfic--balcao button.lfic__opt.is-on .lfic__dot::after{content:"";width:.375rem;height:.375rem;border-radius:50%;background:#fff}',
    '.lfic--balcao button.lfic__opt:focus-visible{outline:2px solid var(--gold);outline-offset:2px}',
    '.lfic--balcao label.lfic__label{color:var(--k)}',
    '.lfic--balcao input.lfic__input{height:3.5rem;border:1.5px solid var(--ln);border-radius:.875rem;background:var(--cr2);color:var(--k)}',
    '.lfic--balcao input.lfic__input::placeholder{color:#a8a29e;opacity:1;font-weight:400}',
    '.lfic--balcao input.lfic__input:focus{border:2px solid var(--k);background:#fff;padding-left:calc(1rem - .5px)}',
    '.lfic--balcao .lfic__unit{color:var(--k)}',
    '.lfic--balcao div.lfic__hint{margin:1rem 0 0;padding:.875rem 1rem;border-radius:.875rem;background:var(--cr);font-size:.9375rem;line-height:1.4;color:var(--k)}',
    '.lfic--balcao .lfic__actions{display:flex;align-items:center;flex-wrap:wrap;gap:1rem 1.25rem;margin:1.5rem 0 0}',
    '.lfic--balcao a.lfic__btn{display:inline-flex;align-items:center;gap:1.25rem;padding:.375rem .375rem .375rem 1.5rem;border-radius:999px;background:var(--k);color:#fff !important;font-size:.875rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;transition:background .2s}',
    '.lfic--balcao a.lfic__btn:hover{background:#000}',
    '.lfic--balcao a.lfic__btn:focus-visible{outline:3px solid var(--gold);outline-offset:2px}',
    '.lfic--balcao .lfic__arrow{width:2.5rem;height:2.5rem;border-radius:50%;background:var(--gold);color:var(--k);display:inline-flex;align-items:center;justify-content:center;flex:none}',
    '.lfic--balcao .lfic__free{display:inline-flex;align-items:center;gap:.5rem;font-size:.875rem;color:var(--k2)}',
    '.lfic--balcao .lfic__free svg{width:1rem;height:1rem;flex:none;color:var(--gold)}',
    '.lfic--balcao .lfic__side{background:var(--k);color:#fff;padding:1.5rem 1.25rem;display:flex;flex-direction:column;gap:1.25rem}',
    '.lfic--balcao p.lfic__side-title{margin:0;color:#fff;font-size:1.25rem;font-weight:600;letter-spacing:-.02em;line-height:1.2}',
    '.lfic--balcao ol.lfic__steps{margin:0;padding:0;list-style:none;display:flex;flex-direction:column}',
    '.lfic--balcao ol.lfic__steps li{margin:0;padding:.875rem 0;display:flex;gap:.75rem;border-bottom:1px solid #3a3733}',
    '.lfic--balcao ol.lfic__steps li::before,.lfic--balcao ol.lfic__steps li::marker{content:none}',
    '.lfic--balcao ol.lfic__steps li:first-child{padding-top:0}',
    '.lfic--balcao .lfic__num{width:1.75rem;height:1.75rem;flex:none;border-radius:50%;border:1.5px solid var(--gold);color:var(--gold);display:inline-flex;align-items:center;justify-content:center;font-size:.8125rem;font-weight:600}',
    '.lfic--balcao ol.lfic__steps small{display:block;font-size:.8125rem;line-height:1.3;color:#a8a29e}',
    '.lfic--balcao ol.lfic__steps b{display:block;margin-top:.125rem;font-size:.9375rem;font-weight:600;line-height:1.3;color:#fff;word-break:break-word}',
    '.lfic--balcao ol.lfic__steps b.is-empty{color:#78716c;font-weight:500}',
    '.lfic--balcao p.lfic__legal{margin:auto 0 0;font-size:.75rem;line-height:1.45;color:#a8a29e}',
    '.lfic--balcao p.lfic__legal-m{display:none;margin:1rem 0 0;font-size:.75rem;line-height:1.45;color:var(--k3)}',
    '@media (max-width:720px){.lfic--balcao{grid-template-columns:1fr;margin:1.5rem 0}.lfic--balcao .lfic__side{display:none}.lfic--balcao .lfic__main{padding:1.125rem 1.125rem 1.25rem}.lfic--balcao .lfic__opts,.lfic--balcao .lfic__fields{grid-template-columns:1fr}.lfic--balcao h3.lfic__q{font-size:1.375rem}.lfic--balcao .lfic__actions{flex-direction:column;align-items:stretch}.lfic--balcao a.lfic__btn{justify-content:space-between}.lfic--balcao p.lfic__legal-m{display:block}}',
    /* Credível */
    '.lfic--credivel{--nv:#134e7c;--nv2:#3d6a90;--or:#f28b3d;--or2:#e27623;--ln:#d8e1ea;--bg:#f5f8fb;padding:1.5rem;border:1px solid var(--ln);border-radius:1.25rem;background:#fff;color:var(--nv)}',
    '.lfic--credivel img.lfic__logo{height:2.5rem}',
    '.lfic--credivel .lfic__tag{color:var(--nv2);background:var(--bg)}',
    '.lfic--credivel h3.lfic__title{margin:0 0 .25rem;font-size:1.5rem;line-height:1.2;font-weight:700;letter-spacing:-.02em;color:var(--nv)}',
    '.lfic--credivel p.lfic__sub{margin:0 0 1.25rem;font-size:.9375rem;line-height:1.4;color:var(--nv2)}',
    '.lfic--credivel p.lfic__plabel{margin:0 0 .5rem;font-size:1rem;font-weight:600;color:var(--nv)}',
    '.lfic--credivel .lfic__opts{margin:0 0 1.25rem}',
    '.lfic--credivel button.lfic__opt{justify-content:center;padding:.75rem 1rem;border:1.5px solid var(--ln);border-radius:999px;color:var(--nv)}',
    '.lfic--credivel button.lfic__opt:hover{border-color:var(--nv2)}',
    '.lfic--credivel button.lfic__opt.is-on{border-color:var(--nv);background:var(--nv);color:#fff}',
    '.lfic--credivel button.lfic__opt .lfic__dot{display:none}',
    '.lfic--credivel button.lfic__opt:focus-visible{outline:2px solid var(--or);outline-offset:2px}',
    '.lfic--credivel label.lfic__label{font-weight:600;color:var(--nv)}',
    '.lfic--credivel input.lfic__input{height:3.25rem;border:1.5px solid var(--ln);border-radius:.875rem;background:var(--bg);color:var(--nv)}',
    '.lfic--credivel input.lfic__input::placeholder{color:#9fb1c3;opacity:1;font-weight:400}',
    '.lfic--credivel input.lfic__input:focus{border-color:var(--nv);background:#fff;box-shadow:0 0 0 4px rgba(19,78,124,.12)}',
    '.lfic--credivel .lfic__unit{color:var(--nv)}',
    '.lfic--credivel p.lfic__help{margin:.75rem 0 1.25rem;font-size:.875rem;line-height:1.4;color:var(--nv2)}',
    '.lfic--credivel a.lfic__btn{display:flex;width:100%;align-items:center;justify-content:center;gap:.5rem;padding:.875rem 1.25rem;border-radius:999px;background:var(--or);color:#fff !important;font-size:1.0625rem;font-weight:700;transition:background .2s}',
    '.lfic--credivel a.lfic__btn:hover{background:var(--or2)}',
    '.lfic--credivel a.lfic__btn:focus-visible{outline:3px solid var(--nv);outline-offset:2px}',
    '.lfic--credivel p.lfic__pitch{margin:.75rem 0 0;text-align:center;font-size:.9375rem;color:var(--nv)}',
    '.lfic--credivel p.lfic__legal{margin:1rem 0 0;font-size:.75rem;line-height:1.45;color:#6b8198}',
    '@media (max-width:640px){.lfic--credivel{padding:1.125rem;margin:1.5rem 0}.lfic--credivel .lfic__fields{grid-template-columns:1fr}.lfic--credivel h3.lfic__title{font-size:1.25rem}.lfic--credivel img.lfic__logo{height:2.125rem}.lfic--credivel button.lfic__opt{padding:.75rem .5rem;font-size:.9375rem}}'
  ].join('');

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function num(s) { var n = parseInt(String(s || '').replace(/[^0-9]/g, ''), 10); return isNaN(n) ? 0 : n; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function ga(nome, dados) {
    try { var g = window.gtag || function () { (window.dataLayer = window.dataLayer || []).push(arguments); }; g('event', nome, dados); } catch (e) {}
  }

  function parceiro(cb) {
    if (conf.partner && P[conf.partner]) return cb(conf.partner);
    var f = location.search.match(/[?&]ab=(balcao|credivel)/);
    if (f) return cb(f[1]);
    var t = 0;
    (function tick() {
      var v = window.LFAB && window.LFAB.v;
      if (!v) { try { v = localStorage.getItem('lf_ab_ch'); } catch (e) {} }
      if (v === 'balcao' || v === 'credivel') return cb(v);
      if (++t < 15) return setTimeout(tick, 100);
      v = Math.random() < 0.5 ? 'balcao' : 'credivel';
      try { localStorage.setItem('lf_ab_ch', v); } catch (e) {}
      cb(v);
    })();
  }

  function destino(pk, tipo, vals) {
    var p = P[pk], u, k;
    if (pk === 'balcao') {
      u = new URL(p.url);
      u.searchParams.set('tipo', tipo);
      for (k in vals) if (vals[k]) u.searchParams.set(k, vals[k]);
      u.searchParams.set('utm_source', 'literaciafinanceira');
      u.searchParams.set('utm_medium', 'embed');
      u.searchParams.set('utm_campaign', slug);
      return u.toString();
    }
    var pf = p.prefill;
    if (!pf || !pf.url || !pf.campos) return p.url;
    u = new URL(pf.url);
    u.searchParams.set('usp', 'pp_url');
    if (pf.campos.tipo) u.searchParams.set(pf.campos.tipo, (pf.opcoes && pf.opcoes[tipo]) || TIPOS[tipo].label);
    for (k in vals) if (vals[k] && pf.campos[k]) u.searchParams.set(pf.campos[k], fmt(vals[k]));
    if (pf.campos.origem) u.searchParams.set(pf.campos.origem, 'literaciafinanceira.pt/artigos/' + slug);
    return u.toString();
  }

  function campo(id, f) {
    return '<div class="lfic__field"><label class="lfic__label" for="' + id + '">' + esc(f[1]) + '</label>' +
      '<div class="lfic__wrap"><input class="lfic__input" id="' + id + '" data-k="' + f[0] + '" type="text" inputmode="numeric" autocomplete="off" placeholder="' + f[2] + '"><span class="lfic__unit">€</span></div></div>';
  }

  function html(pk) {
    var p = P[pk], top = '<div class="lfic__top"><img class="lfic__logo" src="' + p.logo + '" alt="' + esc(p.nome) + '" loading="lazy"><span class="lfic__tag">Anúncio</span></div>';
    if (pk === 'balcao') {
      return '<div class="lfic__main">' + top +
        '<p class="lfic__step">Passo 1 de 11</p><h3 class="lfic__q">O que pretendes?</h3><div class="lfic__opts" data-r="opts"></div>' +
        '<h3 class="lfic__q is-2">Quais são os valores?</h3><div class="lfic__fields" data-r="fields"></div><div class="lfic__hint" data-r="hint"></div>' +
        '<div class="lfic__actions"><a class="lfic__btn" data-r="cta" href="' + p.url + '" target="_blank" rel="sponsored noopener">Seguinte<span class="lfic__arrow">' + SETA + '</span></a>' +
        '<span class="lfic__free">' + CADEADO + 'Grátis e sem compromisso</span></div><p class="lfic__legal-m">' + esc(p.legal) + '</p></div>' +
        '<aside class="lfic__side"><p class="lfic__side-title">Crédito habitação</p><ol class="lfic__steps">' +
        '<li><span class="lfic__num">1</span><span><small>O que pretendes?</small><b data-r="s1"></b></span></li>' +
        '<li><span class="lfic__num">2</span><span><small data-r="s2l"></small><b data-r="s2"></b></span></li></ol>' +
        '<p class="lfic__legal">Sem documentos nesta fase. ' + esc(p.legal) + '</p></aside>';
    }
    return top + '<h3 class="lfic__title">Simula o teu crédito habitação</h3><p class="lfic__sub">Em menos de 1 minuto. Sem compromissos e sem stress.</p>' +
      '<p class="lfic__plabel">O que procuras?</p><div class="lfic__opts" data-r="opts"></div><div class="lfic__fields" data-r="fields"></div><p class="lfic__help" data-r="hint"></p>' +
      '<a class="lfic__btn" data-r="cta" href="' + p.url + '" target="_blank" rel="sponsored noopener">Continuar' + SETA + '</a>' +
      '<p class="lfic__pitch">A Credível compara propostas de vários bancos por ti, sem custos.</p><p class="lfic__legal">' + esc(p.legal) + '</p>';
  }

  function sitio(rt) {
    var s = rt.querySelector('[data-lf-ic-slot]');
    if (s) return { el: s, modo: 'dentro' };
    if (conf.link) {
      var ps = rt.querySelectorAll('p'), i, a;
      for (i = 0; i < ps.length; i++) {
        a = ps[i].querySelector('a[href*="balcaodocredito.pt/pedido"]');
        if (a && ps[i].textContent.trim() === a.textContent.trim()) return { el: ps[i], modo: 'trocar' };
      }
    }
    var h = rt.querySelectorAll('h2')[(conf.h2 || 2) - 1];
    if (!h) return null;
    if (h.previousElementSibling && h.previousElementSibling.classList.contains('toc-anchor')) h = h.previousElementSibling;
    return { el: h, modo: 'antes' };
  }

  function montar(pk) {
    var rt = document.querySelector('.text-rich-text.is-artigo');
    if (!rt || rt.querySelector('.lfic')) return;
    var s = sitio(rt);
    if (!s) return;
    if (!document.getElementById('lfic-css')) { var st = document.createElement('style'); st.id = 'lfic-css'; st.textContent = CSS; document.head.appendChild(st); }

    var root = document.createElement('div');
    root.className = 'lfic lfic--' + pk;
    root.setAttribute('data-partner', pk);
    root.innerHTML = html(pk);
    var q = function (k) { return root.querySelector('[data-r="' + k + '"]'); };
    var tipo = conf.tipo && TIPOS[conf.tipo] ? conf.tipo : 'compra', vals = {}, uid = 'lfic' + Math.random().toString(36).slice(2, 7);

    var opts = q('opts');
    Object.keys(TIPOS).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'lfic__opt' + (k === tipo ? ' is-on' : '');
      b.setAttribute('aria-pressed', k === tipo ? 'true' : 'false');
      b.innerHTML = '<span>' + TIPOS[k].label + '</span><span class="lfic__dot"></span>';
      b.addEventListener('click', function () {
        if (tipo === k) return;
        tipo = k;
        [].forEach.call(opts.children, function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        campos();
      });
      opts.appendChild(b);
    });

    function campos() {
      var T = TIPOS[tipo], F = q('fields');
      vals = {};
      F.innerHTML = campo(uid + '1', T.f1) + campo(uid + '2', T.f2);
      [].forEach.call(F.querySelectorAll('input'), function (inp) {
        inp.addEventListener('input', function () { var d = inp.value.replace(/[^0-9]/g, ''); if (d !== inp.value) inp.value = d; vals[inp.getAttribute('data-k')] = num(d); sync(); });
        inp.addEventListener('blur', function () { var v = vals[inp.getAttribute('data-k')]; inp.value = v ? fmt(v) : ''; });
        inp.addEventListener('focus', function () { inp.value = inp.value.replace(/\./g, ''); });
      });
      q('hint').textContent = T.hint;
      if (q('s2l')) q('s2l').textContent = T.resumo;
      sync();
    }

    function sync() {
      var T = TIPOS[tipo];
      if (q('s1')) {
        q('s1').textContent = T.label;
        var a = vals[T.f1[0]], b2 = vals[T.f2[0]], s2 = q('s2');
        s2.textContent = a || b2 ? (a ? fmt(a) + '€' : '-') + ' · ' + (b2 ? fmt(b2) + '€' : '-') : 'Por preencher';
        s2.classList.toggle('is-empty', !(a || b2));
      }
      q('cta').setAttribute('href', destino(pk, tipo, vals));
    }

    q('cta').addEventListener('click', function () {
      ga('ic_embed_click', { partner: pk, article: slug, tipo: tipo, com_valores: vals[TIPOS[tipo].f1[0]] || vals[TIPOS[tipo].f2[0]] ? 'sim' : 'nao' });
    });

    campos();
    if (s.modo === 'dentro') s.el.appendChild(root);
    else if (s.modo === 'trocar') s.el.parentNode.replaceChild(root, s.el);
    else s.el.parentNode.insertBefore(root, s.el);

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { ga('ic_embed_view', { partner: pk, article: slug }); io.disconnect(); }
      }, { threshold: 0.5 });
      io.observe(root);
    }
  }

  function start() { parceiro(montar); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
