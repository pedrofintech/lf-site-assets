$(document).ready(function () {
  $("[filter-button]").on("click", function () {
    $("[all-filter-button]").removeClass("is-active");
  });

  $("[all-filter-button]").on("click", function () {
    $("[all-filter-button]").addClass("is-active");
    $("[filter-button]").removeClass("is-active");
  });
});
