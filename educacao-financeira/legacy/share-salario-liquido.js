document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#wf-form-Form");
  const inputs = form.querySelectorAll("input, select");
  const calcularButton = document.querySelector("#calcular");

  const paramMap = {
    morada: "m",
    "estado-civil": "ec",
    dependentes: "d",
    "irs-jovem": "ij",
    checkbox: "inc",
    "salario-bruto": "sb",
    "retribuicao-extraordinaria": "re",
    "outros-rendimentos-irs-ss": "oriss",
    "outros-rendimentos-irs": "oris",
    "outros-rendimentos-isentos": "ori",
    "taxa-seguranca-social": "tss",
    "subsidios-duodecimos": "sd",
    adse: "ad",
    "tipo-sub-refeicao": "tsr",
    "valor-sub-refeicao": "vsr",
    "dias-sub-refeicao": "dsr",
  };

  const reverseParamMap = Object.fromEntries(
    Object.entries(paramMap).map(([longName, shortName]) => [
      shortName,
      longName,
    ])
  );

  const params = new URLSearchParams(window.location.search);
  let hasParams = false;

  inputs.forEach((input) => {
    const longName = input.getAttribute("data-type") || input.name;
    const shortName = paramMap[longName];
    const paramValue = params.get(shortName) || params.get(longName);

    if (paramValue !== null) {
      if (input.type === "checkbox") {
        input.checked = paramValue === "1";
      } else {
        input.value = decodeURIComponent(paramValue);
      }
      hasParams = true;
    }
  });

  if (hasParams && calcularButton) {
    setTimeout(() => {
      calcularButton.click();
    }, 500);
  }

  function generateShareableURL() {
    const newParams = new URLSearchParams();

    inputs.forEach((input) => {
      const longName = input.getAttribute("data-type") || input.name;
      const shortName = paramMap[longName] || longName;

      if (input.type === "checkbox") {
        if (input.checked) {
          newParams.set(shortName, "1");
        }
      } else if (input.value.trim() !== "") {
        newParams.set(shortName, encodeURIComponent(input.value));
      }
    });

    const newUrl = `${window.location.origin}${
      window.location.pathname
    }?${newParams.toString()}`;
    navigator.clipboard.writeText(newUrl).then(() => {
      const copiedText = document.querySelector("[copied-text]");
      const copiedIcon = document.querySelector("[copied-icon]");
      const shareIcon = document.querySelector("[share-icon]");

      if (copiedText) copiedText.textContent = "Copiado!";
      if (copiedIcon) copiedIcon.style.display = "block";
      if (shareIcon) shareIcon.style.display = "none";

      setTimeout(() => {
        if (copiedText) copiedText.textContent = "Partilhar resultados";
        if (copiedIcon) copiedIcon.style.display = "none";
        if (shareIcon) shareIcon.style.display = "block";
      }, 2000);
    });
  }

  // Wait a tick to ensure the button is in the DOM
  setTimeout(() => {
    const shareUrlButton = document.querySelector("[share-url]");
    if (shareUrlButton) {
      shareUrlButton.addEventListener("click", (e) => {
        e.preventDefault();
        generateShareableURL();
      });
    }
  }, 100);
});
