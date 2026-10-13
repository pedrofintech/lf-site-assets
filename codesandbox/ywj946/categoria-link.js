/*document.addEventListener("DOMContentLoaded", function () {
  $("[categoria-link]").each(function () {
    // Get the text inside the button
    const categoryText = $(this).text().trim();

    // Create the URL with the category parameter
    const targetUrl = `/articles?categoria=${encodeURIComponent(categoryText)}`;

    // Set the href attribute dynamically
    $(this).attr("href", targetUrl);
  });
});
*/

document.addEventListener("DOMContentLoaded", function () {
  $("[categoria-link]").each(function () {
    const categoryText = $(this).text().trim();
    // detect language segment in URL (e.g. /pl/, /pt/, /en-us/)
    const parts = location.pathname.split("/").filter(Boolean);
    let langSegment = "";

    if (parts.length) {
      const first = parts[0];
      // two-letter codes (pt, en, pl) or locale with region (en-us, pt-PT)
      if (/^[a-z]{2}(-[a-zA-Z]{2})?$/.test(first)) {
        langSegment = "/" + first;
      }
    }

    const targetUrl = `${langSegment}/artiklid?categoria=${encodeURIComponent(
      categoryText
    )}`;
    $(this).attr("href", targetUrl);
  });
});
