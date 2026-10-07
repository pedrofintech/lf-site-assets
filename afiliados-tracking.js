/*
 * Tracking de cliques em links de afiliado, com valor por parceiro.
 *
 * Envia para o GA4 o evento "affiliate_click" sempre que alguem clica num
 * link de parceiro, com o parceiro, a pagina de origem, o sitio da pagina
 * onde o link estava e o valor medio desse clique.
 *
 * Funciona nos quatro sites: apanha /visita/<parceiro> (PT) e /visit/<parceiro>
 * (EN), e tambem os links diretos de afiliado que correspondam a um dos
 * padroes listados no ficheiro de valores. Qualquer link pode ainda ser
 * marcado a mao com data-afiliado="nome-do-parceiro".
 *
 * Os valores vivem em afiliados-valores.json, fora deste ficheiro, para
 * poderem ser alterados sem publicar o site.
 */
(function () {
  "use strict";

  var URL_VALORES =
    "https://cdn.jsdelivr.net/gh/pedrofintech/lf-site-assets@main/afiliados-valores.json";

  var CHAVE_CACHE = "lf-afiliados-valores";

  // Usado enquanto o ficheiro de valores nao estiver carregado.
  var config = {
    moeda: "EUR",
    valorPorOmissao: 1,
    parceiros: {},
    padroes: {},
  };

  // Evita contar duas vezes o mesmo clique no mesmo elemento.
  var ultimoClique = { elemento: null, tempo: 0 };

  // ---------------------------------------------------------------- valores

  function guardarConfig(dados) {
    if (!dados || typeof dados !== "object") return;
    config = {
      moeda: dados.moeda || "EUR",
      valorPorOmissao:
        typeof dados.valorPorOmissao === "number" ? dados.valorPorOmissao : 1,
      parceiros: dados.parceiros || {},
      padroes: dados.padroes || {},
    };
  }

  function lerCache() {
    try {
      var bruto = sessionStorage.getItem(CHAVE_CACHE);
      if (bruto) guardarConfig(JSON.parse(bruto));
    } catch (e) {
      /* sessionStorage indisponivel (modo privado) */
    }
  }

  function carregarValores() {
    fetch(URL_VALORES, { cache: "no-cache" })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (dados) {
        if (!dados) return;
        guardarConfig(dados);
        try {
          sessionStorage.setItem(CHAVE_CACHE, JSON.stringify(dados));
        } catch (e) {
          /* ignorar */
        }
      })
      .catch(function () {
        /* sem valores, o tracking continua a funcionar com o valor por omissao */
      });
  }

  function valorDoParceiro(parceiro) {
    var v = config.parceiros[parceiro];
    return typeof v === "number" ? v : config.valorPorOmissao;
  }

  // --------------------------------------------------------------- parceiro

  // Devolve o nome do parceiro, ou null se o link nao for de afiliado.
  function parceiroDoLink(link) {
    var marcado = link.getAttribute("data-afiliado");
    if (marcado) return marcado;

    var url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (e) {
      return null;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;

    var redirecionamento = url.pathname.match(/^\/(?:visita|visit)\/([^/?#]+)/i);
    if (redirecionamento) return decodeURIComponent(redirecionamento[1]).toLowerCase();

    if (url.hostname === window.location.hostname) return null;

    // Links diretos de afiliado. Compara-se o endereco completo e nao so o
    // dominio, porque o mesmo dominio serve links de afiliado e links de
    // consulta (por exemplo o precario de uma corretora).
    var endereco = url.hostname + url.pathname + url.search;
    var padroes = Object.keys(config.padroes);
    for (var i = 0; i < padroes.length; i++) {
      if (endereco.indexOf(padroes[i]) !== -1) return config.padroes[padroes[i]];
    }

    return null;
  }

  // Onde estava o link na pagina. Serve para saber o que converte: o texto
  // do artigo, as tabelas de comparacao ou os banners.
  function localDoLink(link) {
    var marcado = link.getAttribute("data-afiliado-local");
    if (marcado) return marcado;

    if (link.closest(".w-richtext")) return "artigo";
    if (link.closest("[class*='cc-'], [class*='comparador']")) return "comparador";
    if (link.closest("table")) return "tabela";
    if (link.querySelector("img")) return "banner";
    return "botao";
  }

  // ------------------------------------------------------------------ envio

  function registarClique(link) {
    var parceiro = parceiroDoLink(link);
    if (!parceiro) return;

    var agora = Date.now();
    if (link === ultimoClique.elemento && agora - ultimoClique.tempo < 1000) return;
    ultimoClique = { elemento: link, tempo: agora };

    if (typeof window.gtag !== "function") return;

    window.gtag("event", "affiliate_click", {
      partner: parceiro,
      placement: localDoLink(link),
      link_url: link.href,
      link_text: (link.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
      page_path: window.location.pathname,
      value: valorDoParceiro(parceiro),
      currency: config.moeda,
      // Garante que o evento sai antes de o browser sair da pagina.
      transport_type: "beacon",
    });
  }

  function aoClicar(e) {
    // e.button 1 e o clique do meio, que abre em separador novo.
    if (e.type === "click" && e.button !== 0 && e.button !== undefined) return;
    var link = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (link) registarClique(link);
  }

  // --------------------------------------------------------------- arranque

  lerCache();
  // Carrega os valores de imediato: os links diretos de afiliado so sao
  // reconhecidos depois de os padroes chegarem, e um clique rapido ficaria
  // de fora. E um pedido de 1 KB, e so o primeiro da sessao.
  carregarValores();

  document.addEventListener("click", aoClicar, true);
  document.addEventListener("auxclick", aoClicar, true);
})();
