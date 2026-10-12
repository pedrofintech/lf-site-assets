document.addEventListener("DOMContentLoaded", function () {
  if (!document.querySelector(".nota_wrapper") || !document.querySelector(".nota_2")) return;

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
});
