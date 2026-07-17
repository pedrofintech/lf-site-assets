$(document).ready(function () {
  const select = document.querySelector("#tipo-sub-refeicao");

  function checkIfSelected() {
    const value = select.value;
    if (value === "Não tenho") {
      $("[sub-ref-value-disable]").addClass("is-disabled");
      $("[sub-ref-days-disable]").addClass("is-disabled");
    } else if (value === "Remuneração") {
      $('[data-type="valor-sub-refeicao"]').val("6,15").trigger("input");
    } else {
      $('[data-type="valor-sub-refeicao"]').val("10,46").trigger("input");
      $("[sub-ref-value-disable]").removeClass("is-disabled");
      $("[sub-ref-days-disable]").removeClass("is-disabled");
    }
  }

  // ao carregar
  checkIfSelected();

  // sempre que muda
  select.addEventListener("change", checkIfSelected);
});
