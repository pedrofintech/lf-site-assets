$(document).ready(function () {
  setTimeout(function () {
    $(".vantagens").each(function () {
      $(this)
        .closest(".w-embed")
        .nextAll("ul")
        .first()
        .addClass("custom-list-vantagens");
    });

    $(".desvantagens").each(function () {
      $(this)
        .closest(".w-embed")
        .nextAll("ul")
        .first()
        .addClass("custom-list-desvantagens");
    });

    // ————————————————————————

    $(".vantagens").each(function () {
      $(this).closest(".w-embed").remove();
    });

    $(".desvantagens").each(function () {
      $(this).closest(".w-embed").remove();
    });
  }, 10); // delay ensures Webflow embeds are rendered
});
