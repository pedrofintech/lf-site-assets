document.addEventListener("DOMContentLoaded", function () {
  initSplitText();

  function initSplitText() {
    var splitChars = new SplitType("[text-split]", {
      type: "chars",
      //charsClass: "single-char",
    });
    gsap.set("[text-split]", { opacity: 1 });
  }

  //MAIN TITLES
  $("[gsap-title-letter]").each(function (index) {
    let triggerElement = $(this);

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "top 90%",
        //end: "100% 0%",
        onEnter: () => tl.play(),
      },
    });

    tl.to($(this).find(".char"), {
      duration: 1.1,
      y: "0%",
      ease: "power3.out",
      stagger: { amount: 0.15 },
    });
  });
});
