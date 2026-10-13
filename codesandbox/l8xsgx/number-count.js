document.addEventListener("DOMContentLoaded", function () {
  $("[number-count]").each(function () {
    let target = $(this);
    let finalNumber = parseInt(target.text().replace(/\./g, ""), 10);

    gsap.fromTo(
      target,
      { innerText: 0 },
      {
        innerText: finalNumber,
        duration: 2.3,
        ease: "expo.inOut",
        roundProps: "innerText",
        onUpdate: function () {
          target.text(numberWithCommas(Math.round(target.text())));
        },
        scrollTrigger: {
          trigger: target,
          start: "top 90%",
          once: true,
        },
      }
    );
  });

  function numberWithCommas(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
});
