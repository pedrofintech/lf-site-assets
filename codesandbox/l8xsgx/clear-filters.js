document.addEventListener("DOMContentLoaded", function () {
  const radioLabels = document.querySelectorAll("label[filter-button]");
  const clearButton = document.querySelector('[fs-cmsfilter-element="clear"]');

  radioLabels.forEach((label) => {
    label.addEventListener("click", function (e) {
      const input = this.querySelector("input[fs-cmsfilter-radio]");
      const isActive = this.classList.contains("is-active");

      if (isActive && clearButton) {
        // Prevent default filter re-application
        e.preventDefault();
        e.stopPropagation();

        // Emulate click on clear button to reset filters
        clearButton.click();
      }
    });
  });
});
