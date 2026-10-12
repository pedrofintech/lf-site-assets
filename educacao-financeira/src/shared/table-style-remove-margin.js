$(document).ready(function () {
  $(".w-embed").each(function () {
    let $nextP = $(this).nextAll("p").first();

    if ($nextP.length && $nextP.find("sup").length) {
      $(this).find("table").css("margin-bottom", "0");
    }
  });
});
