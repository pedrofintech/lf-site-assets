$(document).ready(function () {
  setTimeout(function () {
    // Webflow envolve embeds em `.w-embed` fora de rich-text e em
    // `[data-rt-embed-type]` dentro de rich-text. Apanhamos os dois.
    var EMBED_WRAPPER = ".w-embed, [data-rt-embed-type]";

    $(".vantagens").each(function () {
      $(this)
        .closest(EMBED_WRAPPER)
        .nextAll("ul")
        .first()
        .addClass("custom-list-vantagens");
    });

    $(".desvantagens").each(function () {
      $(this)
        .closest(EMBED_WRAPPER)
        .nextAll("ul")
        .first()
        .addClass("custom-list-desvantagens");
    });

    // ————————————————————————

    $(".vantagens").each(function () {
      $(this).closest(EMBED_WRAPPER).remove();
    });

    $(".desvantagens").each(function () {
      $(this).closest(EMBED_WRAPPER).remove();
    });
  }, 10); // delay ensures Webflow embeds are rendered
});
