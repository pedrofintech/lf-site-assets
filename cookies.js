$(document).ready(function () {
  // Function to set a cookie
  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); // Convert days to milliseconds
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  // Function to get a cookie by name
  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Check if the cookie exists on page load
  if (getCookie("cookiesAccepted")) {
    // If cookie exists, hide the cookie banner or perform other actions
    $(".cookies_component").remove(); // Replace .cookie-banner with your actual element
  } else {
    // Change the opacity of a div after 3 seconds
    setTimeout(function () {
      $(".cookies_component").css("opacity", "1"); // Change opacity to 1
    }, 3200);
  }

  // Set the cookie when the element with [close-cookies] attribute is clicked
  $("[close-cookies]").on("click", function () {
    setCookie("cookiesAccepted", "true", 120); // Set cookie for 120 days
    $(".cookies_component").remove();
  });
});
