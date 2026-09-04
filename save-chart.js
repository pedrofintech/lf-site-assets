document.addEventListener("DOMContentLoaded", function () {
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

  // Function to capture and download the merged image
  function downloadGraphImage() {
    const currentPath = window.location.pathname;

    if (currentPath.includes("/simulador-salario-liquido")) {
      const exportElement = document.querySelector(".graph-image-export");

      if (!exportElement) {
        console.error("Export element not found.");
        return;
      }

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

      ensureHtml2Canvas()
        .then((html2canvas) => html2canvas(wrapper, { backgroundColor: null }))
        .then((canvas) => {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png", 1.0);
          link.download = "simulacao-salario-liquido.png";
          link.click();
          document.body.removeChild(wrapper);
        })
        .catch((err) => {
          console.error(err);
          document.body.removeChild(wrapper);
        });

      return;
    }

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

        // Download the final image
        const link = document.createElement("a");
        link.href = finalCanvas.toDataURL("image/png", 1.0); // High quality
        link.download = fileName;
        link.click();
      });
    };
  }

  // Capture graph image when button is clicked
  const graphButton = document.querySelector("[download-graph-image-button]");
  if (graphButton) {
    graphButton.addEventListener("click", downloadGraphImage);
  }
});
