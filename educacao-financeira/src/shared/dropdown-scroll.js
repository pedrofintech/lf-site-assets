// Permite scroll dentro de um dropdown ao usar Lenis (só na calc com dependentes)
const dropdown = document.querySelector(
  ".dropdown-list-caulculadora.is-dependentes"
);

if (dropdown) {
  dropdown.addEventListener(
    "wheel",
    function (e) {
      e.stopPropagation(); // Impede Lenis de capturar o evento
    },
    { passive: false }
  );
}
