document.addEventListener("DOMContentLoaded", function () {
  // Prevent the browser from automatically restoring scroll position
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  // Force scroll to the top on page load
  window.scrollTo(0, 0);

  // Stop Lenis and GSAP animations temporarily
  lenis.stop();
  gsap.globalTimeline.pause();

  // Keep forcing the scroll to (0,0) briefly to prevent any scroll-jump on load
  let intervalId = setInterval(() => {
    window.scrollTo(0, 0);
  }, 10);

  // Stop forcing scroll after 2.5 seconds, and resume animations
  setTimeout(() => {
    clearInterval(intervalId);
    gsap.globalTimeline.resume();
    lenis.start();
  }, 1000);
});
