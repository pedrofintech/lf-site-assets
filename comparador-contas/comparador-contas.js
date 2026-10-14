/* Comparador de contas bancárias - LiteraciaFinanceira.pt
   Dados em dados/contas.json (valores, ordem, links e etiquetas). Logótipos em logos/.
   A página do Webflow tem um div com o ID lf-cb e carrega este ficheiro e o CSS pelo jsDelivr,
   presos a um commit (ver webflow-custom-code.html e README.md).
   A lista segue o comparador de depósitos (#lf-dp) e a vista lado a lado o de corretoras (#lf-cc). */
(function () {
  'use strict';
  var scriptEl = document.currentScript;
  var BASE = scriptEl && scriptEl.src ? scriptEl.src.replace(/[^/]*$/, '') : 'https://cdn.jsdelivr.net/gh/pedrofintech/lf-site-assets@main/comparador-contas/';
  var LF = 'https://www.literaciafinanceira.pt';
  var CONF = 'A confirmar';
  var LIMITE = 10; /* contas visíveis antes de "Mostrar mais" */
  var D, ALL, root, S;

  function boot() {
    root = document.getElementById('lf-cb');
    if (!root || root.getAttribute('data-cb-ok')) return;
    root.setAttribute('data-cb-ok', '1');
    if (!root.innerHTML.replace(/\s/g, '')) root.innerHTML = '<p class="cb-loading">A carregar o comparador...</p>';
    (function carregar(tentativas) {
      fetch(BASE + 'dados/contas.json')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (d) {
          D = d; ALL = d.contas;
          try { start(); } catch (e) { if (window.console) console.error(e); } /* um erro aqui não deve repetir o pedido */
        })
        .catch(function (e) {
          if (tentativas > 0) { setTimeout(function () { carregar(tentativas - 1); }, 1000); return; }
          root.innerHTML = '<p class="cb-loading">Não foi possível carregar o comparador. Tenta recarregar a página.</p>';
          if (window.console) console.error(e);
        });
    })(1);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  /* ---------- Definições ---------- */
  var IBANS = { PT: 'Português', ES: 'Espanhol', DE: 'Alemão', NL: 'Neerlandês', LT: 'Lituano', BE: 'Belga', FR: 'Francês', IE: 'Irlandês' };

  /* "Sem custos fixos" e "Sem mensalidade" incluem as contas com uma campanha de pelo menos PROMO_MIN meses a 0€ */
  var PROMO_MIN = 6;
  function gratis(o) { return o.f.custoMes === 0 || promoOk(o); }
  var CHIPS = {
    particular: [
      { k: 'digital', l: '100% digital', i: 'pho', f: function (o) { return o.tipo === 'digital'; } },
      { k: 'gratis', l: 'Sem custos fixos', i: 'wal', f: gratis },
      { k: 'ibanpt', l: 'IBAN português', i: 'pin', f: function (o) { return o.f.iban === 'PT'; } },
      { k: 'mbway', l: 'MB WAY', i: 'mbw', f: function (o) { return !!o.f.mbway; } },
      { k: 'cartao', l: 'Cartão físico grátis', i: 'card', f: function (o) { return !!(o.f.cartaoFisico && o.f.cartaoGratis); } },
      { k: 'juros', l: 'Paga juros', i: 'pct', f: function (o) { return o.f.jurosMax > 0; } },
      { k: 'numerario', l: 'Depositar dinheiro', i: 'cash', f: function (o) { return !!o.f.numerario; } }
    ],
    empresa: [
      { k: 'digital', l: '100% digital', i: 'pho', f: function (o) { return o.tipo === 'digital'; } },
      { k: 'gratis', l: 'Sem mensalidade', i: 'wal', f: gratis },
      { k: 'online', l: 'Abertura online', i: 'mon', f: function (o) { return !!o.f.aberturaOnline; } },
      { k: 'ibanpt', l: 'IBAN português', i: 'pin', f: function (o) { return o.f.iban === 'PT'; } },
      { k: 'tpa', l: 'TPA', i: 'card', f: function (o) { return !!o.f.tpa; } },
      { k: 'multimoeda', l: 'Várias moedas', i: 'glo', f: function (o) { return !!o.f.multimoeda; } }
    ]
  };
  /* "Para quem": muda as contas que aparecem e, nos perfis jovem e menor, a conta e o custo de cada banco (campo perfis) */
  var PERFIS = {
    particular: [['', 'Qualquer pessoa'], ['jovem', 'Jovem até 30 anos'], ['menor', 'Menor de 18 anos'], ['conjunta', 'Conta conjunta']],
    empresa: [['', 'Qualquer empresa'], ['eni', 'Empresário em nome individual'], ['sociedade', 'Sociedade']]
  };
  var PERFIL_ROW = { jovem: 'Conta para jovens', menor: 'Conta para menores', conjunta: 'Conta conjunta' };
  var ARTIGO_ORDENADO = '/artigos/melhores-campanhas-para-domiciliar-ordenado';
  var SEGS = [['particular', 'Pessoal'], ['empresa', 'Empresa']];
  var VISTAS = [['lista', 'Lista'], ['comparar', 'Lado a lado']];
  var SORTS = {
    particular: [['rec', 'Recomendados'], ['custo', 'Mais baratos'], ['juros', 'Mais juros'], ['nome', 'Nome (A-Z)']],
    empresa: [['rec', 'Recomendados'], ['custo', 'Mais baratos'], ['nome', 'Nome (A-Z)']]
  };
  var SECTIONS = {
    particular: [
      { id: 'custos', t: 'Quanto pagas', n: 'Com Imposto do Selo', i: 'calc', rows: [
        { k: 'custoMes', calc: 'custo', l: 'Custo por mês', n: 'Manutenção e cartão de débito' },
        { k: 'manut', l: 'Comissão de manutenção' },
        { k: 'cartao', l: 'Cartão de débito' },
        { k: 'credito', l: 'Cartão de crédito' },
        { k: 'levant', l: 'Levantamentos', n: 'Em Portugal e na zona euro' },
        { k: 'levantFora', l: 'Levantamentos fora da zona euro' },
        { k: 'transf', l: 'Transferências', n: 'SEPA e imediatas' },
        { k: 'cambio', l: 'Pagamentos noutras moedas' },
        { k: 'premio', calc: 'premio', l: 'Prémio por domiciliar o ordenado' }
      ] },
      { id: 'dia', t: 'No dia a dia', i: 'pho', rows: [
        { k: 'iban', l: 'IBAN' },
        { k: 'mbway', l: 'MB WAY' },
        { k: 'pagamentos', l: 'Pagar serviços e ao Estado' },
        { k: 'numerario', l: 'Depositar dinheiro' },
        { k: 'carteiras', l: 'Apple Pay e Google Pay' }
      ] },
      { id: 'juros', t: 'Juros e poupança', i: 'pig', rows: [
        { k: 'jurosMax', calc: 'juros', l: 'Taxa mais alta', n: 'TANB que um cliente novo consegue sem ordenado' },
        { k: 'jurosConta', l: 'Juros na conta à ordem' },
        { k: 'poupanca', l: 'Conta poupança' },
        { k: 'investir', l: 'Investir na app' }
      ] },
      { id: 'seg', t: 'Segurança', i: 'shi', rows: [
        { k: 'entidade', top: true, l: 'Entidade' },
        { k: 'regulador', l: 'Supervisor' },
        { k: 'garantia', l: 'Garantia de depósitos' }
      ] },
      { id: 'abrir', t: 'Abrir conta e apoio', i: 'usr', rows: [
        { k: 'abertura', l: 'Como abrir' },
        { k: 'balcoes', l: 'Balcões' },
        { k: 'apoio', l: 'Apoio ao cliente' }
      ] }
    ],
    empresa: [
      { id: 'custos', t: 'Quanto pagas', n: 'Com Imposto do Selo, quando se aplica', i: 'calc', rows: [
        { k: 'custoMes', calc: 'custo', l: 'Custo por mês', n: 'Plano considerado' },
        { k: 'plano', l: 'Plano considerado' },
        { k: 'manut', l: 'Mensalidade' },
        { k: 'outrosPlanos', l: 'Outros planos' },
        { k: 'cartoes', l: 'Cartões incluídos' },
        { k: 'transf', l: 'Transferências' },
        { k: 'levant', l: 'Levantamentos' },
        { k: 'cambio', l: 'Pagamentos noutras moedas' }
      ] },
      { id: 'serv', t: 'Serviços', i: 'bld', rows: [
        { k: 'iban', l: 'IBAN' },
        { k: 'estado', l: 'Pagar ao Estado e à Segurança Social' },
        { k: 'tpa', l: 'TPA ou terminal' },
        { k: 'cheques', l: 'Cheques' },
        { k: 'multimoeda', l: 'Várias moedas' },
        { k: 'credito', l: 'Crédito e leasing' }
      ] },
      { id: 'juros', t: 'Juros', i: 'pig', rows: [
        { k: 'jurosMax', calc: 'juros', l: 'Taxa mais alta', n: 'TANB no saldo' },
        { k: 'juros', l: 'Juros no saldo' }
      ] },
      { id: 'seg', t: 'Segurança', i: 'shi', rows: [
        { k: 'entidade', top: true, l: 'Entidade' },
        { k: 'garantia', l: 'Garantia de depósitos' }
      ] },
      { id: 'abrir', t: 'Abrir conta e apoio', i: 'usr', rows: [
        { k: 'abertura', l: 'Como abrir' },
        { k: 'balcoes', l: 'Balcões' },
        { k: 'apoio', l: 'Apoio ao cliente' }
      ] }
    ]
  };

  /* Ícones no estilo Lucide */
  function ico(p, cls) { return '<svg class="' + (cls || 'cb-i') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
  var IC = {
    wal: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    pin: '<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    pho: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    pct: '<path d="M19 5L5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    mon: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    glo: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
    usr: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    bld: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01M8 10h.01M12 10h.01M16 10h.01"/>',
    pig: '<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/>',
    shi: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    out: '<path d="M7 17L17 7M7 7h10v10"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    yes: '<circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9.5"/>',
    no: '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    mbw: '<path d="M8 3L4 7l4 4"/><path d="M4 7h16"/><path d="M16 21l4-4-4-4"/><path d="M20 17H4"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    shx: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/>',
    warn: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    ok: '<path d="M20 6L9 17l-5-5"/>',
    sal: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'
  };

  /* ---------- Formatação pt-PT ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function milhar(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function eur2(n) { /* sempre com cêntimos, como nos outros comparadores: 0,00€ e 5,46€ */
    if (n == null) return '-';
    var p = (Math.round(n * 100) / 100).toFixed(2).split('.');
    return milhar(p[0]) + ',' + p[1] + '€';
  }
  function fmtPct(n) { return n.toFixed(2).replace('.', ',') + '%'; }

  /* Campanhas com data de fim ("ate", AAAA-MM-DD) deixam de aparecer no dia seguinte, sem ser preciso mexer nos dados */
  function hoje() { var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
  function ativo(x) { return !!x && (!x.ate || x.ate >= hoje()); }
  function promoOk(o) { return ativo(o.promo) && o.promo.m >= PROMO_MIN; }

  /* ---------- Estado ---------- */
  function byId(id) { for (var i = 0; i < ALL.length; i++) { if (ALL[i].id === id) return ALL[i]; } return null; }
  function width() { return window.innerWidth || document.documentElement.clientWidth || 1200; }
  function isMobile() { return width() < 768; }
  function maxSel() { var w = width(); return w < 768 ? 2 : (w < 1100 ? 3 : 4); }
  function sel() { return S.sel[S.seg]; }

  function readUrl() {
    try {
      var q = {};
      location.search.replace(/^\?/, '').split('&').forEach(function (kv) {
        if (!kv) return; var i = kv.indexOf('=');
        q[decodeURIComponent(i < 0 ? kv : kv.slice(0, i))] = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' '));
      });
      if (q.conta === 'empresa' || q.conta === 'particular') S.seg = q.conta;
      if (q.perfil && PERFIS[S.seg].some(function (x) { return x[0] === q.perfil; })) S.perfil = q.perfil;
      if (q.comparar) {
        var ids = [];
        q.comparar.split(',').forEach(function (id) { var o = byId(id); if (o && o.seg === S.seg && disponivel(o) && ids.indexOf(id) < 0) ids.push(id); });
        if (ids.length) { S.sel[S.seg] = ids.slice(0, maxSel()); if (ids.length > 1) S.view = 'comparar'; }
      }
    } catch (e) { /* URL inválido: fica o estado por omissão */ }
  }
  function writeUrl() {
    try {
      if (!window.history || !history.replaceState) return;
      var keep = location.search.replace(/^\?/, '').split('&').filter(function (kv) { return kv && !/^(conta|perfil|comparar)=/.test(kv); });
      if (S.seg === 'empresa') keep.push('conta=empresa');
      if (S.perfil) keep.push('perfil=' + S.perfil);
      if (S.view === 'comparar' && sel().length) keep.push('comparar=' + sel().join(','));
      history.replaceState(history.state, '', location.pathname + (keep.length ? '?' + keep.join('&') : '') + location.hash);
    } catch (e) { /* sem history: ignora */ }
  }

  /* ---------- Lista filtrada ---------- */
  function chipsOn() { var n = 0; for (var k in S.on) { if (S.on.hasOwnProperty(k) && S.on[k]) n++; } return n; }
  /* Contas do tipo escolhido que existem para o perfil, já com a conta e o custo do perfil (vista) */
  function noSeg() { return ALL.filter(function (o) { return o.seg === S.seg && disponivel(o); }).map(vista); }
  function disponivel(o) {
    var p = S.perfil;
    if (!p || p === 'jovem') return true;
    if (p === 'eni') return !!o.f.eni;
    if (p === 'sociedade') return !!o.f.sociedades;
    return !!(o.perfis && o.perfis[p]);
  }
  /* Nos perfis jovem e menor, a conta do banco pode ser outra (ex.: Conta Jovem): muda o produto, o custo, o cartão,
     a abertura e as etiquetas. As campanhas da conta normal só passam se o perfil o disser (premio: true). */
  function vista(o) {
    var p = (S.perfil === 'jovem' || S.perfil === 'menor' || S.perfil === 'conjunta') && o.perfis && o.perfis[S.perfil];
    if (!p) return o;
    var v = Object.create(o);
    v.base = o; v.perfil = p;
    if (S.perfil === 'conjunta') return v;
    v.produto = p.produto || o.produto;
    v.f = {}; for (var k in o.f) { if (o.f.hasOwnProperty(k)) v.f[k] = o.f[k]; }
    v.f.custoMes = p.custoMes; v.f.custoMesCond = p.custoMesCond != null ? p.custoMesCond : null; v.f.custoAno = Math.round(p.custoMes * 1200) / 100;
    v.custoNota = p.custoNota || null;
    v.ab = p.ab || o.ab;
    v.promo = p.promo || null;
    v.tags = p.tags || [];
    v.premio = p.premio ? o.premio : null;
    v.bonus = p.bonus ? o.bonus : null;
    return v;
  }
  function vistaId(id) { var o = byId(id); return o && o.seg === S.seg && disponivel(o) ? vista(o) : null; }
  function filtered() {
    var chips = CHIPS[S.seg];
    var list = noSeg().filter(function (o) {
      for (var i = 0; i < chips.length; i++) { if (S.on[chips[i].k] && !chips[i].f(o)) return false; }
      return true;
    });
    return list.sort(function (a, b) {
      if (S.sort === 'custo') { if (a.f.custoMes !== b.f.custoMes) return a.f.custoMes - b.f.custoMes; }
      else if (S.sort === 'juros') { var ja = a.f.jurosMax || 0, jb = b.f.jurosMax || 0; if (ja !== jb) return jb - ja; }
      else if (S.sort === 'nome') { return a.name.localeCompare(b.name, 'pt'); }
      return a.ordem - b.ordem;
    });
  }

  /* ---------- Peças ---------- */
  /* Logótipo: as iniciais ficam por baixo até a imagem carregar; depois o quadrado fica branco com borda
     e as iniciais desaparecem (sem isto, apareciam através dos logótipos com fundo transparente). */
  function logo(o, size) {
    var cls = 'cb-logo' + (size ? ' is-' + size : '') + (o.logoPad === 'sm' ? ' is-pad-sm' : (o.logoPad ? ' is-pad' : '')) + (o.logoBg ? ' is-bg' : '');
    var src = o.logo ? (/^https?:/.test(o.logo) ? o.logo : BASE + 'logos/' + o.logo) : '';
    return '<span class="' + cls + '" aria-hidden="true"' + (o.logoBg ? ' style="--cb-logo-bg:' + esc(o.logoBg) + '"' : '') + '><span class="cb-logo-ini">' + esc(o.ini || o.name.slice(0, 2)) + '</span>' +
      (src ? '<img src="' + esc(src) + '" alt="" decoding="async" onload="this.parentNode.className+=\' has-img\'" onerror="this.parentNode.removeChild(this)">' : '') + '</span>';
  }
  function yn(v) {
    var t = String(v || '');
    if (/^Sim\b/.test(t)) return '<span class="cb-yn is-yes">' + ico(IC.yes) + '<span>' + esc(t) + '</span></span>';
    if (/^Não\b/.test(t) && !/^Não (indicado|anunciado)/.test(t)) return '<span class="cb-yn is-no">' + ico(IC.no) + '<span>' + esc(t) + '</span></span>';
    return esc(t);
  }
  function isConf(o, k) { return o.c && o.c.indexOf(k) > -1; }
  function txt(o, k) { return (o.t && o.t[k]) || { v: '-' }; }
  function hasCond(o) { return o.f.custoMesCond != null && o.f.custoMesCond !== o.f.custoMes; }
  function custoSub(o) { return hasCond(o) ? 'Com condições: ' + eur2(o.f.custoMesCond) : (o.custoNota || ''); }
  function jurosNaConta(o) {
    var m = String(txt(o, 'jurosConta').v).match(/(\d+(?:,\d+)?)\s*%/);
    return !!(m && parseFloat(m[1].replace(',', '.')) > 0);
  }
  function quem(o) { return o.f.eni && o.f.sociedades ? 'ENI e sociedades' : (o.f.eni ? 'Só ENI' : 'Só sociedades'); }

  function kpi(l, v, s, cls) {
    return '<div class="cb-kpi"><div class="cb-kpi-l">' + esc(l) + '</div><div class="cb-kpi-v' + (cls ? ' ' + cls : '') + '">' + v + '</div>' + (s ? '<div class="cb-kpi-s">' + s + '</div>' : '') + '</div>';
  }
  function kpis(o) {
    var f = o.f, custo = kpi('Custo por mês', esc(eur2(f.custoMes)), esc(custoSub(o)));
    if (o.seg === 'particular') {
      var p = o.perfil, conj = S.perfil === 'conjunta' && p, ab = o.ab || { v: txt(o, 'abertura').v };
      return custo +
        kpi('Cartão de débito', esc((p && !conj && p.cartao) || txt(o, 'cartao').v), conj ? esc(p.cartao2 || '') : '') +
        (conj ? kpi('Conta conjunta', esc(p.v), esc(p.s || '')) : kpi('Abertura', esc(ab.v), esc(ab.s || ''))) +
        kpi('IBAN', esc(IBANS[f.iban] || f.iban), (f.mbway ? '<span class="cb-yn is-yes">' + ico(IC.yes) + 'Com MB WAY</span>' : '<span class="cb-yn is-no">' + ico(IC.no) + 'Sem MB WAY</span>')) +
        /* nos perfis jovem e menor interessa mais a idade do que os juros (que podem não valer para a conta jovem) */
        ((S.perfil === 'jovem' || S.perfil === 'menor') ? kpi('Idades', esc(p && p.idade ? p.idade : 'Desde os 18 anos'), '') :
        kpi('Juros', f.jurosMax > 0 ? 'Até ' + fmtPct(f.jurosMax) : 'Não paga', f.jurosMax > 0 ? (jurosNaConta(o) ? 'Na conta à ordem' : 'Na conta poupança') : ''));
    }
    return custo +
      kpi('Cartões', esc(txt(o, 'cartoes').v), '') +
      kpi('Transferências', esc(txt(o, 'transf').v), '') +
      kpi('IBAN', esc(IBANS[f.iban] || f.iban), f.multimoeda ? 'Várias moedas' : 'Só euros') +
      kpi('Abertura', f.aberturaOnline ? 'Online' : 'No balcão', esc(quem(o)));
  }
  /* modo: '' (cartão da lista), 'head' (cabeçalho da comparação) ou 'mini' (barra fixa, só o botão) */
  function ctaHtml(o, modo) {
    var c = o.cta || {}, aff = c.aff, label = c.label || 'Abrir conta';
    var a = '<a class="cb-btn' + (label.length > 22 ? ' is-long' : '') + '" href="' + esc(c.href) + '" target="_blank" rel="noopener' + (aff ? ' sponsored' : '') + '"' +
      (aff ? ' data-afiliado="' + esc(aff) + '" data-afiliado-local="comparador-contas"' : '') +
      ' aria-label="' + esc(label + ' (abre o site de ' + o.name + ')') + '"><span>' + esc(label) + '</span>' + ico(IC.out) + '</a>';
    if (modo === 'mini') return a;
    var extra = (c.nota ? '<span class="cb-note">' + esc(c.nota) + '</span>' : '') +
      (o.review ? '<a class="cb-review" href="' + esc(o.review) + '" target="_blank" rel="noopener">Ler análise completa</a>' : '');
    return modo === 'head' ? a + '<div class="cb-hnote">' + extra + '</div>' : a + extra;
  }
  /* Etiquetas com ícone: verde para vantagens e bónus, amarelo para avisos. "i" escolhe o ícone, "s" é a explicação
     (aparece ao passar o rato) e "ate" a data em que a campanha acaba. */
  function tagHtml(cls, ic, t, s) {
    return '<span class="cb-tag ' + cls + '"' + (s ? ' title="' + esc(s) + '"' : '') + '>' + ico(IC[ic] || IC.ok) + '<span>' + esc(t) + '</span></span>';
  }
  function tagsHtml(o, keep) {
    var h = '';
    if (o.perfil && o.perfil.idade) h += tagHtml('is-info', 'usr', o.perfil.idade, o.perfil.produto);
    if (o.bonus) h += tagHtml('is-bonus', 'gift', o.bonus, o.cta && o.cta.nota);
    if (o.premio && ativo(o.premio)) {
      h += '<a class="cb-tag is-ok is-link" href="' + LF + ARTIGO_ORDENADO + '" target="_blank" rel="noopener" title="' + esc(o.premio.t + '. ' + o.premio.s) + '">' +
        ico(IC.sal) + '<span>Prémio por domiciliar</span></a>';
    }
    (o.tags || []).forEach(function (t) {
      if (!ativo(t)) return;
      h += tagHtml(t.w ? 'is-warn' : 'is-ok', t.i || (t.w ? 'warn' : 'ok'), t.t, t.s);
    });
    return h || keep ? '<div class="cb-tags">' + h + '</div>' : '';
  }

  /* Valor de uma linha para uma conta: {v, s, conf, num, big, yn} */
  function rowVal(o, row) {
    var f = o.f;
    if (row.calc === 'custo') {
      var s = f.custoMes > 0 ? ['Por ano: ' + eur2(f.custoAno)] : [];
      if (hasCond(o)) s.push('Com condições: ' + eur2(f.custoMesCond) + ' por mês');
      if (o.custoNota) s.push(o.custoNota);
      return { v: eur2(f.custoMes), s: s.join('. '), conf: isConf(o, 'custoMes'), num: f.custoMes, big: true };
    }
    if (row.calc === 'juros') {
      return { v: f.jurosMax > 0 ? fmtPct(f.jurosMax) : 'Não paga', s: '', num: f.jurosMax || 0, big: true };
    }
    if (row.calc === 'perfil') {
      var p = o.perfil;
      if (!p) return { v: o.produto, s: 'Não há preço especial para jovens nesta conta' };
      if (S.perfil === 'conjunta') return { v: p.v, s: [p.s, p.nota].filter(Boolean).join('. '), links: [[p.src, 'Fonte']] };
      return { v: p.produto + (p.idade ? ' (' + p.idade + ')' : ''), s: (p.nota || '') + ' Os restantes valores são da ' + o.base.produto + '.', conf: !!p.conf, links: [[p.src, 'Fonte']] };
    }
    /* a manutenção e o cartão da conta do perfil estão na linha do perfil; os da conta normal enganavam */
    if (o.base && S.perfil !== 'conjunta' && (row.k === 'manut' || row.k === 'cartao')) return { v: 'Ver acima', s: 'Em "' + PERFIL_ROW[S.perfil] + '"' };
    if (row.calc === 'premio') {
      var pr = o.premio && ativo(o.premio) ? o.premio : null;
      if (!pr) return { v: 'Sem campanha', s: '' };
      return { v: pr.t, s: pr.s, links: [[pr.url, 'Ver campanha'], [LF + ARTIGO_ORDENADO, 'Melhores campanhas para domiciliar o ordenado']] };
    }
    if (row.top) return { v: o[row.k] || '-', s: '' };
    var d = txt(o, row.k);
    return { v: d.v, s: d.s || '', conf: isConf(o, row.k), yn: true };
  }

  /* Secções da comparação. Com um perfil escolhido (jovem, menor ou conjunta), "Quanto pagas" começa pela conta desse perfil. */
  function secs() {
    var all = SECTIONS[S.seg];
    if (S.seg !== 'particular' || !PERFIL_ROW[S.perfil]) return all;
    return all.map(function (sec, i) {
      if (i) return sec;
      var c = {}; for (var k in sec) { if (sec.hasOwnProperty(k)) c[k] = sec[k]; }
      c.rows = [{ k: 'perfil', calc: 'perfil', l: PERFIL_ROW[S.perfil] }].concat(sec.rows);
      return c;
    });
  }
  function linksHtml(r) {
    return r.links ? '<span class="cb-links">' + r.links.map(function (x) { return '<a class="cb-src" href="' + esc(x[0]) + '" target="_blank" rel="noopener">' + esc(x[1]) + '</a>'; }).join('') + '</span>' : '';
  }

  /* ---------- Render: estrutura ---------- */
  function shell() {
    root.innerHTML =
      '<div class="cb-meta">' +
        '<a class="cb-author" href="' + LF + '/autores/pedro-braz"><span class="cb-av"><img src="https://cdn.prod.website-files.com/67922c46c9da6bf5d9bfdf20/683ee0f9b80a20ec1767fab5_Pedro-Braz.avif" alt="" onerror="this.parentNode.textContent=\'PB\'"></span><span><span class="cb-al">Autor</span><span class="cb-an">Pedro Braz</span></span></a>' +
        '<a class="cb-author" href="' + LF + '/autores/franklin-silva"><span class="cb-av"><img src="https://cdn.prod.website-files.com/67922c46c9da6bf5d9bfdf20/683ee0ae5bc67fe0ef48466e_franklin-silva.avif" alt="" onerror="this.parentNode.textContent=\'FS\'"></span><span><span class="cb-al">Revisor</span><span class="cb-an">Franklin Silva</span></span></a>' +
        '<span class="cb-author cb-date"><span class="cb-av">' + ico(IC.cal, '') + '</span><span><span class="cb-al">Última verificação</span><span class="cb-an">' + esc(D.verificado) + '</span></span></span>' +
      '</div>' +
      '<div class="cb-form" id="cb-form"></div>' +
      '<div id="cb-view"></div>' +
      '<div class="cb-notes" id="cb-notes"></div>' +
      '<div class="cb-tray" id="cb-tray"></div>' +
      '<div class="cb-mini" id="cb-mini"></div>';
  }

  function tabs(attr, opts, cur, id, label) {
    return '<div class="cb-fg cb-fg-' + attr.replace('data-', '') + '"><span class="cb-label" id="' + id + '">' + label + '</span>' +
      '<div class="cb-toggle" role="group" aria-labelledby="' + id + '" style="--cb-tabs:' + opts.length + '">' +
      opts.map(function (t) {
        var on = cur === t[0];
        return '<button type="button" class="cb-tab' + (on ? ' is-active' : '') + '" ' + attr + '="' + t[0] + '" aria-pressed="' + on + '">' + esc(t[1]) + '</button>';
      }).join('') + '</div></div>';
  }
  function renderForm() {
    document.getElementById('cb-form').innerHTML =
      tabs('data-seg', SEGS, S.seg, 'cb-l-seg', 'Tipo de conta') +
      '<div class="cb-fg cb-fg-perfil"><label class="cb-label" for="cb-perfil">Para quem</label>' +
        '<select class="cb-pselect' + (S.perfil ? ' is-on' : '') + '" id="cb-perfil">' + PERFIS[S.seg].map(function (x) {
          return '<option value="' + x[0] + '"' + (S.perfil === x[0] ? ' selected' : '') + '>' + esc(x[1]) + '</option>';
        }).join('') + '</select></div>' +
      tabs('data-go', VISTAS, S.view, 'cb-l-ver', 'Ver');
  }

  /* ---------- Render: lista (como o comparador de depósitos) ---------- */
  function cardHtml(o, i) {
    var on = sel().indexOf(o.id) > -1, open = S.open === o.id;
    var h = '<div class="cb-c' + (on ? ' is-sel' : '') + (open ? ' is-open' : '') + '" data-id="' + o.id + '">' +
      '<div class="cb-c-main">' +
        '<div class="cb-rank">' + (i + 1) + '</div>' +
        '<div class="cb-ent">' + logo(o) + '<div class="cb-ent-t"><div class="cb-name">' + esc(o.name) + '</div><div class="cb-prod">' + esc(o.produto) + '</div>' + tagsHtml(o) + '</div></div>' +
        '<div class="cb-kpis">' + kpis(o) + '</div>' +
        '<div class="cb-c-cta">' + ctaHtml(o) + '</div>' +
      '</div>' +
      '<div class="cb-c-foot">' +
        '<label class="cb-cmp"><input type="checkbox" data-cmp="' + o.id + '"' + (on ? ' checked' : '') + '><span>Comparar</span></label>' +
        '<button type="button" class="cb-c-toggle" data-more="' + o.id + '" aria-expanded="' + open + '" aria-label="' + (open ? 'Fechar os detalhes de ' : 'Ver todos os detalhes de ') + esc(o.name) + '">' +
          '<span>' + (open ? 'Fechar detalhes' : 'Ver <span class="cb-hide-s">todos os </span>detalhes') + '</span>' + ico(IC.chev, 'cb-caret') + '</button>' +
      '</div>';
    if (open) h += detailHtml(o);
    return h + '</div>';
  }
  /* Detalhes em duas colunas. As secções vão aos pares (uma à esquerda, outra à direita) e cada linha ocupa a mesma
     linha da grelha que a do lado (--r), para os traços ficarem alinhados. No telemóvel fica uma coluna, pela ordem do HTML. */
  function detailHtml(o) {
    var h = '<div class="cb-c-detail"><div class="cb-dgrid">', ss = secs(), base = 1;
    for (var p = 0; p < ss.length; p += 2) {
      var alto = 0;
      ss.slice(p, p + 2).forEach(function (sec, c) {
        var col = ' cb-col' + (c + 1);
        h += '<div class="cb-h' + col + (p ? ' is-next' : '') + '" style="--r:' + base + '">' + esc(sec.t) + '</div>';
        sec.rows.forEach(function (row, i) {
          var r = rowVal(o, row);
          h += '<div class="cb-kv' + col + '" style="--r:' + (base + 1 + i) + '"><span class="cb-kv-l">' + esc(row.l) + '</span><span class="cb-kv-v"><b>' + (r.yn ? yn(r.v) : esc(r.v)) + '</b>' +
            (r.s ? '<span class="cb-s">' + esc(r.s) + '</span>' : '') + linksHtml(r) + (r.conf ? '<span class="cb-tag is-conf">' + CONF + '</span>' : '') + '</span></div>';
        });
        alto = Math.max(alto, sec.rows.length);
      });
      base += 1 + alto;
    }
    h += '</div><div class="cb-dfoot"><a class="cb-src" href="' + esc(o.src) + '" target="_blank" rel="noopener">Ver preçário e condições de ' + esc(o.name) + '</a>' +
      (o.review ? '<a class="cb-src" href="' + esc(o.review) + '" target="_blank" rel="noopener">Ler análise completa</a>' : '') + '</div>';
    return h + '</div>';
  }
  function renderList() {
    var list = filtered(), total = noSeg().length, n = list.length, filt = chipsOn() > 0;
    var lim = (S.all || n <= LIMITE + 2) ? n : LIMITE;
    var h = '<div class="cb-bar"><div class="cb-chips" role="group" aria-label="Filtros">' +
      CHIPS[S.seg].map(function (c) { return '<button type="button" class="cb-chip' + (S.on[c.k] ? ' is-on' : '') + '" data-chip="' + c.k + '" aria-pressed="' + !!S.on[c.k] + '">' + ico(IC[c.i]) + esc(c.l) + '</button>'; }).join('') +
      '</div><div class="cb-bar-r"><span class="cb-count" aria-live="polite">' +
      (filt ? n + ' de ' + total + ' contas' : total + ' contas') + '</span>' +
      '<select class="cb-select" id="cb-sort" aria-label="Ordenar">' +
      SORTS[S.seg].map(function (s) { return '<option value="' + s[0] + '"' + (S.sort === s[0] ? ' selected' : '') + '>' + esc(s[1]) + '</option>'; }).join('') +
      '</select></div></div>';
    if (!n) h += '<div class="cb-empty">Nenhuma conta cumpre todos estes filtros.<br><button type="button" class="cb-link" data-reset>Limpar filtros</button></div>';
    else {
      h += '<div class="cb-list">' + list.slice(0, lim).map(cardHtml).join('') + '</div>';
      if (lim < n) h += '<div class="cb-more"><button type="button" class="cb-btn is-secondary" data-all>Mostrar mais ' + (n - lim) + '</button></div>';
    }
    document.getElementById('cb-view').innerHTML = h;
  }

  /* ---------- Render: lado a lado (como o comparador de corretoras) ---------- */
  function renderCompare() {
    var cur = sel().map(vistaId).filter(Boolean), max = maxSel();
    var picks = noSeg().sort(function (a, b) { return a.ordem - b.ordem; });
    var h = '<div class="cb-panel">' +
      '<p class="cb-step">Escolhe até ' + max + ' contas para comparar</p>' +
      '<p class="cb-hint">Estão pela ordem dos recomendados. Se já tiveres o máximo escolhido, a mais antiga sai.</p>' +
      '<div class="cb-picker">' + picks.map(function (o) {
        var on = sel().indexOf(o.id) > -1;
        return '<button type="button" class="cb-pick' + (on ? ' is-on' : '') + '" data-pick="' + o.id + '" aria-pressed="' + on + '">' + logo(o, 'md') +
          '<span class="cb-pick-n">' + esc(o.name) + '</span><span class="cb-pick-t">' + esc(o.tipoTxt) + '</span></button>';
      }).join('') + '</div></div>' +
      '<div class="cb-bar is-cmp"><span class="cb-count" aria-live="polite">' + (cur.length ? cur.length + (cur.length === 1 ? ' conta selecionada' : ' contas selecionadas') : '') + '</span>' +
      '<button type="button" class="cb-switch" data-diff aria-pressed="' + S.diff + '"><i></i>Mostrar só diferenças</button></div>' +
      '<div class="cb-table" id="cb-table"></div><div class="cb-pairs" id="cb-pairs"></div>';
    document.getElementById('cb-view').innerHTML = h;
    renderTable(cur);
  }
  function renderTable(cur) {
    var t = document.getElementById('cb-table');
    if (!cur.length) { t.innerHTML = '<div class="cb-empty is-flat">Escolhe pelo menos uma conta acima.</div>'; document.getElementById('cb-pairs').innerHTML = ''; renderMini([]); return; }
    root.style.setProperty('--cb-cols', 'minmax(170px,1fr) repeat(' + cur.length + ',minmax(0,1.3fr))');
    root.style.setProperty('--cb-n', cur.length);
    root.classList.toggle('show-all', !S.diff);
    var head = '<div class="cb-tr cb-head"><div class="cb-hcell"></div>' + cur.map(function (o) {
      return '<div class="cb-hcell">' +
        '<div class="cb-hname">' + logo(o, 'md') + '<span><b>' + esc(o.name) + '</b><small>' + esc(o.produto) + '</small></span></div>' +
        tagsHtml(o, true) + ctaHtml(o, 'head') + '</div>';
    }).join('') + '</div>';
    var body = secs().map(function (sec) {
      var rows = sec.rows.map(function (row) {
        var vals = cur.map(function (o) { return rowVal(o, row); });
        var best = null;
        if ((row.calc === 'custo' || row.calc === 'juros') && cur.length > 1) {
          var nums = vals.map(function (v) { return v.num; });
          var mn = Math.min.apply(null, nums), mx = Math.max.apply(null, nums);
          if (mx - mn > 0.004) best = row.calc === 'custo' ? mn : mx;
        }
        var same = cur.length > 1 && vals.every(function (v) { return v.v + '|' + v.s === vals[0].v + '|' + vals[0].s; });
        return '<div class="cb-tr' + (same ? ' is-same' : '') + '"><div class="cb-lab">' + esc(row.l) + (row.n ? '<small>' + esc(row.n) + '</small>' : '') + '</div>' +
          vals.map(function (r) {
            var c = '<span class="cb-v' + (r.big ? ' is-big' : '') + '">' + (r.yn ? yn(r.v) : esc(r.v)) + '</span>';
            if (r.s) c += '<span class="cb-s">' + esc(r.s) + '</span>';
            c += linksHtml(r);
            if (best !== null && Math.abs(r.num - best) < 0.005) c += '<span class="cb-tag is-best">' + (row.calc === 'custo' ? 'Mais barato' : 'Mais alta') + '</span>';
            if (r.conf) c += '<span class="cb-tag is-conf">' + CONF + '</span>';
            return '<div class="cb-cell">' + c + '</div>';
          }).join('') + '</div>';
      }).join('');
      var closed = !!S.secs[sec.id];
      return '<div class="cb-sec' + (closed ? ' is-closed' : '') + '"><button type="button" class="cb-sec-h" data-sec="' + sec.id + '" aria-expanded="' + !closed + '"><span class="cb-sec-t">' + ico(IC[sec.i], '') + '<span>' + esc(sec.t) + (sec.n ? '<small>' + esc(sec.n) + '</small>' : '') + '</span></span>' + ico(IC.chev, 'cb-chev') + '</button><div class="cb-sec-b">' + rows + '</div></div>';
    }).join('');
    var src = '<div class="cb-tr cb-srcrow"><div class="cb-lab">Fontes<small>Preçários e páginas oficiais</small></div>' +
      cur.map(function (o) { return '<div class="cb-cell"><a class="cb-src" href="' + esc(o.src) + '" target="_blank" rel="noopener">Preçário de ' + esc(o.name) + '</a></div>'; }).join('') + '</div>';
    t.innerHTML = head + body + src;
    renderPairs(cur);
    renderMini(cur);
    alignHead();
    onScroll();
  }
  function renderPairs(cur) {
    var out = [];
    for (var i = 0; i < cur.length; i++) {
      for (var j = i + 1; j < cur.length; j++) {
        var key = [cur[i].id, cur[j].id].sort().join('|');
        if (D.pares && D.pares[key]) out.push('<a class="cb-pair" href="' + LF + '/artigos/' + D.pares[key] + '" target="_blank" rel="noopener"><span>Comparação completa: <b>' + esc(cur[i].name) + ' vs ' + esc(cur[j].name) + '</b></span><span>Ler artigo</span></a>');
      }
    }
    document.getElementById('cb-pairs').innerHTML = out.join('');
  }
  function renderMini(cur) {
    var m = document.getElementById('cb-mini'); if (!m) return;
    if (S.view !== 'comparar' || !cur.length) { m.innerHTML = ''; m.classList.remove('is-on'); return; }
    var desk = !isMobile();
    m.innerHTML = '<div class="cb-mini-in" style="grid-template-columns:' + (desk ? 'var(--cb-cols)' : 'repeat(' + cur.length + ',minmax(0,1fr))') + '">' + (desk ? '<div class="cb-mini-c"></div>' : '') +
      cur.map(function (o) { return '<div class="cb-mini-c"><div class="cb-mini-n">' + logo(o, 'xs') + '<b>' + esc(o.name) + '</b></div>' + (cur.length > 1 ? ctaHtml(o, 'mini') : '') + '</div>'; }).join('') + '</div>';
  }
  /* Alinha nome, etiquetas, botão e notas entre as colunas do cabeçalho. Uma linha vazia em todas as colunas desaparece. */
  function alignHead() {
    ['cb-hname', 'cb-tags', 'cb-btn', 'cb-hnote'].forEach(function (k) {
      var els = Array.prototype.slice.call(root.querySelectorAll('.cb-head .' + k)), mx = 0;
      els.forEach(function (el) { el.style.minHeight = ''; el.style.display = ''; });
      els.forEach(function (el) { mx = Math.max(mx, el.offsetHeight); });
      els.forEach(function (el) { if (mx) el.style.minHeight = mx + 'px'; else el.style.display = 'none'; });
    });
  }

  /* ---------- Render: barra de comparação e notas ---------- */
  function renderTray() {
    var tr = document.getElementById('cb-tray'), cur = sel().map(vistaId).filter(Boolean);
    var show = S.view === 'lista' && cur.length > 0;
    tr.classList.toggle('is-on', show);
    root.style.paddingBottom = show ? '84px' : '';
    if (!show) { tr.innerHTML = ''; return; }
    var ok = cur.length > 1;
    tr.innerHTML = '<div class="cb-tray-in"><div class="cb-tray-logos">' + cur.map(function (o) { return logo(o, 'sm'); }).join('') + '</div>' +
      '<div class="cb-tray-t"><b>' + cur.length + ' ' + (cur.length === 1 ? 'conta escolhida' : 'contas escolhidas') + '</b><span>' + (ok ? 'Vê as diferenças linha a linha' : 'Escolhe mais uma para comparar') + '</span></div>' +
      '<button type="button" class="cb-tray-x" data-clear>Limpar</button>' +
      '<button type="button" class="cb-btn" data-go="comparar"' + (ok ? '' : ' disabled') + '>Comparar</button></div>';
  }
  function renderNotes() {
    var p = [];
    if (S.seg === 'particular') {
      p.push('<b>Custo por mês:</b> comissão de manutenção mais a anuidade do cartão de débito a dividir por 12, com Imposto do Selo, sem condições especiais. "Com condições" é o custo com ordenado domiciliado ou outras exigências do banco, explicadas em "Comissão de manutenção". Levantamentos, transferências e câmbio estão nos detalhes, mas não entram nesta conta.');
      p.push('<b>Meses grátis:</b> as campanhas com pelo menos ' + PROMO_MIN + ' meses sem custos aparecem numa etiqueta verde e contam no filtro "Sem custos fixos". O custo por mês é o valor normal, depois da campanha.');
      p.push('<b>Para quem:</b> em "Jovem até 30 anos" e "Menor de 18 anos" mostramos a conta de cada banco para essa idade, com as idades na etiqueta. Nos bancos sem conta própria para jovens fica a conta normal. Os bancos sem conta para menores saem da lista. Em "Conta conjunta" só ficam as contas que aceitam mais de um titular.');
      p.push('<b>Prémio por domiciliar:</b> campanhas para quem leva o ordenado para o banco, confirmadas nos sites dos bancos. Têm regras próprias, como ordenado mínimo e fidelização. Vê as <a href="' + LF + ARTIGO_ORDENADO + '" target="_blank" rel="noopener">melhores campanhas para domiciliar o ordenado</a>.');
      p.push('<b>Bancos tradicionais:</b> comparamos a conta pacote de entrada (conta à ordem com cartão de débito). Em qualquer banco podes pedir uma conta de serviços mínimos bancários, que em 2026 custa no máximo 5,37€ por ano (menos de 0,45€ por mês), se não tiveres outra conta à ordem.');
      p.push('<b>Juros:</b> a taxa mais alta que um cliente novo consegue sem ordenado, na conta à ordem ou numa poupança de acesso imediato do próprio banco. Fundos, como o da Wise, não contam. Os juros pagam 28% de IRS.');
      p.push('<b>Revolut:</b> bónus de 10€ ao abrires conta pelo nosso link e gastares 10€ no primeiro mês, até 31/12/2026. Aplicam-se os termos da campanha.');
    } else {
      p.push('<b>Custo por mês:</b> mensalidade do plano mais simples de cada banco, com Imposto do Selo quando se aplica. "Com condições" é o custo com as bonificações do banco, como ter um TPA a faturar. Os outros planos e o que incluem estão nos detalhes.');
      p.push('<b>Meses grátis:</b> as campanhas com pelo menos ' + PROMO_MIN + ' meses sem mensalidade aparecem numa etiqueta verde e contam no filtro "Sem mensalidade". O custo por mês é o valor normal, depois da campanha.');
      p.push('<b>Pagamentos ao Estado:</b> nas contas sem IBAN português pagas à AT e à Segurança Social por transferência, com os dados do documento de pagamento. Não há pagamento por referência Multibanco.');
      p.push('<b>Revolut Business:</b> bónus de 200€ para empresas que abram conta pelo nosso link e carreguem a conta até 31/12/2026. A Revolut paga o bónus até 10 dias úteis depois do fim da campanha. Em Portugal a conta é só para sociedades: os trabalhadores independentes usam o Revolut Pro.');
    }
    p.push('<b>Como verificamos:</b> os valores foram confirmados a ' + esc(D.verificado) + ' nos preçários, documentos de informação sobre comissões e páginas oficiais de cada banco. Os que têm a etiqueta "A confirmar" não estão escritos numa fonte oficial. As condições mudam com frequência: confirma no banco antes de abrir conta.');
    p.push('<b>Parceiros:</b> alguns botões levam a parceiros do Literacia Financeira. Se abrires conta através deles, podemos receber uma comissão, sem custo para ti. Os valores do comparador não mudam por isso.');
    document.getElementById('cb-notes').innerHTML = '<p>' + p.join('</p><p>') + '</p>';
  }

  function renderView() {
    renderForm();
    root.classList.toggle('is-cmp', S.view === 'comparar');
    if (S.view === 'comparar') renderCompare(); else { renderList(); renderMini([]); }
    renderTray();
  }
  function renderAll() { renderView(); renderNotes(); writeUrl(); }

  /* Ao abrir a vista lado a lado com menos de 2 contas, junta as sugeridas em dados/contas.json (comparar) */
  function fillDefaults() {
    var s = sel(), max = Math.min(maxSel(), 3), def = (D.comparar && D.comparar[S.seg]) || [];
    def.concat(noSeg().sort(function (a, b) { return a.ordem - b.ordem; }).map(function (o) { return o.id; }))
      .forEach(function (id) { var o = byId(id); if (s.length < max && s.indexOf(id) < 0 && o && o.seg === S.seg && disponivel(o)) s.push(id); });
  }

  /* ---------- Posição fixa (barra do topo da comparação) ---------- */
  function navBottom() {
    var n = document.querySelector('.nav_fixed'); if (!n) return 0;
    var r = n.getBoundingClientRect(); return r.bottom > 0 ? Math.round(r.bottom) : 0;
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    (window.requestAnimationFrame || setTimeout)(function () {
      ticking = false;
      var top = navBottom();
      root.style.setProperty('--cb-top', top + 'px');
      var t = document.getElementById('cb-table'), h = root.querySelector('.cb-head'), m = document.getElementById('cb-mini');
      if (!t || !h || !m || S.view !== 'comparar' || !m.innerHTML) { if (m) m.classList.remove('is-on'); return; }
      var tr = t.getBoundingClientRect(), hr = h.getBoundingClientRect();
      var show = hr.bottom < top && tr.bottom > top + 140;
      if (isMobile()) { m.style.left = ''; m.style.width = ''; m.style.right = ''; }
      else { m.style.left = Math.round(tr.left) + 'px'; m.style.width = Math.round(tr.width) + 'px'; m.style.right = 'auto'; }
      m.classList.toggle('is-on', show);
    });
  }
  function scrollToTool() {
    var y = root.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - navBottom() - 16;
    if (y < (window.pageYOffset || 0)) window.scrollTo(0, Math.max(0, y));
  }

  /* ---------- Ações ---------- */
  function toggleSel(id) {
    var s = sel(), i = s.indexOf(id);
    if (i > -1) s.splice(i, 1);
    else { if (s.length >= maxSel()) s.shift(); s.push(id); }
  }
  function focusKey(el) {
    if (!el || !el.getAttribute) return null;
    var attrs = ['data-cmp', 'data-chip', 'data-seg', 'data-go', 'data-more', 'data-pick', 'data-sec', 'data-diff'];
    for (var i = 0; i < attrs.length; i++) { if (el.hasAttribute(attrs[i])) return '[' + attrs[i] + (el.getAttribute(attrs[i]) ? '="' + el.getAttribute(attrs[i]) + '"' : '') + ']'; }
    if (el.id === 'cb-sort') return '#cb-sort';
    if (el.id === 'cb-perfil') return '#cb-perfil';
    return null;
  }
  function refocus(key) { if (!key) return; var el = root.querySelector(key); if (el && el.focus) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } } }

  function bind() {
    root.addEventListener('click', function (e) {
      var t = e.target, el, key = null;
      if ((el = t.closest('[data-seg]'))) {
        var sg = el.getAttribute('data-seg');
        if (sg !== S.seg) { S.seg = sg; S.on = {}; S.perfil = ''; S.open = null; S.all = false; if (S.sort === 'juros' && sg === 'empresa') S.sort = 'rec'; key = focusKey(el); renderAll(); refocus(key); }
        return;
      }
      if ((el = t.closest('[data-chip]'))) { var k = el.getAttribute('data-chip'); S.on[k] = !S.on[k]; S.all = false; key = focusKey(el); renderView(); refocus(key); return; }
      if ((el = t.closest('[data-reset]'))) { S.on = {}; S.all = false; renderView(); return; }
      if ((el = t.closest('[data-all]'))) {
        S.all = true; renderView();
        var nxt = root.querySelectorAll('.cb-c')[LIMITE]; if (nxt) refocus('[data-more="' + nxt.getAttribute('data-id') + '"]');
        return;
      }
      if ((el = t.closest('[data-more]'))) { var id = el.getAttribute('data-more'); S.open = S.open === id ? null : id; key = focusKey(el); renderView(); refocus(key); return; }
      if ((el = t.closest('[data-go]'))) {
        var v = el.getAttribute('data-go');
        if (v === S.view) return;
        if (v === 'comparar' && sel().length < 2) fillDefaults();
        key = focusKey(el); S.view = v; S.open = null; renderAll(); refocus(key); scrollToTool(); return;
      }
      if ((el = t.closest('[data-clear]'))) { S.sel[S.seg] = []; renderView(); writeUrl(); return; }
      if ((el = t.closest('[data-pick]'))) { toggleSel(el.getAttribute('data-pick')); key = focusKey(el); renderView(); writeUrl(); refocus(key); return; }
      if ((el = t.closest('[data-sec]'))) { var sid = el.getAttribute('data-sec'); S.secs[sid] = !S.secs[sid]; key = focusKey(el); renderTable(sel().map(vistaId).filter(Boolean)); refocus(key); return; }
      if ((el = t.closest('[data-diff]'))) { S.diff = !S.diff; el.setAttribute('aria-pressed', S.diff); renderTable(sel().map(vistaId).filter(Boolean)); return; }
    });
    root.addEventListener('change', function (e) {
      var t = e.target;
      if (t.hasAttribute && t.hasAttribute('data-cmp')) { var key = focusKey(t); toggleSel(t.getAttribute('data-cmp')); renderView(); refocus(key); return; }
      if (t.id === 'cb-sort') { S.sort = t.value; renderView(); refocus('#cb-sort'); }
      if (t.id === 'cb-perfil') {
        S.perfil = t.value; S.all = false; S.open = null;
        S.sel[S.seg] = sel().filter(function (id) { var o = byId(id); return o && disponivel(o); });
        if (S.view === 'comparar' && sel().length < 2) fillDefaults();
        renderAll(); refocus('#cb-perfil');
      }
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    var lastMax = maxSel(), rz = null;
    window.addEventListener('resize', function () {
      onScroll();
      clearTimeout(rz);
      rz = setTimeout(function () {
        var mx = maxSel();
        if (mx !== lastMax) {
          lastMax = mx;
          ['particular', 'empresa'].forEach(function (sg) { while (S.sel[sg].length > mx) S.sel[sg].pop(); });
          renderView(); writeUrl();
        } else if (S.view === 'comparar') { alignHead(); }
      }, 150);
    });
  }

  function start() {
    S = { seg: 'particular', perfil: '', on: {}, sort: 'rec', view: 'lista', open: null, all: false, diff: false, secs: {}, sel: { particular: [], empresa: [] } };
    readUrl();
    shell();
    renderAll();
    bind();
  }
})();
