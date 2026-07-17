document.addEventListener("DOMContentLoaded", function () {
  const shareButton = document.querySelector("[share-url]");
  const shareIcon = document.querySelector("[share-icon]");
  const copiedIcon = document.querySelector("[copied-icon]");
  const copiedText = document.querySelector("[copied-text]");

  if (shareButton && shareIcon && copiedIcon && copiedText) {
    shareButton.addEventListener("click", function () {
      // Hide share icon, show copied icon, and change text
      shareIcon.style.display = "none";
      copiedIcon.style.display = "block";
      copiedText.textContent = "Link copiado";

      setTimeout(() => {
        shareIcon.style.display = "block";
        copiedIcon.style.display = "none";
        copiedText.textContent = "Partilhar resultados";
      }, 1500);
    });
  }
});
