document
  .querySelector("#reload-button")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default link behavior
    location.reload(); // Reload the page
  });
