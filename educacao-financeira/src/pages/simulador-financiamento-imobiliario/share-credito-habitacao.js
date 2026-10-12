document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll("[data-type]");
  const shareUrlButton = document.querySelector("[share-url]");
  const calcularButton = document.querySelector("#calcular");

  const paramMap = {
    "montante-emprestimo": "m",
    "period-emprestimo": "p",
    yield: "y",
    "comissoes-iniciais": "c",
    "premio-seguro": "s",
  };

  // Pre-preencher inputs a partir dos query params da URL
  const params = new URLSearchParams(window.location.search);
  let hasParams = false;

  inputs.forEach((input) => {
    const longName = input.getAttribute("data-type") || input.name;
    const shortName = paramMap[longName];
    const paramValue = params.get(shortName) || params.get(longName);

    if (paramValue !== null) {
      input.value = decodeURIComponent(paramValue);
      hasParams = true;
    }
  });

  // Se vieram parâmetros na URL, dispara cálculo automaticamente
  if (hasParams && calcularButton) {
    setTimeout(() => calcularButton.click(), 500);
  }

  // Gerar URL partilhável a partir dos valores atuais e copiar para clipboard
  function generateShareableURL() {
    const newParams = new URLSearchParams();
    inputs.forEach((input) => {
      const longName = input.getAttribute("data-type") || input.name;
      const shortName = paramMap[longName] || longName;

      if (input.value.trim() !== "") {
        newParams.set(shortName, encodeURIComponent(input.value));
      }
    });

    const newUrl = `${window.location.origin}${
      window.location.pathname
    }?${newParams.toString()}`;

    navigator.clipboard.writeText(newUrl).catch(() => {});
  }

  if (shareUrlButton) {
    shareUrlButton.addEventListener("click", generateShareableURL);
  }
});
