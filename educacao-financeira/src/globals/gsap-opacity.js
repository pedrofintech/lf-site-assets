gsap.ticker.lagSmoothing(0);

document.addEventListener("DOMContentLoaded", function () {
  gsap.set(
    "[opacity-delay-0-5], [opacity-delay-0-7], [opacity-delay-1-2], [opacity-delay-1], [opacity-90], [opacity-90-delay-0-5], [opacity-90-delay-0-6], [opacity-90-delay-0-7], [opacity-90-delay-1], [opacity-90-delay-1-2]",
    { opacity: 0 }
  );

  $("[opacity-delay-0-5]").each(function () {
    gsap.fromTo(
      $(this),
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        delay: 0.5,
        ease: "power1.inOut",
      }
    );
  });

  $("[opacity-delay-0-7]").each(function () {
    gsap.fromTo(
      $(this),
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        delay: 0.7,
        ease: "power1.inOut",
      }
    );
  });

  $("[opacity-delay-1-2]").each(function () {
    gsap.fromTo(
      $(this),
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        delay: 0.7,
        ease: "power1.inOut",
      }
    );
  });

  $("[opacity-delay-1]").each(function () {
    gsap.fromTo(
      $(this),
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        delay: 0.7,
        ease: "power1.inOut",
      }
    );
  });

  $("[opacity-90]").each(function () {
    gsap.fromTo(
      $(this),
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: this,
          start: "top 90%",
        },
      }
    );
  });

  $("[opacity-90-delay-0-5]").each(function () {
    gsap.fromTo(
      $(this),
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        delay: 0.5,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: this,
          start: "top 90%",
        },
      }
    );
  });

  $("[opacity-90-delay-0-6]").each(function () {
    gsap.fromTo(
      $(this),
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.6,
        delay: 0.5,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: this,
          start: "top 90%",
        },
      }
    );
  });

  $("[opacity-90-delay-0-7]").each(function () {
    gsap.fromTo(
      $(this),
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        delay: 0.7,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: this,
          start: "top 90%",
        },
      }
    );
  });

  $("[opacity-90-delay-1]").each(function () {
    gsap.fromTo(
      $(this),
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        delay: 1,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: this,
          start: "top 90%",
        },
      }
    );
  });

  $("[opacity-90-delay-1-2]").each(function () {
    gsap.fromTo(
      $(this),
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        delay: 1.2,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: this,
          start: "top 90%",
        },
      }
    );
  });
});
