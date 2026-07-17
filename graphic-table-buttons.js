document.addEventListener("DOMContentLoaded", function () {
  $("[graphic-button]").on("click", function () {
    $(this).addClass("is-active"); // No dot for class name
    $("[table-button]").removeClass("is-active"); // No dot for class name

    $(".graph-image-export").css("display", "block");
    $(".table-content-watermark_wrapper").css("display", "none");
  });

  $("[table-button]").on("click", function () {
    $(this).addClass("is-active"); // No dot for class name
    $("[graphic-button]").removeClass("is-active"); // No dot for class name

    $(".table-content-watermark_wrapper").css("display", "block"); // Fixed target class
    $(".graph-image-export").css("display", "none"); // Fixed target class
  });
});
