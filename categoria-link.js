document.addEventListener("DOMContentLoaded", function () {
  $("[categoria-link]").each(function () {
    // Get the text inside the button
    const categoryText = $(this).text().trim();

    // Create the URL with the category parameter
    const targetUrl = `/artigos?categoria=${encodeURIComponent(categoryText)}`;

    // Set the href attribute dynamically
    $(this).attr("href", targetUrl);
  });
});
