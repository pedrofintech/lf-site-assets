document.addEventListener("DOMContentLoaded", function () {
  // Function to capture and download a div as an image with padding
  /*function downloadDivAsImage(divSelector, filename, padding = 30) {
    const targetDiv = document.querySelector(divSelector);
    if (!targetDiv) {
      console.error("Div not found:", divSelector);
      return;
    }

    // Clone the target div to avoid modifying the original
    const clonedDiv = targetDiv.cloneNode(true);

    // Wrap the cloned div inside a new container with padding
    const wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.left = "-9999px"; // Move it off-screen
    wrapper.style.padding = `${padding}px`;
    wrapper.style.backgroundColor = "#ffffff"; // Ensure a clean white background
    wrapper.appendChild(clonedDiv);

    document.body.appendChild(wrapper);

    // Capture the padded wrapper instead of the original div
    html2canvas(wrapper, {
      scale: 4,
      useCORS: true,
      willReadFrequently: true,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = filename;
      link.click();

      // Remove the temporary wrapper after capturing
      document.body.removeChild(wrapper);
    });
  }

  // Capture table image
  const tableButton = document.querySelector("[download-table-image-button]");

  const isHabitacao = window.location.pathname.includes(
    "/simulador-credito-a-habitacao"
  );
  const fileName = isHabitacao
    ? "simulacaoLT-tabela-prestacao-credito-habitação.png"
    : "simulacaoLT-tabela-juros-compostos.png";

  if (tableButton) {
    tableButton.addEventListener("click", function () {
      $("[table-button]").click();
      downloadDivAsImage(".table-content-watermark_wrapper", fileName, 30);
    });
  }

*/

  // Carrega o html2canvas so no primeiro clique (evita ~200 KB de parse no load).
  function ensureHtml2Canvas() {
    if (window.html2canvas) return Promise.resolve(window.html2canvas);
    if (window.__h2cPromise) return window.__h2cPromise;
    window.__h2cPromise = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      s.onload = function () {
        resolve(window.html2canvas);
      };
      s.onerror = function () {
        window.__h2cPromise = null;
        reject(new Error("html2canvas failed to load"));
      };
      document.head.appendChild(s);
    });
    return window.__h2cPromise;
  }

  async function downloadDivAsImage(divSelector, filename, padding = 30) {
    const targetDiv = document.querySelector(divSelector);
    if (!targetDiv) return console.error("Div not found:", divSelector);

    // Arranca o download do html2canvas ja, em paralelo com o settle de
    // layout/fontes abaixo — assim o primeiro clique nao paga as duas esperas
    // em serie.
    const h2cReady = ensureHtml2Canvas();

    // Wait for layout/fonts to settle
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r))
    );

    const rect = targetDiv.getBoundingClientRect();
    const maxDim = 16384; // safe-ish browser limit
    const safeScale = Math.min(
      2, // don't force 4x for very tall content
      maxDim / Math.max(rect.width + padding * 2, 1),
      maxDim / Math.max(rect.height + padding * 2, 1)
    );

    await h2cReady;

    const canvas = await html2canvas(targetDiv, {
      backgroundColor: "#fff",
      useCORS: true,
      scale: safeScale,
      onclone: (doc) => {
        const el = doc.querySelector(divSelector);
        if (!el) return;
        el.style.padding = `${padding}px`;
        el.style.boxSizing = "border-box";
        el.style.overflow = "visible";
        el.style.maxHeight = "none";
      },
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    link.click();
  }

  const tableButton = document.querySelector("[download-table-image-button]");
  const isHabitacao = window.location.pathname.includes(
    "/simulador-credito-a-habitacao"
  );
  const fileName = isHabitacao
    ? "simulacaoLT-tabela-prestacao-credito-habitacao.png"
    : "simulacaoLT-tabela-juros-compostos.png";

  if (tableButton) {
    tableButton.addEventListener("click", async () => {
      $("[table-button]").click();
      await new Promise((r) => setTimeout(r, 100)); // let DOM update after tab switch
      await downloadDivAsImage(
        ".table-content-watermark_wrapper",
        fileName,
        30
      );
    });
  }
});
