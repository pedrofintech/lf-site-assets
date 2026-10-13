$(document).ready(function () {
  const vanadus = $("#vanaduspension");
  const ttCb = $("#tt-tootlus"); // ainult töötaja 1,6%

  function checkIfSelected() {
    const on = vanadus.is(":checked");
    ttCb
      .prop("disabled", on)
      .closest(".filter-button")
      .toggleClass("is-disabled", on);
    if (on) ttCb.prop("checked", false);
  }
  checkIfSelected();
  vanadus.on("change", checkIfSelected);
});
