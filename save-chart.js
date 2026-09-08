document.addEventListener("DOMContentLoaded", function () {
  // Carrega o html2canvas so no primeiro pedido (evita ~200 KB de parse no load).
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

  // O link tem de estar no documento: o Safari ignora cliques em elementos soltos.
  // Preparar a imagem logo a seguir ao Calcular: abrir o menu da so cerca de um
  // segundo, e num telemovel isso pode nao chegar para descarregar o
  // html2canvas e desenhar. Corre em idle, fora do caminho do clique.
  function scheduleWarm() {
    setTimeout(function () {
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(function () {
          warm().catch(function () {});
        }, { timeout: 2000 });
      } else {
        warm().catch(function () {});
      }
    }, 1000);
  }

  function triggerDownload(url, filename) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Function to convert SVG to a Base64 Image
  function svgToBase64(svgElement, callback) {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = function () {
      callback(img);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  const isSalario = window.location.pathname.includes(
    "/simulador-salario-liquido"
  );

  /* ── Salario liquido ──────────────────────────────────────────────────────
     Esta e a unica pagina em que o grafico e montado em HTML e tem de passar
     pelo html2canvas. O Safari do iPhone so autoriza um download enquanto ele
     ainda esta colado ao toque, e o html2canvas demora demasiado a desenhar,
     por isso o download nunca funcionava ai. A imagem passa a ser gerada
     quando o menu "..." abre, e o clique fica instantaneo.                  */
  let cachedUrl = null;
  let pending = null;

  function invalidate() {
    cachedUrl = null;
    pending = null;
  }

  function buildSalarioImage() {
    const exportElement = document.querySelector(".graph-image-export");
    if (!exportElement) return Promise.reject(new Error("Export element not found."));

    // Clone the real element including the live canvas
    const cloned = exportElement.cloneNode(true);

    // Replace the empty cloned canvas with a copy of the original canvas content
    const originalCanvas = exportElement.querySelector("canvas");
    const clonedCanvas = cloned.querySelector("canvas");

    if (originalCanvas && clonedCanvas) {
      const context = clonedCanvas.getContext("2d");
      context.drawImage(originalCanvas, 0, 0);
    }

    // Wrap in padded container
    const wrapper = document.createElement("div");
    wrapper.style.padding = "30px";
    wrapper.style.background = "#ffffff";
    wrapper.style.position = "absolute";
    wrapper.style.left = "-9999px";
    wrapper.appendChild(cloned);
    document.body.appendChild(wrapper);

    const cleanup = () => {
      if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    };

    return ensureHtml2Canvas()
      .then((html2canvas) => html2canvas(wrapper, { backgroundColor: null }))
      .then((canvas) => {
        const url = canvas.toDataURL("image/png", 1.0);
        cleanup();
        return url;
      })
      .catch((err) => {
        cleanup();
        throw err;
      });
  }

  function warm() {
    if (cachedUrl || pending) return pending;
    pending = buildSalarioImage()
      .then((url) => {
        cachedUrl = url;
        return url;
      })
      .catch((err) => {
        pending = null;
        throw err;
      });
    return pending;
  }

  /* ── Restantes calculadoras ───────────────────────────────────────────────
     O grafico ja e uma <canvas> do Chart.js: le-se diretamente e junta-se a
     marca de agua. Sem html2canvas, por isso funciona em telemovel.         */
  function downloadCanvasGraph() {
    const canvasElement = document.querySelector(".graph-canvas");
    const watermarkElement = document.querySelector(".graph-watermark svg");

    if (!canvasElement || !watermarkElement) {
      console.error("Canvas or watermark element not found.");
      return;
    }

    // Convert the canvas to an image
    const canvasImage = new Image();
    canvasImage.src = canvasElement.toDataURL("image/png", 1.0); // High quality

    canvasImage.onload = function () {
      // Convert the watermark SVG to an image
      svgToBase64(watermarkElement, function (watermarkImage) {
        // Create a new canvas with padding
        const padding = 30;
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = canvasElement.width + padding * 2;
        finalCanvas.height = canvasElement.height + padding * 2;
        const ctx = finalCanvas.getContext("2d");

        // Fill background with white
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

        // Draw the canvas image onto the new canvas with padding
        ctx.drawImage(
          canvasImage,
          padding,
          padding,
          canvasElement.width,
          canvasElement.height
        );

        // Set watermark position (top-right corner, bigger size)
        const watermarkWidth = 300; // Increased watermark size
        const aspectRatio = watermarkImage.width / watermarkImage.height;
        const watermarkHeight = watermarkWidth / aspectRatio;
        const margin = 30; // Margin from the edges

        ctx.drawImage(
          watermarkImage,
          finalCanvas.width - watermarkWidth - margin, // X position (right-aligned)
          margin, // Y position (top-aligned)
          watermarkWidth, // Increased width
          watermarkHeight // Increased height
        );

        // Determine the filename based on the URL
        const fileName = window.location.pathname.includes("/calculadora-fire")
          ? "simulacaoLT-grafico-FIRE.png"
          : window.location.pathname.includes("/calculadora-sp500")
          ? "simulacaoLT-grafico-SP500.png"
          : window.location.pathname.includes("/calculadora-credito-pessoal")
          ? "simulacaoLT-grafico-credito-pessoal.png"
          : window.location.pathname.includes("/simulador-credito-a-habitacao")
          ? "simulacaoLT-grafico-prestacao-credito-habitação.png"
          : "simulacaoLT-grafico-juros-compostos.png";

        triggerDownload(finalCanvas.toDataURL("image/png", 1.0), fileName);
      });
    };
  }

  // Capture graph image when button is clicked
  const graphButton = document.querySelector("[download-graph-image-button]");
  if (!graphButton) return;

  if (!isSalario) {
    graphButton.addEventListener("click", downloadCanvasGraph);
    return;
  }

  // A imagem deixa de servir assim que os numeros mudam.
  document.addEventListener("input", invalidate, true);
  document.addEventListener("change", invalidate, true);
  document.addEventListener(
    "click",
    function (e) {
      if (e.target && e.target.closest && e.target.closest("#calcular")) {
        invalidate();
        scheduleWarm();
      }
    },
    true
  );

  // Aquece quando o menu "..." abre — da o tempo que o clique nao tem.
  const dropdown = graphButton.closest(".w-dropdown");
  const toggle = dropdown && dropdown.querySelector(".w-dropdown-toggle");
  if (toggle) {
    toggle.addEventListener("pointerdown", function () {
      warm().catch(function () {});
    });
  }
  graphButton.addEventListener("pointerenter", function () {
    warm().catch(function () {});
  });

  graphButton.addEventListener("click", function (e) {
    e.preventDefault();

    if (cachedUrl) {
      // Caminho rapido: nada de assincrono entre o toque e o download.
      triggerDownload(cachedUrl, "simulacao-salario-liquido.png");
      return;
    }

    warm()
      .then((url) => triggerDownload(url, "simulacao-salario-liquido.png"))
      .catch((err) => console.error(err));
  });
});
