/* Parallax da nota (homepage). Depende do GSAP + ScrollTrigger, que a partir de
   9 set 2026 so sao carregados em desktop: em telemovel nao ha animacao nenhuma
   e este ficheiro nao faz nada, em vez de rebentar com "gsap is not defined". */
(function () {
  function animar() {
    gsap.to(".nota_2", {
      scrollTrigger: {
        trigger: ".nota_wrapper",
        start: "top 84%",
        end: "top 40%",
        scrub: true,
      },
      y: "-10%",
      ease: "power1.inOut",
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
