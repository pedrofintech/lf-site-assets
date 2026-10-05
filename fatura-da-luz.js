/* Fatura da luz - literaciafinanceira.pt
   Pagina simples: carregas a fatura (PDF ou fotografia) ou preenches os dados a mao, e ves onde pagas menos.
   Precos e contas: os mesmos do comparador de eletricidade. O script desse comparador (repositorio comparador-eletricidade)
   e carregado aqui dentro de um #lf-dp escondido, e esta pagina usa o que ele expoe: window.__lfElCalc e window.__lfElState.
   Leitura da fatura: Worker "lf-fatura" (worker-ler-fatura.js neste repositorio), que pede a leitura a um modelo de AI
   e devolve os campos em JSON. A fatura nao fica guardada.
   Configuracao opcional antes deste script: window.__lfFtApi (URL do Worker) e window.__lfFtMotor (URL do script do comparador). */
(function () {
  'use strict';
  if (window.__lfFtInit) return;
  window.__lfFtInit = true;

  var MOTOR = window.__lfFtMotor || 'https://franklinsilvapt-arch.github.io/comparador-eletricidade/comparador-eletricidade/comparador-eletricidade.js';
  var API = window.__lfFtApi || 'https://lf-fatura.success-f03.workers.dev/';
  var LOGOS = MOTOR.replace(/[^\/]*$/, '') + 'logos/';
  var POTS0 = [1.15, 2.3, 3.45, 4.6, 5.75, 6.9, 10.35, 13.8, 17.25, 20.7, 27.6, 34.5, 41.4];
  var MAX_MB = 8;

  var NOMES = {
    TUR: 'SU Eletricidade', ALFAENERGIA: 'Alfa Energia', AUDAX: 'Audax', COOP: 'Coopérnico', EDPC: 'EDP', END: 'Endesa',
    ENIPLENITUDE: 'Plenitude', EZUENERGIA: 'EZU Energia', GALP: 'Galp', GOLD: 'Goldenergy', IBD: 'Iberdrola', IBELECTRA: 'Ibelectra',
    JAFPLUS: 'JAFplus', LUZBOA: 'Luzboa', LUZIGAS: 'Luzigás', MEOENERGIA: 'MEO Energia', NABALIAENERGIA: 'Nabalia Energia',
    NOSSAENERGIA: 'Nossa Energia', OENEO: 'Oeneo', PORTULOGOS: 'Portulogos', REPSOL: 'Repsol', YESENERGY: 'Yes Energy', G9: 'G9', ROCKWATT: 'Rockwatt'
  };
  var TARIFAS = { s: 'Simples', b: 'Bi-horária', t: 'Tri-horária' };

  function novoForm() { return { origem: 'manual', eur: '', kwh: '', pot: 2, tarifa: 's', vazio: '40', ponta: '20', dias: '30', total: '', com: '', comNome: '', leitura: '', gas: false }; }
  var S = { passo: 'inicio', motor: false, motorErro: false, erro: '', aviso: '', f: novoForm(), ordem: 'ano1', visiveis: 5, res: null };

  /* ---------- Helpers ---------- */
  function esc(a) { return String(a == null ? '' : a).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function milhar(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function eur(v) { var p = Math.abs(v).toFixed(2).split('.'); return (v < 0 ? '-' : '') + milhar(p[0]) + ',' + p[1] + '€'; }
  function eurInt(v) { return milhar(String(Math.round(Math.abs(v)))) + '€'; }
  /* Numero escrito a portuguesa ("1.234,5") ou com ponto decimal */
  function num(t) {
    t = String(t == null ? '' : t).replace(/[^\d.,]/g, '');
    if (t.indexOf(',') > -1) t = t.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(t);
    return isNaN(n) ? 0 : n;
  }
  function txtNum(n, casas) { return n == null || isNaN(n) ? '' : String(Math.round(n * Math.pow(10, casas || 0)) / Math.pow(10, casas || 0)).replace('.', ','); }
  function potTxt(p) { return String(p).replace('.', ',') + ' kVA'; }
  function dados() { return window.__lfElState && window.__lfElState.data; }
  function pots() { var d = dados(); return (d && d.pots && d.pots.length) ? d.pots : POTS0; }
  function nome(c) { var d = dados(); return NOMES[c] || (d && d.nomes && d.nomes[c]) || c; }
  function ico(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
  var IC = {
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3"/>',
    lapis: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    out: '<path d="M7 17 17 7M7 7h10v10"/>'
  };

  /* ---------- Contas (motor do comparador de eletricidade) ---------- */
  function conta(o, c, novo) { return window.__lfElCalc(o, c.pot, c.kwh, c.vz, novo, c.tarifa, c.pt, false, false); }
  /* Quem so sabe quanto paga: consumo anual que da essa fatura aos precos do mercado regulado (a mesma regra do comparador) */
  function kwhDeEuros(eurMes, pot) {
    var d = dados(), tur = null;
    for (var i = 0; i < d.ofertas.length; i++) if (d.ofertas[i].c === 'TUR') { tur = d.ofertas[i]; break; }
    if (!tur) return null;
    function total(k) {
      var r = window.__lfElCalc(tur, pot, k, 0.4, false, 's', 0.2, false, false) || window.__lfElCalc(tur, pot, k, 0.4, false, 't', 0.2, false, false);
      return r ? r.total : null;
    }
    var alvo = eurMes * 12, a = 0, b = 250000;
    if (total(400) === null) return null;
    if (alvo <= total(400)) return 400;
    for (var n = 0; n < 50; n++) { var m = (a + b) / 2; if (total(m) < alvo) a = m; else b = m; }
    return (a + b) / 2;
  }

  function calcular() {
    var f = S.f, d = dados();
    var c = { pot: f.pot, tarifa: f.tarifa, vz: f.tarifa === 's' ? 0.4 : Math.min(0.95, Math.max(0.05, num(f.vazio) / 100)), pt: Math.min(0.6, Math.max(0.05, num(f.ponta) / 100)) };
    var atualAno = null, kwhAno = 0, estimado = false;
    if (f.origem === 'fatura') {
      var dias = Math.min(400, Math.max(1, num(f.dias) || 30));
      kwhAno = num(f.kwh) / dias * 365;
      if (num(f.total) > 0) atualAno = num(f.total) / dias * 365;
    } else {
      if (num(f.eur) > 0) atualAno = num(f.eur) * 12;
      if (num(f.kwh) > 0) kwhAno = num(f.kwh) * 12;
      else if (atualAno) { kwhAno = kwhDeEuros(num(f.eur), f.pot) || 0; estimado = true; }
    }
    if (!(kwhAno > 0)) return { erro: f.origem === 'fatura' ? 'Falta o consumo em kWh desta fatura.' : 'Diz-nos quanto pagas por mês ou quantos kWh gastas.' };
    c.kwh = kwhAno;
    var chave = S.ordem === 'depois' ? 'depois' : 'ano1', porCom = {}, n = 0;
    d.ofertas.forEach(function (o) {
      var fl = String(o.f || '');
      if (fl.charAt(3) === '1' || fl.charAt(2) === '1') return;            /* indexadas e ofertas com condicoes de acesso ficam de fora */
      if (f.com && o.c === f.com && fl.charAt(7) === '1') return;          /* so para novos clientes, e a pessoa ja e cliente dessa empresa */
      var r1 = conta(o, c, true), r2 = conta(o, c, false);
      if (!r1 || !r2) return;
      n++;
      var it = { o: o, ano1: r1.total, depois: r2.total };
      if (!porCom[o.c] || it[chave] < porCom[o.c][chave]) porCom[o.c] = it;
    });
    var lista = Object.keys(porCom).map(function (k) { return porCom[k]; }).sort(function (a, b) { return a[chave] - b[chave] || a.ano1 - b.ano1; });
    if (!lista.length) return { erro: 'Não há ofertas para ' + potTxt(pots()[f.pot]) + ' em tarifa ' + TARIFAS[f.tarifa].toLowerCase() + '. Confirma a potência e a tarifa.' };
    return { lista: lista, n: n, kwhAno: kwhAno, atualAno: atualAno, estimado: estimado, chave: chave };
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
    naofatura: 'Isto não parece uma fatura de eletricidade. Experimenta outro ficheiro ou preenche à mão.',
    limite: 'Há muitos pedidos neste momento. Tenta daqui a um minuto ou preenche à mão.'
  };
  function lerFicheiro(file) {
    S.passo = 'ler'; S.erro = ''; S.aviso = ''; render();
    preparar(file).then(function (p) {
      var ctl = window.AbortController ? new AbortController() : null;
      if (ctl) setTimeout(function () { ctl.abort(); }, 90000);
      return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p), signal: ctl ? ctl.signal : undefined });
    }).then(function (r) {
      return r.json().then(function (j) { if (!r.ok || !j || j.erro) throw new Error((j && j.erro) || 'servico'); return j; });
    }).then(function (j) {
      if (j.e_fatura_eletricidade === false) throw new Error('naofatura');
      aplicarLeitura(j); S.passo = 'confirmar'; render();
    }).catch(function (e) {
      var k = e && e.message;
      S.f = novoForm(); S.passo = 'manual';
      S.erro = ERROS[k] || 'Não conseguimos ler a fatura agora. Preenche os dados à mão, demora menos de um minuto.';
      render();
    });
  }
  /* Passa a resposta do Worker para o formulario, so com valores plausiveis */
  function aplicarLeitura(j) {
    var f = novoForm(), ps = pots(), i, melhor = -1, dist = 9;
    f.origem = 'fatura';
    var p = Number(j.potencia_kva);
    if (p > 0) for (i = 0; i < ps.length; i++) if (Math.abs(ps[i] - p) < dist) { dist = Math.abs(ps[i] - p); melhor = i; }
    f.pot = melhor > -1 && dist < 0.06 ? melhor : -1;
    f.tarifa = { simples: 's', 'bi-horaria': 'b', 'tri-horaria': 't' }[String(j.opcao_horaria || '').toLowerCase()] || 's';
    var kwh = Number(j.kwh_total) > 0 ? Number(j.kwh_total) : 0, vz = Number(j.kwh_vazio) > 0 ? Number(j.kwh_vazio) : 0, pt = Number(j.kwh_ponta) > 0 ? Number(j.kwh_ponta) : 0;
    f.kwh = kwh > 0 && kwh < 100000 ? txtNum(kwh, 0) : '';
    if (kwh > 0 && vz > 0 && vz < kwh) f.vazio = txtNum(vz / kwh * 100, 0);
    if (kwh > 0 && pt > 0 && pt < kwh) f.ponta = txtNum(pt / kwh * 100, 0);
    var dias = Number(j.dias);
    f.dias = dias >= 1 && dias <= 400 ? txtNum(dias, 0) : '';
    var tot = Number(j.total_eletricidade_eur) > 0 ? Number(j.total_eletricidade_eur) : Number(j.total_fatura_eur);
    f.total = tot > 0 && tot < 20000 ? txtNum(tot, 2) : '';
    f.com = NOMES[j.comercializador] ? j.comercializador : '';
    f.comNome = String(j.comercializador_nome || '').slice(0, 60);
    f.leitura = String(j.leitura || '');
    f.gas = !!j.tem_gas;
    S.f = f;
  }

  /* ---------- Ecras ---------- */
  function campo(id, rotulo, ctl, ajuda) {
    return '<div class="ft-campo"><label class="form_label" for="' + id + '">' + rotulo + '</label>' + ctl + (ajuda ? '<p class="ft-ajuda">' + ajuda + '</p>' : '') + '</div>';
  }
  function entrada(id, valor, sufixo, modo) {
    return '<div class="ft-in"><input id="' + id + '" class="form_input is-normal" type="text" inputmode="' + (modo || 'decimal') + '" autocomplete="off" value="' + esc(valor) + '"><span class="ft-suf">' + sufixo + '</span></div>';
  }
  function escolha(id, opcoes, atual) {
    return '<select id="' + id + '" class="form_input is-normal ft-sel">' + opcoes.map(function (o) {
      return '<option value="' + o[0] + '"' + (String(o[0]) === String(atual) ? ' selected' : '') + '>' + o[1] + '</option>';
    }).join('') + '</select>';
  }
  function campoPot() {
    var ops = pots().map(function (p, i) { return [i, potTxt(p)]; });
    if (S.f.pot < 0) ops.unshift([-1, 'Escolhe a potência']);
    return campo('ftPot', 'Potência contratada', escolha('ftPot', ops, S.f.pot), 'Está na fatura. As mais comuns são 3,45 e 6,9 kVA.');
  }
  function camposTarifa() {
    var f = S.f, h = campo('ftTarifa', 'Tarifa', escolha('ftTarifa', [['s', 'Simples'], ['b', 'Bi-horária'], ['t', 'Tri-horária']], f.tarifa), f.origem === 'manual' ? 'Na dúvida, deixa Simples.' : '');
    if (f.tarifa !== 's') h += campo('ftVazio', 'Quanto do consumo é em vazio?', entrada('ftVazio', f.vazio, '%', 'numeric'), 'O vazio é à noite e, no ciclo semanal, ao fim de semana.');
    if (f.tarifa === 't') h += campo('ftPonta', 'E em ponta?', entrada('ftPonta', f.ponta, '%', 'numeric'), '');
    return h;
  }
  function botoes(txt) {
    return '<div class="ft-acoes"><a href="#" class="button is-form-submit w-button" data-ft="ver">' + txt + '</a><button type="button" class="ft-link" data-ft="inicio">Voltar ao início</button></div>';
  }

  function vInicio() {
    return '<div class="ft-esc">' +
      '<button type="button" class="ft-op" data-ft="carregar">' + ico(IC.doc) + '<span class="ft-op-t">Carregar a fatura</span><span class="ft-op-s">PDF ou fotografia. Lemos a potência, o consumo e o valor por ti.</span></button>' +
      '<button type="button" class="ft-op" data-ft="manual">' + ico(IC.lapis) + '<span class="ft-op-t">Preencher à mão</span><span class="ft-op-s">Dois campos chegam: quanto pagas e a potência.</span></button>' +
      '</div>' +
      '<input type="file" id="ftFicheiro" accept="application/pdf,image/*" hidden>' +
      '<p class="ft-nota">Sem registo e sem email. A fatura serve só para ler os números e não fica guardada.</p>';
  }
  function vLer() {
    return '<div class="ft-caixa ft-centro"><div class="ft-roda" aria-hidden="true"></div><p class="ft-t">A ler a tua fatura...</p><p class="ft-ajuda">Costuma demorar entre 5 e 20 segundos.</p></div>';
  }
  function vManual() {
    var f = S.f;
    return '<div class="ft-caixa">' + (S.erro ? '<p class="ft-erro">' + esc(S.erro) + '</p>' : '') +
      campo('ftEur', 'Quanto pagas de luz por mês?', entrada('ftEur', f.eur, '€'), 'O valor habitual da tua fatura.') +
      campoPot() +
      campo('ftKwh', 'Quantos kWh gastas por mês?', entrada('ftKwh', f.kwh, 'kWh'), 'Opcional. Se deixares vazio, estimamos o consumo pelo valor que pagas.') +
      camposTarifa() + (S.aviso ? '<p class="ft-erro">' + esc(S.aviso) + '</p>' : '') + botoes('Ver onde pago menos') + '</div>';
  }
  function vConfirmar() {
    var f = S.f, quem = f.comNome || (f.com ? nome(f.com) : '');
    return '<div class="ft-caixa"><p class="ft-t">Lemos isto na tua fatura' + (quem ? ' da ' + esc(quem) : '') + '</p><p class="ft-ajuda ft-sub">Confirma os valores e corrige o que estiver errado.</p>' +
      campoPot() +
      '<div class="ft-duo">' + campo('ftKwh', 'Consumo desta fatura', entrada('ftKwh', f.kwh, 'kWh'), '') + campo('ftDias', 'Dias da fatura', entrada('ftDias', f.dias, 'dias', 'numeric'), '') + '</div>' +
      camposTarifa() +
      campo('ftTotal', 'Total da eletricidade nesta fatura', entrada('ftTotal', f.total, '€'), 'Com IVA.' + (f.gas ? ' A fatura também tem gás: põe só a parte da luz.' : '')) +
      (f.leitura === 'estimada' ? '<p class="ft-ajuda">O consumo desta fatura é uma estimativa do comercializador. Se tiveres uma fatura com leitura real, as contas ficam mais certas.</p>' : '') +
      (S.aviso ? '<p class="ft-erro">' + esc(S.aviso) + '</p>' : '') + botoes('Ver onde pago menos') + '</div>';
  }

  function avisos(o) {
    var fl = String(o.f || ''), t = [];
    if (o.c === 'TUR') t.push('Tarifa regulada');
    if (fl.charAt(0) === '1') t.push('Tem fidelização');
    if (fl.charAt(4) === '1') t.push('Inclui serviços pagos');
    if (o.pg === '100') t.push('Só com débito direto');
    if (o.ft && o.ft.charAt(1) !== '1') t.push('Só fatura eletrónica');
    if (o.src === 'site') t.push('Preço do site da empresa');
    return t;
  }
  function logo(c) {
    var n = nome(c), w = n.replace(/[^A-Za-zÀ-ÿ ]/g, '').split(' ').filter(Boolean);
    var ini = (w.length > 1 ? w[0].charAt(0) + w[1].charAt(0) : n.slice(0, 2)).toUpperCase();
    return '<span class="ft-logo"><span>' + esc(ini) + '</span><img src="' + LOGOS + c.toLowerCase().replace(/ /g, '') + '.png" alt="" loading="lazy" onload="this.className=\'is-on\'" onerror="this.remove()"></span>';
  }
  function cartao(it, i, R) {
    var o = it.o, n = nome(o.c), promo = it.depois - it.ano1 > 6, base = R.atualAno, h = '';
    var principal = R.chave === 'depois' ? it.depois : it.ano1;
    h += '<div class="ft-c' + (i === 0 ? ' is-top' : '') + '"><div class="ft-c-top">' + logo(o.c) + '<div class="ft-c-id"><div class="ft-c-n">' + esc(n) + '</div><div class="ft-c-o">' + esc(o.n || '') + '</div></div>' +
      '<div class="ft-c-p"><div class="ft-c-v">' + eur(principal / 12) + '</div><div class="ft-c-s">por mês' + (promo ? (R.chave === 'depois' ? ', sem descontos' : ', no 1.º ano') : '') + '</div></div></div>';
    if (promo) h += '<p class="ft-c-l">' + (R.chave === 'depois' ? 'No 1.º ano, com os descontos de adesão: <b>' + eur(it.ano1 / 12) + ' por mês</b>.' : 'Depois do 1.º ano, sem os descontos de adesão: <b>' + eur(it.depois / 12) + ' por mês</b>.') +
      (base != null && it.depois > base + 6 ? ' Fica mais cara do que pagas hoje.' : '') + '</p>';
    if (base != null) {
      var dif = base - principal;
      h += '<p class="ft-c-d' + (dif >= 6 ? ' is-pos' : '') + '">' + (dif >= 6 ? 'Poupas ' + eurInt(dif) + (promo && R.chave === 'ano1' ? ' no 1.º ano' : ' por ano') : dif <= -6 ? 'Pagas mais ' + eurInt(-dif) + ' por ano' : 'Pagas o mesmo que hoje') + '</p>';
    }
    var av = avisos(o);
    if (av.length) h += '<div class="ft-tags">' + av.map(function (a) { return '<span>' + a + '</span>'; }).join('') + '</div>';
    var u = /^https?:\/\//i.test(o.u || '') ? esc(o.u) : '';
    if (u) h += '<a class="button is-small w-button ft-cta" href="' + u + '" target="_blank" rel="nofollow noopener">Ir para a ' + esc(n) + ico(IC.out) + '</a>';
    return h + '</div>';
  }
  function vResultados() {
    var R = S.res, f = S.f, top = R.lista[0], base = R.atualAno, h = '';
    var kwhMes = Math.round(R.kwhAno / 12), val = R.chave === 'depois' ? top.depois : top.ano1;
    h += '<div class="ft-veredicto">';
    if (base != null && base - val >= 12) h += '<p class="ft-t">Podes poupar <span class="ft-verde">' + eurInt(base - val) + (R.chave === 'ano1' && top.depois - top.ano1 > 6 ? ' no 1.º ano' : ' por ano') + '</span></p><p class="ft-sub">A mais barata para ti é a ' + esc(nome(top.o.c)) + ': ' + eur(val / 12) + ' por mês, em vez de ' + eur(base / 12) + '.</p>';
    else if (base != null) h += '<p class="ft-t">Já pagas um bom preço</p><p class="ft-sub">A oferta mais barata desta lista fica em ' + eur(val / 12) + ' por mês e tu pagas ' + eur(base / 12) + '.</p>';
    else h += '<p class="ft-t">A mais barata para ti: ' + esc(nome(top.o.c)) + '</p><p class="ft-sub">' + eur(val / 12) + ' por mês.</p>';
    h += '<p class="ft-ajuda">Contas para ' + milhar(String(kwhMes)) + ' kWh por mês, ' + potTxt(pots()[f.pot]) + ' e tarifa ' + TARIFAS[f.tarifa].toLowerCase() + '.' +
      (R.estimado ? ' O consumo foi estimado pelo valor que pagas. Com os kWh ou com a fatura, as contas ficam exatas.' : '') + '</p></div>';
    h += '<div class="ft-ordem" role="group" aria-label="Ordenar"><button type="button" class="' + (R.chave === 'ano1' ? 'is-on' : '') + '" data-ordem="ano1">Mais barata no 1.º ano</button><button type="button" class="' + (R.chave === 'depois' ? 'is-on' : '') + '" data-ordem="depois">Mais barata sem descontos</button></div>';
    R.lista.slice(0, S.visiveis).forEach(function (it, i) { h += cartao(it, i, R); });
    if (R.lista.length > S.visiveis) h += '<button type="button" class="ft-mais" data-ft="mais">Ver mais ' + Math.min(5, R.lista.length - S.visiveis) + '</button>';
    var d = dados();
    h += '<p class="ft-nota">A melhor oferta de cada empresa, entre ' + R.n + ' ofertas de preço fixo que qualquer pessoa pode contratar. Ficam de fora as tarifas indexadas e as ofertas que exigem ser sócio ou cliente de outra empresa. ' +
      'Os valores incluem energia, potência, taxas e IVA, para o mesmo consumo durante um ano. Preços comunicados pelos comercializadores à ERSE' + (d && d.atualizado ? ', atualizados a ' + esc(d.atualizado.split('-').reverse().join('/')) : '') + '. Confirma as condições no site da empresa antes de mudares.</p>' +
      '<div class="ft-acoes"><button type="button" class="ft-link" data-ft="corrigir">Corrigir os dados</button><button type="button" class="ft-link" data-ft="inicio">Começar de novo</button></div>';
    return h;
  }

  function render() {
    var root = document.getElementById('lf-ft');
    if (!root) return;
    var h;
    if (S.motorErro) h = '<div class="ft-caixa ft-centro"><p class="ft-erro">Não foi possível carregar os preços. Atualiza a página dentro de momentos.</p></div>';
    else if (S.passo === 'inicio') h = vInicio();
    else if (S.passo === 'ler') h = vLer();
    else if (S.passo === 'manual') h = vManual();
    else if (S.passo === 'confirmar') h = vConfirmar();
    else h = vResultados();
    root.innerHTML = h;
  }

  /* ---------- Eventos ---------- */
  function guardar() {
    var f = S.f, g = function (id) { var e = document.getElementById(id); return e ? e.value : null; };
    ['Eur', 'Kwh', 'Vazio', 'Ponta', 'Dias', 'Total'].forEach(function (k) { var v = g('ft' + k); if (v !== null) f[k.toLowerCase()] = v; });
    var p = g('ftPot'); if (p !== null) f.pot = parseInt(p, 10);
    var t = g('ftTarifa'); if (t !== null) f.tarifa = t;
  }
  function verResultados() {
    guardar(); S.aviso = '';
    if (!(S.f.pot >= 0)) { S.aviso = 'Escolhe a potência contratada.'; render(); return; }
    if (!S.motor) { S.aviso = 'Os preços ainda estão a carregar. Tenta outra vez dentro de segundos.'; render(); return; }
    var r = calcular();
    if (r.erro) { S.aviso = r.erro; render(); return; }
    S.res = r; S.visiveis = 5; S.passo = 'resultados'; render();
    var root = document.getElementById('lf-ft');
    if (root && root.scrollIntoView) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('#lf-ft')) return;
    var b = t.closest('[data-ft]'), o = t.closest('[data-ordem]');
    if (o) { S.ordem = o.getAttribute('data-ordem'); var r = calcular(); if (!r.erro) S.res = r; render(); return; }
    if (!b) return;
    var a = b.getAttribute('data-ft');
    if (b.tagName === 'A') e.preventDefault();
    if (a === 'carregar') { var inp = document.getElementById('ftFicheiro'); if (inp) inp.click(); }
    else if (a === 'manual') { S.f = novoForm(); S.erro = ''; S.aviso = ''; S.passo = 'manual'; render(); }
    else if (a === 'inicio') { S.f = novoForm(); S.erro = ''; S.aviso = ''; S.res = null; S.passo = 'inicio'; render(); }
    else if (a === 'corrigir') { S.aviso = ''; S.passo = S.f.origem === 'fatura' ? 'confirmar' : 'manual'; render(); }
    else if (a === 'mais') { S.visiveis += 5; render(); }
    else if (a === 'ver') verResultados();
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || !t.closest || !t.closest('#lf-ft')) return;
    if (t.id === 'ftFicheiro') { if (t.files && t.files[0]) lerFicheiro(t.files[0]); return; }
    if (t.id === 'ftTarifa' || t.id === 'ftPot') { guardar(); render(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target && e.target.closest && e.target.closest('#lf-ft') && e.target.tagName === 'INPUT') { e.preventDefault(); verResultados(); }
  });
  /* Largar o ficheiro em cima da pagina tambem funciona */
  document.addEventListener('dragover', function (e) { if (S.passo === 'inicio') e.preventDefault(); });
  document.addEventListener('drop', function (e) {
    if (S.passo !== 'inicio' || !e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files[0]) return;
    e.preventDefault(); lerFicheiro(e.dataTransfer.files[0]);
  });

  /* ---------- Arranque ---------- */
  function carregarMotor() {
    var dp = document.getElementById('lf-dp');
    if (!dp) { dp = document.createElement('div'); dp.id = 'lf-dp'; document.body.appendChild(dp); }
    dp.style.display = 'none'; dp.setAttribute('aria-hidden', 'true');
    var s = document.createElement('script');
    s.src = MOTOR + '?d=' + new Date().toISOString().slice(0, 10);
    s.onerror = function () { S.motorErro = true; render(); };
    document.body.appendChild(s);
    var n = 0, t = setInterval(function () {
      var st = window.__lfElState;
      if (st && st.data && window.__lfElCalc) { clearInterval(t); S.motor = true; }
      else if ((st && st.erro) || ++n > 150) { clearInterval(t); S.motorErro = true; render(); }
    }, 200);
  }
  function montar() {
    if (!document.getElementById('lf-ft')) {
      var h1 = document.querySelector('h1.heading-style-h2') || document.querySelector('h1'), div = document.createElement('div');
      div.id = 'lf-ft';
      if (h1 && h1.parentNode) h1.parentNode.appendChild(div); else return;
    }
    render();
    carregarMotor();
  }
  window.__lfFtTeste = { S: S, aplicarLeitura: aplicarLeitura, calcular: calcular, render: render, verResultados: verResultados }; /* exposto para testes */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();
