const form = document.querySelector("#Contact");
if (form) {
  form.addEventListener("submit", () => {
    // wait for Webflow to process and show success state
    setTimeout(() => {
      gsap.to(window, {
        duration: 1,
        scrollTo: 0,
        ease: "power1.inOut",
      });
    }, 200);
  });
}
