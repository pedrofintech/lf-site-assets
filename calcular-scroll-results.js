$("#calcular").on("click", function () {
  // Scroll nativo para os resultados (sem dependencia do GSAP/ScrollToPlugin).
  // Usa o Lenis quando existe (desktop) para nao competir com o smooth scroll dele.
  var anchor = document.querySelector("[results-anchor]");
  if (anchor) {
    var top = anchor.getBoundingClientRect().top + window.pageYOffset - 100;
    if (top < 0) top = 0;

    if (window.lenis && typeof window.lenis.scrollTo === "function") {
      // Caminho preferido: o Lenis trata do smooth scroll.
      window.lenis.scrollTo(top);
    } else if (document.documentElement.classList.contains("lenis")) {
      // Lenis ativo mas sem instancia exposta: ele engole o smooth nativo,
      // por isso saltamos directo. Expor `window.lenis = lenis` no custom
      // code do site devolve o scroll suave.
      window.scrollTo(0, top);
    } else {
      // Sem Lenis (mobile): smooth nativo.
      try {
        window.scrollTo({ top: top, behavior: "smooth" });
      } catch (e) {
        window.scrollTo(0, top);
      }
    }
  }

  $(".placeholder-results_wrapper").css("display", "none");

  //Mover o anúncio
  (function () {
    function move() {
      var ad = document.querySelector(".calculator-ad_wrapper");
      var target = document.querySelector(".calculator-add-final-position");
      if (!ad || !target) return;
      // Idempotent: only move if not already inside
      if (target.contains(ad)) return;
      target.appendChild(ad);
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", move);
    } else {
      move();
    }
  })();
});
