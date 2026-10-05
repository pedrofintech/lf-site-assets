/* Fatura da luz - literaciafinanceira.pt (v2)
   Uma pagina so: em cima carregas a fatura (PDF ou fotografia), em baixo estao os mesmos campos para preencher a mao,
   depois os filtros e a lista de ofertas com as contas de cada uma.
   Precos e contas: os do comparador de eletricidade. O script desse comparador (repositorio comparador-eletricidade) e carregado
   dentro de um #lf-dp escondido e esta pagina usa o que ele expoe: window.__lfElCalc e window.__lfElState.
   Aspeto: o mesmo design system dos comparadores. O CSS do comparador de depositos e o do de eletricidade sao lidos pelo script
   e aplicados a esta pagina com "#lf-dp" trocado por "#lf-ft". O fatura-da-luz.css so tem o que esta pagina acrescenta.
   Leitura da fatura: Worker "lf-fatura" (worker-ler-fatura.js neste repositorio). A fatura nao fica guardada.
   Configuracao opcional antes deste script: window.__lfFtApi, window.__lfFtMotor e window.__lfFtCss. */
(function () {
  'use strict';
  if (window.__lfFtInit) return;
  window.__lfFtInit = true;

  var MOTOR = window.__lfFtMotor || 'https://franklinsilvapt-arch.github.io/comparador-eletricidade/comparador-eletricidade/comparador-eletricidade.js';
  var API = window.__lfFtApi || 'https://lf-fatura.success-f03.workers.dev/';
  var BASE = MOTOR.replace(/[^\/]*$/, '');
  var CSS = window.__lfFtCss || ['https://franklinsilvapt-arch.github.io/depositos-comparator/comparador-depositos.css', BASE + 'comparador-eletricidade.css'];
  var POTS0 = [1.15, 2.3, 3.45, 4.6, 5.75, 6.9, 10.35, 13.8, 17.25, 20.7, 27.6, 34.5, 41.4];
  var MAX_MB = 8, HOJE = new Date().toISOString().slice(0, 10), MES = 365 / 12;

  var NOMES = {
    TUR: 'SU Eletricidade', ALFAENERGIA: 'Alfa Energia', AUDAX: 'Audax', COOP: 'Coopérnico', EDPC: 'EDP', END: 'Endesa',
    ENIPLENITUDE: 'Plenitude', EZUENERGIA: 'EZU Energia', GALP: 'Galp', GOLD: 'Goldenergy', IBD: 'Iberdrola', IBELECTRA: 'Ibelectra',
    JAFPLUS: 'JAFplus', LUZBOA: 'Luzboa', LUZIGAS: 'Luzigás', MEOENERGIA: 'MEO Energia', NABALIAENERGIA: 'Nabalia Energia',
    NOSSAENERGIA: 'Nossa Energia', OENEO: 'Oeneo', PORTULOGOS: 'Portulogos', REPSOL: 'Repsol', YESENERGY: 'Yes Energy', G9: 'G9', ROCKWATT: 'Rockwatt'
  };
  var LARGOS = { COOP: 1, END: 1, IBD: 1 };
  var TARIFAS = { s: 'Simples', b: 'Bi-horária', t: 'Tri-horária' };
  /* Filtros das ofertas (os mesmos indicadores do ficheiro de ofertas do comparador) */
  var FILTROS = [
    { k: 'semFid', i: 'unl', l: 'Sem fidelização', f: function (o) { return o.f.charAt(0) === '0'; } },
    { k: 'semServ', i: 'wal', l: 'Sem serviços adicionais', f: function (o) { return o.f.charAt(4) === '0'; } },
    { k: 'verde', i: 'leaf', l: '100% renovável', f: function (o) { return o.f.charAt(1) === '1'; } },
    { k: 'mb', i: 'card', l: 'Sem débito direto obrigatório', f: function (o) { return !o.pg || o.pg !== '100'; } },
    { k: 'papel', i: 'doc', l: 'Fatura em papel', f: function (o) { return !o.ft || o.ft.charAt(1) === '1'; } }
  ];

  var S = {
    motor: false, motorErro: false, lendo: false, erro: '', lido: '',
    f: { eur: '', kwh: '', pot: 2, tarifa: 's', vazio: 40, ponta: 20, com: '', fam: false, social: false },
    on: {}, cond: false, idx: false, ver: 'melhor', filtroCom: '', ordem: 'ano1', open: null, visiveis: 10, R: null
  };

  /* ---------- Helpers ---------- */
  function esc(a) { return String(a == null ? '' : a).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function url(u) { return /^https?:\/\//i.test(u || '') ? esc(u) : ''; }
  function milhar(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function eur(v) { var p = Math.abs(v).toFixed(2).split('.'); return (v < 0 ? '-' : '') + milhar(p[0]) + ',' + p[1] + '€'; }
  function eurInt(v) { return milhar(String(Math.round(Math.abs(v)))) + '€'; }
  function dec(v, d) { return v.toFixed(d).replace('.', ','); }
  /* Numero escrito a portuguesa ("1.234,5") ou com ponto decimal */
  function num(t) {
    t = String(t == null ? '' : t).replace(/[^\d.,]/g, '');
    if (t.indexOf(',') > -1) t = t.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(t);
    return isNaN(n) ? 0 : n;
  }
  function potTxt(p) { return String(p).replace('.', ',') + ' kVA'; }
  function meses(n) { return n + (n === 1 ? ' mês' : ' meses'); }
  function dados() { return window.__lfElState && window.__lfElState.data; }
  function pots() { var d = dados(); return (d && d.pots && d.pots.length) ? d.pots : POTS0; }
  function nome(c) { var d = dados(); return NOMES[c] || (d && d.nomes && d.nomes[c]) || c; }
  function el(id) { return document.getElementById(id); }
  function ico(p) { return '<svg class="dp-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
  var IC = {
    up: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3"/>',
    unl: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    wal: '<path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
    usr: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 7-9 16-9 0 9-3 16-9 16Z"/><path d="M4 20c2-4 5-7 9-9"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
    fam: '<circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 21v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2M15 14h3a3 3 0 0 1 3 3v4"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    wave: '<path d="M3 17l5-6 4 3 4-7 5 6"/>',
    out: '<path d="M7 17 17 7M7 7h10v10"/>'
  };
  var CARET = '<svg class="dp-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  function op(v, sel, txt) { return '<option value="' + v + '"' + (String(sel) === String(v) ? ' selected' : '') + '>' + txt + '</option>'; }

  /* ---------- Contas (motor do comparador de eletricidade) ---------- */
  function ctx() {
    var f = S.f;
    return { pot: f.pot, tarifa: f.tarifa, vz: f.tarifa === 's' ? 0.4 : f.vazio / 100, pt: f.ponta / 100, fam: f.fam, social: f.social, kwh: 0 };
  }
  function conta(o, c, novo, tarifa) { return window.__lfElCalc(o, c.pot, c.kwh, c.vz, novo, tarifa || c.tarifa, c.pt, c.fam, c.social); }
  function regulada() { var d = dados(); for (var i = 0; i < d.ofertas.length; i++) if (d.ofertas[i].c === 'TUR') return d.ofertas[i]; return null; }
  /* Quem so sabe quanto paga: consumo anual que da essa fatura aos precos do mercado regulado (a mesma regra do comparador) */
  function kwhDeEuros(eurMes, c) {
    var tur = regulada();
    if (!tur) return 0;
    function total(k) {
      var x = { pot: c.pot, kwh: k, vz: c.vz, pt: c.pt, fam: c.fam, social: c.social };
      var r = conta(tur, x, false, 's') || conta(tur, x, false, 't');
      return r ? r.total : null;
    }
    var alvo = eurMes * 12, a = 0, b = 250000;
    if (total(400) === null) return 0;
    if (alvo <= total(400)) return 400;
    for (var n = 0; n < 50; n++) { var m = (a + b) / 2; if (total(m) < alvo) a = m; else b = m; }
    return (a + b) / 2;
  }

  function calcular() {
    var f = S.f, d = dados(), c = ctx(), eurMes = num(f.eur), kwhMes = num(f.kwh), estimado = false;
    if (kwhMes > 0) c.kwh = kwhMes * 12;
    else if (eurMes > 0) { c.kwh = kwhDeEuros(eurMes, c); estimado = true; }
    if (!(c.kwh > 0)) return { vazio: true };
    var chave = S.ordem === 'depois' ? 'depois' : 'ano1', todos = [], coms = {}, nIdx = 0, nCond = 0, reg = null;
    d.ofertas.forEach(function (o) {
      var fl = String(o.f || '');
      var r1 = conta(o, c, true);
      if (!r1) return;
      if (o.c === 'TUR') reg = r1;
      if (!S.idx && fl.charAt(3) === '1') { nIdx++; return; }
      if (!S.cond && fl.charAt(2) === '1') { nCond++; return; }
      for (var j = 0; j < FILTROS.length; j++) if (S.on[FILTROS[j].k] && !FILTROS[j].f(o)) return;
      if (f.com && o.c === f.com && fl.charAt(7) === '1') return; /* so para novos clientes, e a pessoa ja e cliente dessa empresa */
      var r2 = conta(o, c, false) || r1;
      coms[o.c] = 1;
      todos.push({ o: o, r: r1, ano1: r1.total, depois: r2.total });
    });
    var porOrdem = function (k) { return function (a, b) { return a[k] - b[k] || a.ano1 - b.ano1; }; };
    var melhor1 = todos.slice().sort(porOrdem('ano1'))[0] || null, melhor2 = todos.slice().sort(porOrdem('depois'))[0] || null;
    var lista;
    if (S.filtroCom) lista = todos.filter(function (x) { return x.o.c === S.filtroCom; });
    else if (S.ver === 'todas') lista = todos;
    else {
      var porCom = {};
      todos.forEach(function (x) { if (!porCom[x.o.c] || x[chave] < porCom[x.o.c][chave]) porCom[x.o.c] = x; });
      lista = Object.keys(porCom).map(function (k) { return porCom[k]; });
    }
    lista.sort({
      ano1: porOrdem('ano1'), depois: porOrdem('depois'),
      energia: function (a, b) { return a.r.precoMedio - b.r.precoMedio || a.ano1 - b.ano1; },
      potencia: function (a, b) { return a.r.p[0] - b.r.p[0] || a.ano1 - b.ano1; }
    }[S.ordem] || porOrdem('ano1'));
    var base = eurMes > 0 ? eurMes * 12 : (reg ? reg.total : null);
    return { lista: lista, n: todos.length, coms: Object.keys(coms), nIdx: nIdx, nCond: nCond, c: c, estimado: estimado, chave: chave,
      base: base, baseTua: eurMes > 0, melhor1: melhor1, melhor2: melhor2 };
  }

  /* ---------- Leitura da fatura ---------- */
  function lerBase64(blob) {
    return new Promise(function (ok, ko) {
      var r = new FileReader();
      r.onload = function () { ok(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { ko(new Error('ler')); };
      r.readAsDataURL(blob);
    });
  }
  /* Fotografias: reduz para 2000 px no lado maior e converte para JPEG, para o envio ser rapido e a leitura barata */
  function reduzirImagem(file) {
    return new Promise(function (ok, ko) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var k = Math.min(1, 2000 / Math.max(im.width, im.height)), cv = document.createElement('canvas');
        cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(u);
        ok({ mime: 'image/jpeg', dados: cv.toDataURL('image/jpeg', 0.85).split(',')[1] });
      };
      im.onerror = function () { URL.revokeObjectURL(u); ko(new Error('imagem')); };
      im.src = u;
    });
  }
  function preparar(file) {
    var pdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
    if (!pdf && !/^image\//.test(file.type || '')) return Promise.reject(new Error('tipo'));
    if (file.size > MAX_MB * 1024 * 1024 && pdf) return Promise.reject(new Error('grande'));
    return pdf ? lerBase64(file).then(function (b) { return { mime: 'application/pdf', dados: b }; }) : reduzirImagem(file);
  }
  var ERROS = {
    tipo: 'Só conseguimos ler ficheiros PDF ou fotografias.',
    grande: 'O ficheiro tem mais de ' + MAX_MB + ' MB. Experimenta uma fotografia da primeira página.',
    naofatura: 'Isto não parece uma fatura de eletricidade. Experimenta outro ficheiro ou preenche os campos em baixo.',
    limite: 'Há muitos pedidos neste momento. Tenta daqui a um minuto ou preenche os campos em baixo.'
  };
  function lerFicheiro(file) {
    S.lendo = true; S.erro = ''; S.lido = ''; renderForm();
    preparar(file).then(function (p) {
      var ctl = window.AbortController ? new AbortController() : null;
      if (ctl) setTimeout(function () { ctl.abort(); }, 90000);
      return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p), signal: ctl ? ctl.signal : undefined });
    }).then(function (r) {
      return r.json().then(function (j) { if (!r.ok || !j || j.erro) throw new Error((j && j.erro) || 'servico'); return j; });
    }).then(function (j) {
      if (j.e_fatura_eletricidade === false) throw new Error('naofatura');
      S.lendo = false; aplicarLeitura(j); renderForm(); renderRes();
      var r = el('ftRes'); if (r && r.scrollIntoView && S.R && !S.R.vazio) r.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(function (e) {
      S.lendo = false;
      S.erro = ERROS[e && e.message] || 'Não conseguimos ler a fatura agora. Preenche os campos em baixo, demora menos de um minuto.';
      renderForm();
    });
  }
  /* Passa a resposta do Worker para os campos, so com valores plausiveis. Os campos ficam por mes (a fatura pode ter 28 a 62 dias). */
  function aplicarLeitura(j) {
    var f = S.f, ps = pots(), i, melhor = -1, dist = 9, falta = [];
    var p = Number(j.potencia_kva);
    if (p > 0) for (i = 0; i < ps.length; i++) if (Math.abs(ps[i] - p) < dist) { dist = Math.abs(ps[i] - p); melhor = i; }
    if (melhor > -1 && dist < 0.06) f.pot = melhor; else falta.push('a potência');
    f.tarifa = { simples: 's', 'bi-horaria': 'b', 'tri-horaria': 't' }[String(j.opcao_horaria || '').toLowerCase()] || 's';
    var dias = Number(j.dias) >= 1 && Number(j.dias) <= 400 ? Number(j.dias) : 0;
    var kwh = Number(j.kwh_total) > 0 && Number(j.kwh_total) < 100000 ? Number(j.kwh_total) : 0;
    var vz = Number(j.kwh_vazio) > 0 ? Number(j.kwh_vazio) : 0, pt = Number(j.kwh_ponta) > 0 ? Number(j.kwh_ponta) : 0;
    var tot = Number(j.total_eletricidade_eur) > 0 ? Number(j.total_eletricidade_eur) : Number(j.total_fatura_eur);
    if (!(tot > 0 && tot < 20000)) tot = 0;
    if (kwh > 0 && vz > 0 && vz < kwh) f.vazio = Math.min(95, Math.max(5, Math.round(vz / kwh * 100)));
    if (kwh > 0 && pt > 0 && pt < kwh) f.ponta = Math.min(60, Math.max(5, Math.round(pt / kwh * 100)));
    f.kwh = kwh && dias ? String(Math.round(kwh / dias * MES)) : '';
    f.eur = tot && dias ? dec(tot / dias * MES, 2) : '';
    if (!f.kwh) falta.push('o consumo');
    if (!f.eur) falta.push('o valor');
    if (NOMES[j.comercializador]) f.com = j.comercializador;
    if (j.tarifa_social === true) f.social = true;
    var quem = String(j.comercializador_nome || '').slice(0, 60) || (f.com ? nome(f.com) : '');
    S.lido = 'Fatura' + (quem ? ' da ' + esc(quem) : '') + ' lida' + (kwh && dias ? ': ' + milhar(String(Math.round(kwh))) + ' kWh' + (tot ? ' e ' + eur(tot) : '') + ' em ' + dias + ' dias' : '') + '. ' +
      'Os campos em baixo já estão preenchidos com os valores por mês. Confirma e corrige o que estiver errado.' +
      (falta.length ? ' Não conseguimos ler ' + falta.join(' nem ') + '.' : '') +
      (j.leitura === 'estimada' ? ' O consumo desta fatura é uma estimativa do comercializador.' : '') +
      (j.tem_gas === true ? ' A fatura também tem gás: confirma que o valor é só o da luz.' : '');
  }

  /* ---------- Formulario: fatura em cima, os mesmos campos em baixo ---------- */
  function ajudaKwh(R) {
    if (num(S.f.kwh) > 0) return 'Está na fatura, em "consumo".';
    if (R && R.estimado) return 'Opcional. Pelo valor que pagas, estimamos cerca de <b>' + milhar(String(Math.round(R.c.kwh / 12))) + ' kWh</b> por mês.';
    return 'Opcional. Se deixares vazio, estimamos o consumo pelo valor que pagas.';
  }
  function vForm() {
    var f = S.f, d = dados();
    var potOpts = pots().map(function (p, i) { return op(i, f.pot, potTxt(p)); }).join('');
    var coms = d ? Object.keys(d.ofertas.reduce(function (m, o) { m[o.c] = 1; return m; }, {})).sort(function (a, b) { return nome(a).localeCompare(nome(b), 'pt'); }) : [];
    if (f.com && coms.indexOf(f.com) < 0) coms.push(f.com);
    var comOpts = op('', f.com, 'Prefiro não dizer') + coms.map(function (c) { return op(c, f.com, esc(nome(c))); }).join('');
    var tarifas = ['s', 'b', 't'].map(function (k) { return '<button type="button" class="dp-tab' + (f.tarifa === k ? ' is-active' : '') + '" data-tarifa="' + k + '">' + TARIFAS[k] + '</button>'; }).join('');
    var lista = function (base, v) { if (base.indexOf(v) < 0) base = base.concat([v]).sort(function (a, b) { return a - b; }); return base; };
    var vzOpts = lista([10, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80], f.vazio).map(function (v) { return op(v, f.vazio, v + '% em vazio'); }).join('');
    var ptOpts = lista([10, 15, 20, 25, 30, 35], f.ponta).map(function (v) { return op(v, f.ponta, v + '% em ponta'); }).join('');
    var horas = f.tarifa === 't'
      ? '<div class="el-duo"><div><label class="dp-label" for="ftVazio">Consumo em vazio</label><select class="dp-input dp-input-select" id="ftVazio">' + vzOpts + '</select></div><div><label class="dp-label" for="ftPonta">Em ponta</label><select class="dp-input dp-input-select" id="ftPonta">' + ptOpts + '</select></div></div>'
      : '<div' + (f.tarifa === 's' ? ' class="el-off"' : '') + '><label class="dp-label" for="ftVazio">Consumo em vazio</label><select class="dp-input dp-input-select" id="ftVazio"' + (f.tarifa === 's' ? ' disabled' : '') + '>' + vzOpts + '</select></div>';
    var campoNum = function (id, rot, val, suf, ajuda, idAjuda) {
      return '<div><label class="dp-label" for="' + id + '">' + rot + '</label><div class="dp-input-wrap"><input id="' + id + '" class="dp-input" type="text" inputmode="decimal" autocomplete="off" value="' + esc(val) + '"><span class="ft-suf">' + suf + '</span></div><p class="el-ajuda"' + (idAjuda ? ' id="' + idAjuda + '"' : '') + '>' + ajuda + '</p></div>';
    };
    return '<div class="dp-card is-open"><div class="dp-card-body">' +
      '<div class="ft-up' + (S.lendo ? ' is-a-ler' : '') + '"' + (S.lendo ? '' : ' data-up role="button" tabindex="0"') + '>' +
      (S.lendo ? '<div class="ft-roda" aria-hidden="true"></div><div class="ft-up-t">A ler a tua fatura...</div><div class="ft-up-s">Costuma demorar entre 5 e 20 segundos.</div>'
        : ico(IC.up) + '<div class="ft-up-t">Carrega a tua fatura da luz</div><div class="ft-up-s">PDF ou fotografia. Lemos a potência, o consumo e o valor e preenchemos os campos por ti. A fatura não fica guardada.</div><span class="dp-btn is-secondary">Escolher ficheiro</span>') +
      '</div><input type="file" id="ftFicheiro" accept="application/pdf,image/*" hidden>' +
      (S.erro ? '<p class="ft-msg is-erro">' + esc(S.erro) + '</p>' : '') + (S.lido ? '<p class="ft-msg is-ok">' + S.lido + '</p>' : '') +
      '<div class="ft-ou"><span>ou preenche à mão</span></div>' +
      '<div class="el-simples">' +
      campoNum('ftEur', 'Quanto pagas de luz por mês?', f.eur, '€', 'O valor habitual da tua fatura.') +
      '<div><label class="dp-label" for="ftPot">Potência contratada</label><select class="dp-input dp-input-select" id="ftPot">' + potOpts + '</select><p class="el-ajuda">Está na fatura. As mais comuns são 3,45 e 6,9 kVA.</p></div>' +
      '</div><div class="el-simples ft-l2">' +
      campoNum('ftKwh', 'Quantos kWh gastas por mês?', f.kwh, 'kWh', ajudaKwh(S.R), 'ftKwhAjuda') +
      '<div><label class="dp-label" for="ftCom">Com quem tens contrato?</label><select class="dp-input dp-input-select" id="ftCom">' + comOpts + '</select><p class="el-ajuda">Opcional. Tira da lista as ofertas só para novos clientes dessa empresa.</p></div>' +
      '</div>' +
      '<div class="el-avancado"><div class="el-av-g"><div><span class="dp-label">Tarifa</span><div class="dp-toggle el-toggle4 ft-toggle3">' + tarifas + '</div></div>' + horas + '</div>' +
      '<div class="el-caso"><span class="dp-label">O teu caso</span><div class="el-caso-c">' +
      '<button type="button" class="dp-chip' + (f.fam ? ' is-on' : '') + '" data-fam>' + ico(IC.fam) + 'Família numerosa</button>' +
      '<button type="button" class="dp-chip' + (f.social ? ' is-on' : '') + '" data-social>' + ico(IC.heart) + 'Tenho tarifa social</button></div></div>' +
      '<p class="dp-form-note">Na dúvida, deixa a tarifa em Simples. O vazio é o consumo à noite e, no ciclo semanal, ao fim de semana. As famílias numerosas (cinco ou mais pessoas) têm IVA a 6% nos primeiros 300 kWh por mês, em vez de 200. A tarifa social é um desconto para famílias com rendimentos baixos e aplica-se em qualquer comercializador.</p></div>' +
      '</div></div>';
  }

  /* ---------- Resultados ---------- */
  function tags(o) {
    var fl = String(o.f || ''), t = [];
    if (S.f.com && o.c === S.f.com) t.push('<span class="dp-tag">O teu comercializador</span>');
    if (o.c === 'TUR') t.push('<span class="dp-tag">Tarifa regulada</span>');
    if (fl.charAt(3) === '1') t.push('<span class="dp-tag is-warn">Indexada ao mercado</span>');
    if (fl.charAt(7) === '1') t.push('<span class="dp-tag is-warn">Só novos clientes</span>');
    if (fl.charAt(0) === '1') t.push('<span class="dp-tag is-warn">Fidelização</span>');
    if (fl.charAt(4) === '1') t.push('<span class="dp-tag is-warn">Serviços adicionais</span>');
    if (fl.charAt(2) === '1') t.push('<span class="dp-tag">Condições de acesso</span>');
    if (fl.charAt(1) === '1') t.push('<span class="dp-tag">100% renovável</span>');
    if (o.src === 'site') t.push('<span class="dp-tag">Preço do site da empresa</span>');
    return t.join(' ');
  }
  function logo(c, n) {
    var d = dados(), w = n.replace(/[^A-Za-zÀ-ÿ ]/g, '').split(' ').filter(Boolean);
    var ini = (w.length > 1 ? w[0].charAt(0) + w[1].charAt(0) : n.slice(0, 2)).toUpperCase();
    var tem = !d || !d.logos || d.logos.indexOf(c) > -1;
    return '<span class="dp-logo el-logo' + (LARGOS[c] ? ' el-lg-' + c.toLowerCase() : '') + '"><span class="dp-logo-ini">' + esc(ini) + '</span>' +
      (tem ? '<img src="' + BASE + 'logos/' + c.toLowerCase().replace(/ /g, '') + '.png" alt="Logótipo ' + esc(n) + '" loading="lazy" onload="this.classList.add(\'is-on\')" onerror="this.remove()">' : '') + '</span>';
  }
  function lista(bits, nomes, sep) {
    var t = [];
    for (var i = 0; i < nomes.length; i++) if (bits && bits.charAt(i) === '1') t.push(nomes[i]);
    return t.length ? t.join(sep || ', ') : 'Não indicado';
  }
  function energiaKpi(r) {
    if (r.k === 's') return [dec(r.p[1], 4) + '€', 'por kWh, sem IVA'];
    if (r.k === 'b') return [dec(r.p[1], 4) + '€', 'fora de vazio · ' + dec(r.p[2], 4) + '€ em vazio'];
    return [dec(r.p[1], 4) + '€', 'ponta · ' + dec(r.p[2], 4) + '€ cheias · ' + dec(r.p[3], 4) + '€ vazio'];
  }
  function cartao(it, idx, R) {
    var o = it.o, r = it.r, n = nome(o.c), aberto = S.open === o.id, promo = it.depois - it.ano1 > 6, idxd = String(o.f || '').charAt(3) === '1';
    var val = R.chave === 'depois' ? it.depois : it.ano1, dif = R.base != null ? R.base - val : null, poup;
    if (o.c === 'TUR' && !R.baseTua) poup = '<div class="dp-kpi-v is-plain" style="color:#697386">-</div><div class="dp-kpi-s">é a referência</div>';
    else if (dif == null) poup = '<div class="dp-kpi-v is-plain" style="color:#697386">-</div><div class="dp-kpi-s">&nbsp;</div>';
    else if (dif >= 0.5) poup = '<div class="dp-kpi-v el-pos">' + eurInt(dif) + '</div><div class="dp-kpi-s">a menos ' + (promo && R.chave === 'ano1' ? 'no 1.º ano' : 'por ano') + '</div>';
    else if (dif <= -0.5) poup = '<div class="dp-kpi-v is-plain el-neg">+' + eurInt(-dif) + '</div><div class="dp-kpi-s">a mais por ano</div>';
    else poup = '<div class="dp-kpi-v is-plain">Igual</div><div class="dp-kpi-s">&nbsp;</div>';
    var ek = energiaKpi(r), link = url(o.u);
    var cta = link ? '<a class="dp-btn" href="' + link + '" target="_blank" rel="nofollow noopener" data-stop>Ir para a ' + esc(n) + ico(IC.out) + '</a>' : '';
    var caro = promo && R.baseTua && it.depois > R.base + 6;
    var h = '<div class="dp-c' + (aberto ? ' is-open' : '') + '" data-id="' + esc(o.id) + '"><div class="dp-c-main">' +
      '<div class="dp-rank">' + (idx + 1) + '</div>' +
      '<div class="dp-ent">' + logo(o.c, n) + '<div><div class="dp-c-head"><span class="dp-name">' + esc(n) + '</span></div><div class="dp-prod">' + esc(o.n || '') + '</div>' + tags(o) + '</div></div>' +
      '<div class="dp-kpis">' +
      '<div class="dp-kpi"><div class="dp-kpi-l">' + (idxd ? 'Fatura estimada' : 'Fatura por mês') + '</div><div class="dp-kpi-v">' + eur(it.ano1 / 12) + '</div><div class="dp-kpi-s">' + (promo ? 'no 1.º ano' : eurInt(it.ano1) + ' por ano') + '</div></div>' +
      '<div class="dp-kpi"><div class="dp-kpi-l">Depois do 1.º ano</div><div class="dp-kpi-v is-plain' + (caro ? ' el-neg' : '') + '">' + (promo ? eur(it.depois / 12) : 'Igual') + '</div><div class="dp-kpi-s">' + (promo ? (caro ? 'mais do que pagas hoje' : 'sem o desconto de adesão') : 'sem descontos temporários') + '</div></div>' +
      '<div class="dp-kpi"><div class="dp-kpi-l">Energia</div><div class="dp-kpi-v is-plain">' + ek[0] + '</div><div class="dp-kpi-s">' + ek[1] + '</div></div>' +
      '<div class="dp-kpi"><div class="dp-kpi-l">Potência</div><div class="dp-kpi-v is-plain">' + dec(r.p[0], 4) + '€</div><div class="dp-kpi-s">por dia, sem IVA</div></div>' +
      '<div class="dp-kpi"><div class="dp-kpi-l">' + (R.baseTua ? 'Face ao que pagas' : 'Face ao regulado') + '</div>' + poup + '</div>' +
      '</div>' +
      '<div class="dp-c-cta">' + cta + '<span class="dp-kpi-s">' + (idxd ? 'Preço varia com o mercado' : (o.du ? 'Contrato de ' + meses(o.du) : '&nbsp;')) + '</span></div></div>';
    if (aberto) h += detalhe(o, r, R);
    return h + '<button type="button" class="dp-c-toggle" data-toggle>' + (aberto ? 'Menos detalhes' : 'Ver as contas e as condições') + CARET + '</button></div>';
  }
  function detalhe(o, r, R) {
    var c = R.c, f = S.f, fl = String(o.f || ''), kwhAno = Math.round(c.kwh);
    var kv = function (a, b) { return '<div class="dp-kv"><span>' + a + '</span><span>' + b + '</span></div>'; };
    var a = function (u, t) { u = url(u); return u ? '<a href="' + u + '" target="_blank" rel="nofollow noopener" data-stop>' + t + '</a>' : ''; };
    var linhas = '<table class="dp-sub"><thead><tr><th>Parcela</th><th class="num">Por ano</th></tr></thead><tbody>' +
      '<tr><td>Energia (' + milhar(String(kwhAno)) + ' kWh)</td><td class="num">' + eur(r.energia) + '</td></tr>' +
      '<tr><td>Potência contratada (' + potTxt(pots()[c.pot]) + ')</td><td class="num">' + eur(r.potencia) + '</td></tr>' +
      '<tr><td>Imposto especial de consumo' + (f.social ? ' (isento)' : '') + '</td><td class="num">' + eur(r.iec) + '</td></tr>' +
      '<tr><td>Contribuição audiovisual' + (f.social ? ' (reduzida)' : '') + '</td><td class="num">' + eur(r.cav) + '</td></tr>' +
      '<tr><td>Taxa de exploração da DGEG</td><td class="num">' + eur(r.dgeg) + '</td></tr>' +
      '<tr><td>IVA</td><td class="num">' + eur(r.iva) + '</td></tr>' +
      (r.serv ? '<tr><td>Serviços adicionais obrigatórios</td><td class="num">' + eur(r.serv) + '</td></tr>' : '') +
      (r.reemb ? '<tr><td>Descontos e reembolsos</td><td class="num">-' + eur(r.reemb) + '</td></tr>' : '') +
      (r.dNovo ? '<tr><td>Desconto de novo cliente (só no 1.º ano)</td><td class="num">-' + eur(r.dNovo) + '</td></tr>' : '') +
      '<tr class="is-on"><td>Total no 1.º ano</td><td class="num">' + eur(r.total) + '</td></tr></tbody></table>';
    var ops = '';
    ['s', 'b', 't'].forEach(function (k) {
      var x = conta(o, c, true, k);
      if (!x) return;
      var pr = k === 's' ? dec(x.p[1], 4) + '€' : k === 'b' ? dec(x.p[1], 4) + '€ · ' + dec(x.p[2], 4) + '€' : dec(x.p[1], 4) + '€ · ' + dec(x.p[2], 4) + '€ · ' + dec(x.p[3], 4) + '€';
      ops += '<tr' + (k === r.k ? ' class="is-on"' : '') + '><td>' + TARIFAS[k] + '</td><td>' + pr + '</td><td class="num">' + dec(x.p[0], 4) + '€</td><td class="num">' + eur(x.mes) + '</td></tr>';
    });
    var tabOps = '<div class="dp-h">Esta oferta em cada tarifa, para ' + potTxt(pots()[c.pot]) + '</div><table class="dp-sub el-ops"><thead><tr><th>Tarifa</th><th>Energia por kWh</th><th class="num">Potência por dia</th><th class="num">Fatura por mês</th></tr></thead><tbody>' + ops + '</tbody></table>' +
      '<p class="el-mini">Preços sem IVA. Na bi-horária: fora de vazio e vazio. Na tri-horária: ponta, cheias e vazio.</p>';
    var cond = kv('Tipo de preço', o.c === 'TUR' ? 'Regulado pela ERSE' : (fl.charAt(3) === '1' ? 'Indexado ao mercado grossista' : 'Fixo')) +
      kv('Fidelização', fl.charAt(0) === '1' ? 'Sim' : 'Não') +
      kv('Duração do contrato', o.du ? meses(o.du) : 'Não indicada') +
      kv('Pagamento', esc(lista(o.pg, ['débito direto', 'multibanco', 'outros meios']))) +
      kv('Fatura', esc(lista(o.ft, ['eletrónica', 'em papel'], ' ou '))) +
      (o.tfa ? kv('Faturação', esc(o.tfa)) : '') +
      kv('Contratação', esc(lista(o.ct, ['online', 'presencial', 'por telefone']))) +
      kv('Atendimento', esc(lista(o.at, ['por escrito', 'presencial', 'telefónico', 'online']))) +
      kv('Energia 100% renovável', fl.charAt(1) === '1' ? 'Sim' : 'Não') +
      (o.m ? kv('Modalidade', esc(o.m)) : '') +
      (o.tel ? kv('Telefone comercial', esc(o.tel)) : '') +
      (o.src === 'site' ? kv('Preços lidos no site', esc(o.ini || '')) : (o.ini || o.fim ? kv('Validade dos preços', esc((o.ini ? 'de ' + o.ini + ' ' : '') + (o.fim ? 'até ' + o.fim : ''))) : ''));
    var docs = [a(o.fp, 'Ficha padronizada'), a(o.cg, 'Condições gerais'), a(o.ce, 'Contratar online')].filter(Boolean);
    if (docs.length) cond += kv('Documentos', docs.join(' · '));
    var notas = [];
    if (o.src === 'site') notas.push('<b>Fonte.</b> Esta oferta está em vigor mas ainda não aparece no ficheiro da ERSE. Os preços foram lidos no site do comercializador.');
    if (fl.charAt(3) === '1') notas.push('<b>Preço indexado.</b> O valor mostrado é uma estimativa da ERSE com base no preço esperado do mercado grossista. A fatura real sobe e desce com o mercado.');
    if (o.to) notas.push('<b>A oferta.</b> ' + esc(o.to));
    if (fl.charAt(0) === '1' && o.tfi) notas.push('<b>Fidelização.</b> ' + esc(o.tfi));
    if (o.tr || o.dr) notas.push('<b>Condições de acesso.</b> ' + esc([o.tr, o.dr].filter(Boolean).join(' ')));
    if (o.ts || o.tos) notas.push('<b>Serviços adicionais.</b> ' + esc([o.ts, o.tos].filter(Boolean).join(' ')));
    if (o.trb) notas.push('<b>Descontos e reembolsos.</b> ' + esc(o.trb));
    if (o.ob) notas.push('<b>Outros benefícios.</b> ' + esc(o.ob));
    if (o.tap) notas.push('<b>Atualização de preços.</b> ' + esc(o.tap));
    return '<div class="dp-c-detail"><div class="dp-detail-grid"><div><div class="dp-h">Como se chega a ' + eur(r.total) + ' no 1.º ano</div>' + linhas + tabOps +
      '</div><div><div class="dp-h">Condições</div>' + cond + '</div></div>' +
      (notas.length ? '<div class="dp-h el-h-notas">' + (o.src === 'site' ? 'O que o comercializador indica no site' : 'O que o comercializador comunicou à ERSE') + '</div><ul class="dp-notes el-notas"><li>' + notas.join('</li><li>') + '</li></ul>' : '') + '</div>';
  }
  function vRes() {
    if (S.motorErro) { S.R = null; return '<div class="dp-empty">Não foi possível carregar os preços. Atualiza a página dentro de momentos.</div>'; }
    if (!S.motor) { S.R = null; return '<div class="dp-empty">A carregar os preços...</div>'; }
    var R = S.R = calcular(), f = S.f, d = dados();
    var chips = FILTROS.map(function (x) { return '<button type="button" class="dp-chip' + (S.on[x.k] ? ' is-on' : '') + '" data-f="' + x.k + '">' + ico(IC[x.i]) + esc(x.l) + '</button>'; }).join('') +
      '<button type="button" class="dp-chip' + (S.cond ? ' is-on' : '') + '" data-cond>' + ico(IC.usr) + 'Incluir ofertas com condições de acesso' + (!S.cond && R.nCond ? ' (' + R.nCond + ')' : '') + '</button>' +
      '<button type="button" class="dp-chip' + (S.idx ? ' is-on' : '') + '" data-idx>' + ico(IC.wave) + 'Incluir tarifas indexadas' + (!S.idx && R.nIdx ? ' (' + R.nIdx + ')' : '') + '</button>';
    var bar = '<div class="dp-bar"><div class="dp-chips">' + chips + '</div></div>';
    if (R.vazio) return bar + '<div class="dp-empty">Carrega a fatura ou escreve quanto pagas por mês para veres onde pagas menos.</div>';
    var h = '', m1 = R.melhor1, m2 = R.melhor2;
    /* Veredicto: a resposta numa frase */
    if (m1) {
      var promo1 = m1.depois - m1.ano1 > 6, dm = R.base != null ? R.base - m1.ano1 : null;
      h += '<div class="ft-veredicto">';
      if (R.baseTua && dm >= 12) h += '<p class="ft-v-t">Podes poupar <span>' + eurInt(dm) + (promo1 ? ' no 1.º ano' : ' por ano') + '</span></p><p class="ft-v-s">A mais barata para ti é a ' + esc(nome(m1.o.c)) + ': ' + eur(m1.ano1 / 12) + ' por mês, em vez de ' + eur(R.base / 12) + '.' +
        (promo1 && m2 && m2 !== m1 ? ' Sem contar com descontos temporários, é a ' + esc(nome(m2.o.c)) + ': ' + eur(m2.depois / 12) + ' por mês.' : '') + '</p>';
      else if (R.baseTua) h += '<p class="ft-v-t">Já pagas um bom preço</p><p class="ft-v-s">A oferta mais barata desta lista fica em ' + eur(m1.ano1 / 12) + ' por mês e tu pagas ' + eur(R.base / 12) + '.</p>';
      else h += '<p class="ft-v-t">A mais barata para ti é a ' + esc(nome(m1.o.c)) + '</p><p class="ft-v-s">' + eur(m1.ano1 / 12) + ' por mês' + (promo1 ? ' no 1.º ano' : '') + '. Escreve quanto pagas hoje para veres a poupança.</p>';
      h += '<p class="ft-v-n">Contas para ' + milhar(String(Math.round(R.c.kwh / 12))) + ' kWh por mês, ' + potTxt(pots()[f.pot]) + ' e tarifa ' + TARIFAS[f.tarifa].toLowerCase() + (f.social ? ', com tarifa social' : '') + '.' +
        (R.estimado ? ' O consumo foi estimado pelo valor que pagas: com os kWh ou com a fatura, as contas ficam exatas.' : '') + '</p></div>';
    }
    h += bar;
    var lst = R.lista, vis = lst.slice(0, S.visiveis);
    h += '<div class="dp-mk"><b>' + R.n + '</b> ofertas de <b>' + R.coms.length + '</b> comercializadores' +
      (m1 ? '<span class="dp-mk-sep">·</span>Mais barata no 1.º ano: <b>' + esc(nome(m1.o.c)) + '</b>, ' + eur(m1.ano1 / 12) : '') +
      (m2 ? '<span class="dp-mk-sep">·</span>Mais barata sem descontos: <b>' + esc(nome(m2.o.c)) + '</b>, ' + eur(m2.depois / 12) : '') + '</div>';
    var comOpts = op('', S.filtroCom, 'Todos os comercializadores') + R.coms.slice().sort(function (a, b) { return nome(a).localeCompare(nome(b), 'pt'); }).map(function (k) { return op(k, S.filtroCom, esc(nome(k))); }).join('');
    if (S.filtroCom && R.coms.indexOf(S.filtroCom) < 0) comOpts += op(S.filtroCom, S.filtroCom, esc(nome(S.filtroCom)));
    h += '<div class="el-ctl"><span class="dp-count">' + lst.length + (lst.length === 1 ? ' resultado' : ' resultados') + '</span><div class="el-ctl-r">' +
      '<select class="dp-select" id="ftVer" aria-label="O que mostrar"' + (S.filtroCom ? ' disabled' : '') + '>' + op('melhor', S.filtroCom ? 'todas' : S.ver, 'A melhor oferta de cada empresa') + op('todas', S.filtroCom ? 'todas' : S.ver, 'Todas as ofertas') + '</select>' +
      '<select class="dp-select" id="ftFiltroCom" aria-label="Comercializador">' + comOpts + '</select>' +
      '<select class="dp-select" id="ftOrdem" aria-label="Ordenar por">' + op('ano1', S.ordem, 'Mais barata no 1.º ano') + op('depois', S.ordem, 'Mais barata sem descontos') + op('energia', S.ordem, 'Energia mais barata') + op('potencia', S.ordem, 'Potência mais barata') + '</select>' +
      '</div></div>';
    if (!lst.length) h += '<div class="dp-empty">' + (f.social && f.pot > 5 ? 'A tarifa social só existe para potências contratadas até 6,9 kVA.' : 'Nenhuma oferta cumpre estes filtros para ' + potTxt(pots()[f.pot]) + ' em tarifa ' + TARIFAS[f.tarifa].toLowerCase() + '. Tira um filtro ou muda a tarifa.') + '</div>';
    else { h += '<div class="dp-cards">'; vis.forEach(function (it, i) { h += cartao(it, i, R); }); h += '</div>'; }
    if (lst.length > vis.length) h += '<div class="dp-more"><button type="button" class="dp-btn is-secondary" id="ftMais">Mostrar mais ' + Math.min(10, lst.length - vis.length) + ' de ' + (lst.length - vis.length) + '</button></div>';
    h += '<p class="dp-foot">Preços das ofertas de eletricidade para clientes domésticos comunicadas pelos comercializadores à <a href="https://simuladorprecos.erse.pt/" target="_blank" rel="noopener">ERSE</a>' + (d && d.atualizado ? ', atualizados a ' + esc(d.atualizado.split('-').reverse().join('/')) : '') + ', para Portugal continental. ' +
      'A fatura inclui energia, potência, IVA, imposto especial de consumo, contribuição audiovisual e taxa de exploração da DGEG, para o mesmo consumo durante um ano. A fatura por mês é o total do ano a dividir por 12. ' +
      'O preço do 1.º ano conta com os descontos para novos clientes. O preço depois do 1.º ano é o da mesma oferta sem esses descontos. ' +
      'Por omissão ficam de fora as tarifas indexadas, porque o preço muda com o mercado, e as ofertas com condições de acesso, que exigem ser sócio ou cliente de outra empresa. Confirma sempre as condições no site do comercializador antes de mudares.</p>';
    return h;
  }

  /* ---------- Render ---------- */
  function renderForm() { var e = el('ftForm'); if (e) e.innerHTML = vForm(); }
  function renderRes() {
    var e = el('ftRes'); if (e) e.innerHTML = vRes();
    var a = el('ftKwhAjuda'); if (a) a.innerHTML = ajudaKwh(S.R);
  }
  function refocus(id) {
    var e = el(id);
    if (e && e.focus) { e.focus(); if (e.setSelectionRange && e.value) e.setSelectionRange(e.value.length, e.value.length); }
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('#lf-ft') || t.closest('[data-stop]')) return;
    if (t.closest('[data-up]')) { var inp = el('ftFicheiro'); if (inp) inp.click(); return; }
    var a = t.closest('[data-tarifa]');
    if (a) { S.f.tarifa = a.getAttribute('data-tarifa'); S.visiveis = 10; renderForm(); renderRes(); return; }
    if (t.closest('[data-fam]')) { S.f.fam = !S.f.fam; renderForm(); renderRes(); return; }
    if (t.closest('[data-social]')) { S.f.social = !S.f.social; S.visiveis = 10; renderForm(); renderRes(); return; }
    if (t.closest('[data-cond]')) { S.cond = !S.cond; S.visiveis = 10; renderRes(); return; }
    if (t.closest('[data-idx]')) { S.idx = !S.idx; S.visiveis = 10; renderRes(); return; }
    var c = t.closest('[data-f]');
    if (c) { var k = c.getAttribute('data-f'); if (S.on[k]) delete S.on[k]; else S.on[k] = true; S.visiveis = 10; renderRes(); return; }
    if (t.closest('#ftMais')) { S.visiveis += 10; renderRes(); return; }
    var g = t.closest('[data-toggle]');
    if (g) { var id = g.closest('.dp-c').getAttribute('data-id'); S.open = S.open === id ? null : id; renderRes(); }
  });
  document.addEventListener('input', function (e) {
    var id = e.target && e.target.id;
    if (id !== 'ftEur' && id !== 'ftKwh') return;
    var raw = String(e.target.value).replace(/[^\d,.]/g, '');
    e.target.value = raw;
    S.f[id === 'ftEur' ? 'eur' : 'kwh'] = raw;
    clearTimeout(window.__ftT);
    window.__ftT = setTimeout(function () { S.visiveis = 10; renderRes(); }, 400);
  });
  document.addEventListener('change', function (e) {
    var t = e.target, id = t && t.id, v = t && t.value;
    if (!t || !t.closest || !t.closest('#lf-ft')) return;
    if (id === 'ftFicheiro') { if (t.files && t.files[0]) lerFicheiro(t.files[0]); return; }
    if (id === 'ftPot') { S.f.pot = parseInt(v, 10) || 0; S.visiveis = 10; renderRes(); }
    else if (id === 'ftCom') { S.f.com = v; renderRes(); }
    else if (id === 'ftVazio') { S.f.vazio = parseInt(v, 10) || 40; renderRes(); }
    else if (id === 'ftPonta') { S.f.ponta = parseInt(v, 10) || 20; renderRes(); }
    else if (id === 'ftVer') { S.ver = v; S.visiveis = 10; renderRes(); }
    else if (id === 'ftFiltroCom') { S.filtroCom = v; S.visiveis = 10; renderRes(); }
    else if (id === 'ftOrdem') { S.ordem = v; S.visiveis = 10; renderRes(); }
  });
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && t && t.closest && t.closest('[data-up]')) { e.preventDefault(); var inp = el('ftFicheiro'); if (inp) inp.click(); }
  });
  /* Largar o ficheiro em cima da pagina tambem funciona */
  document.addEventListener('dragover', function (e) { if (!S.lendo && el('lf-ft')) e.preventDefault(); });
  document.addEventListener('drop', function (e) {
    if (S.lendo || !el('lf-ft') || !e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files[0]) return;
    e.preventDefault(); lerFicheiro(e.dataTransfer.files[0]);
  });

  /* ---------- Arranque ---------- */
  /* O design system dos comparadores esta escrito para "#lf-dp": le-se o CSS e aplica-se a esta pagina com "#lf-ft" */
  function carregarCss() {
    if (!window.fetch) return;
    Promise.all(CSS.map(function (u) { return fetch(u + '?d=' + HOJE).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }); })).then(function (t) {
      var st = document.createElement('style');
      st.textContent = t.join('\n').replace(/#lf-dp/g, '#lf-ft');
      document.head.insertBefore(st, document.head.firstChild);
      var root = el('lf-ft'); if (root) root.classList.add('is-pronto');
    });
    setTimeout(function () { var root = el('lf-ft'); if (root) root.classList.add('is-pronto'); }, 4000);
  }
  function carregarMotor() {
    var dp = el('lf-dp');
    if (!dp) { dp = document.createElement('div'); dp.id = 'lf-dp'; document.body.appendChild(dp); }
    dp.style.display = 'none'; dp.setAttribute('aria-hidden', 'true');
    var s = document.createElement('script');
    s.src = MOTOR + '?d=' + HOJE;
    s.onerror = function () { S.motorErro = true; renderRes(); };
    document.body.appendChild(s);
    var n = 0, t = setInterval(function () {
      var st = window.__lfElState;
      if (st && st.data && window.__lfElCalc) { clearInterval(t); S.motor = true; var foco = document.activeElement && document.activeElement.id; renderForm(); renderRes(); if (foco === 'ftEur' || foco === 'ftKwh') refocus(foco); }
      else if ((st && st.erro) || ++n > 150) { clearInterval(t); S.motorErro = true; renderRes(); }
    }, 200);
  }
  function montar() {
    var root = el('lf-ft');
    if (!root) {
      var h1 = document.querySelector('h1.heading-style-h2') || document.querySelector('h1');
      root = document.createElement('div'); root.id = 'lf-ft';
      if (h1 && h1.parentNode) h1.parentNode.appendChild(root); else return;
    }
    root.innerHTML = '<div id="ftForm"></div><div id="ftRes"></div>';
    renderForm(); renderRes();
    carregarCss(); carregarMotor();
  }
  window.__lfFtTeste = { S: S, aplicarLeitura: aplicarLeitura, calcular: calcular, renderForm: renderForm, renderRes: renderRes }; /* exposto para testes */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();
