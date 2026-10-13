document.addEventListener("DOMContentLoaded", function () {
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
});
