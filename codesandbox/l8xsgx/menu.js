document.addEventListener("DOMContentLoaded", function () {
  console.log("menu");

  let hasVariant = $(".nav_component").attr("class").includes("w-variant-");

  /*if (hasVariant) {
  } else {
    $(".nav_background").css("opacity", "1");
  }*/

  // Nav bg fade at 150px (passive scroll listener, no GSAP needed)
  if (hasVariant) {
    const navBgs = document.querySelectorAll(".nav_background");
    let navBgOn = null;
    navBgs.forEach(function (el) {
      el.style.transition = "opacity 0.5s cubic-bezier(0.33, 1, 0.68, 1)";
    });
    const updateNavBg = function () {
      const on = window.pageYOffset > 150;
      if (on === navBgOn) return;
      navBgOn = on;
      navBgs.forEach(function (el) {
        el.style.opacity = on ? "1" : "0";
      });
    };
    window.addEventListener("scroll", updateNavBg, { passive: true });
    updateNavBg();
  }

  //
  /*
  const menuButton = document.querySelector(".nav_button");
  let menuOpen = false;

  menuButton.addEventListener("click", function () {
    menuOpen = !menuOpen; // Toggle menu state

    if (menuOpen) {
      lenis.stop(); // Disable scrolling
    } else {
      lenis.start(); // Re-enable scrolling
    }
  });*/

  const menuButton = document.querySelector(".nav_button");
  const navMenu = document.querySelector(".nav_menu");
  let menuOpen = false;

  menuButton.addEventListener("click", function () {
    menuOpen = !menuOpen; // Toggle menu state

    if (menuOpen) {
      if (hasVariant) {
        $(".nav_background").addClass("is-bg-primary-important");
        $(".menu-mobile-icon").addClass("is-green-important");
        $(".menu-logo.is-top-light").addClass("is-visible");
      }

      //$(".nav_background").css("opacity", "100");
      document.body.style.overflow = "hidden"; // Disable body scrolling
      document.body.style.height = "100vh"; // Prevent page movement

      navMenu.style.overflowY = "auto"; // Ensure nav menu is scrollable

      // Prevent scrolling outside .nav_menu
      document.addEventListener("wheel", blockScrollOutside, {
        passive: false,
      });
      document.addEventListener("touchmove", blockScrollOutside, {
        passive: false,
      });
    } else {
      if (hasVariant) {
        $(".nav_background").removeClass("is-bg-primary-important");
        $(".menu-mobile-icon").removeClass("is-green-important");
        $(".menu-logo.is-top-light").removeClass("is-visible");

        //$(".nav_background").css("opacity", "1");
      }

      //$(".nav_background").css("opacity", "0");
      document.body.style.overflow = ""; // Restore body scrolling
      document.body.style.height = ""; // Reset height

      // Remove event listener when closing the menu
      document.removeEventListener("wheel", blockScrollOutside);
      document.removeEventListener("touchmove", blockScrollOutside);
    }
  });

  // Function to prevent scrolling outside .nav_menu
  function blockScrollOutside(event) {
    if (!navMenu.contains(event.target)) {
      event.preventDefault(); // Block scrolling if outside the nav menu
    }
  }
  //
});
