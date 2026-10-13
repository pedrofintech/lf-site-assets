document.querySelectorAll('[data-format="currency"]').forEach((input) => {
  $("#calcular").on("click", function () {
    gsap.to(window, {
      duration: 1,
      scrollTo: "[results-anchor]",
      ease: "power1.inOut",
    });
  });
});
