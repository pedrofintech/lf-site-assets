document.addEventListener("DOMContentLoaded", function () {
  let tlmar = gsap.timeline({ repeat: -1 });

  tlmar.fromTo(
    ".marquee_track",
    {
      xPercent: 0,
    },
    {
      xPercent: -50,
      duration: 120,
      ease: "none",
    }
  );
});
