document.addEventListener("DOMContentLoaded", function () {
  ScrollTrigger.create({
    start: "top top",
    end: 99999,
    onUpdate: (self) => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        // Animate opacity of .nav_background to 1
        gsap.to(".nav_background", {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        });

        // Show/hide navbar based on scroll direction
        if (self.direction === -1) {
          // Show navbar on scroll up
          gsap.to(".nav_fixed", {
            y: "0%", // Fix applied here
            duration: 0.9,
            ease: "power2.out",
          });
        } else {
          // Hide navbar on scroll down
          gsap.to(".nav_fixed", {
            y: "-100%", // Fix applied here
            duration: 0.9,
            ease: "power2.out",
          });
        }
      } else {
        // Animate opacity of .nav_background to 0
        gsap.to(".nav_background", {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        });

        // Always show navbar if less than 100px scrolled
        gsap.to(".nav_fixed", {
          y: "0%", // Fix applied here
          duration: 0.9,
          ease: "power2.out",
        });
      }
    },
  });

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
      $(".nav_background").css("opacity", "100");
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
      $(".nav_background").css("opacity", "0");
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
