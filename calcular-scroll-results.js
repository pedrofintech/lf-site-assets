$("#calcular").on("click", function () {
  gsap.to(window, {
    duration: 1,
    scrollTo: { y: "[results-anchor]", offsetY: 100 },
    ease: "power1.inOut",
  });

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
