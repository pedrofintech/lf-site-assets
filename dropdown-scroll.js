// Exemplo de permitir scroll dentro de um dropdown ao usar Lenis
const dropdown = document.querySelector(
  ".dropdown-list-caulculadora.is-dependentes"
);

dropdown.addEventListener(
  "wheel",
  function (e) {
    e.stopPropagation(); // Impede Lenis de capturar o evento
  },
  { passive: false }
);
