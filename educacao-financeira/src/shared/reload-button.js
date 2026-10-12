const reloadButton = document.querySelector("#reload-button");

if (reloadButton) {
  reloadButton.addEventListener("click", function (event) {
    event.preventDefault();
    location.reload();
  });
}
