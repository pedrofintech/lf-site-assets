/* Zoom das imagens dos recursos (homepage). Depende do GSAP + ScrollTrigger, que
   a partir de 9 set 2026 so sao carregados em desktop: em telemovel nao ha
   animacao e este ficheiro nao faz nada, em vez de rebentar. */
(function () {
  function animar() {
    $(".recurso_component").each(function () {
      gsap.fromTo(
        $(this).find(".recurso-image"),
        { scale: 1.2 },
        {
          scale: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: this,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        }
      );
    });
  }

  function quandoHouverGsap(fn) {
    if (window.gsap && window.ScrollTrigger) return fn();
    document.addEventListener("lf:gsap-ready", fn, { once: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      quandoHouverGsap(animar);
    });
  } else {
    quandoHouverGsap(animar);
  }
})();
