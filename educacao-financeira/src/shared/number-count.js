document.addEventListener("DOMContentLoaded", function () {
  // Na página das Parcerias, alguns números (ex.: "+50 mil") estão como texto
  // simples no Webflow, sem o span [number-count] dos outros. Envolve o número
  // num span com esse atributo antes de animar; "+" e "mil" ficam fixos.
  document
    .querySelectorAll(".parcerias-numbers_wrapper .text-size-numbers > div")
    .forEach(function (el) {
      if (el.querySelector("[number-count]") || el.children.length) return;
      const match = el.textContent.match(/^(\D*)(\d[\d.]*)(.*)$/);
      if (!match) return;
      const span = document.createElement("span");
      span.setAttribute("number-count", "");
      span.textContent = match[2];
      el.textContent = "";
      el.append(match[1], span, match[3]);
    });

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
