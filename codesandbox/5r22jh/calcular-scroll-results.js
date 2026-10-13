//document.querySelectorAll('[data-format="currency"]').forEach((input) => {
$("#calcular").on("click", function () {
  gsap.to(window, {
    duration: 1,
    scrollTo: { y: "[results-anchor]", offsetY: 100 },
    ease: "power1.inOut",
  });

  $(".placeholder-results_wrapper").css("display", "none");
});
//});
