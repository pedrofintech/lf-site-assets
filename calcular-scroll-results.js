$("#calcular").on("click", function () {
  // 1) Primeiro as alterações ao DOM: esconder o placeholder e mover o anúncio.
  //    Na versão 56a2874 o alvo do scroll era medido ANTES destas alterações
  //    e antes de a calculadora mostrar o .all-results_wrapper (onde vive o
  //    [results-anchor]); o alvo ficava desatualizado (o placeholder de 304 px
  //    ainda contava, ou o anchor ainda estava display:none e media 0).
  $(".placeholder-results_wrapper").css("display", "none");
  moverAnuncio();

  // 2) Medir e fazer scroll só depois de o clique terminar. Garante que todos
  //    os handlers do clique (incl. o da calculadora, seja qual for a ordem de
  //    registo) já atualizaram o layout. Era isto que o GSAP fazia
  //    implicitamente: o ScrollToPlugin só resolvia "[results-anchor]" no
  //    primeiro tick da animação.
  setTimeout(function () {
    var anchor = document.querySelector("[results-anchor]");
    if (!anchor) return;

    var rect = anchor.getBoundingClientRect();
    // Resultados ainda escondidos (ex.: validação falhou) - não fazer scroll.
    if (rect.width === 0 && rect.height === 0 && anchor.offsetParent === null) return;

    var top = rect.top + window.pageYOffset - 100;
    if (top < 0) top = 0;

    if (window.lenis && typeof window.lenis.scrollTo === "function") {
      // Desktop: o Lenis trata do smooth scroll.
      window.lenis.scrollTo(top);
    } else if (document.documentElement.classList.contains("lenis")) {
      // Lenis ativo mas sem instância exposta: ele engole o smooth nativo.
      window.scrollTo(0, top);
    } else {
      // Sem Lenis (mobile): smooth nativo.
      try {
        window.scrollTo({ top: top, behavior: "smooth" });
      } catch (e) {
        window.scrollTo(0, top);
      }
    }
  }, 0);

  function moverAnuncio() {
    var ad = document.querySelector(".calculator-ad_wrapper");
    var target = document.querySelector(".calculator-add-final-position");
    if (!ad || !target) return;
    if (target.contains(ad)) return; // idempotente
    target.appendChild(ad);
  }
});
