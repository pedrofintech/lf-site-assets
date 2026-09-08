document.addEventListener("DOMContentLoaded", function () {
  // O link tem de estar no documento: o Safari ignora cliques em elementos soltos.
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
     Esta e a unica pagina em que o grafico e montado em HTML. Passava pelo
     html2canvas, mas no Safari do iPhone o html2canvas nunca termina quando o
     alvo contem uma <canvas>: a promessa fica pendente para sempre, sem erro,
     e o download nunca acontecia. Aqui o bloco e composto a mao numa canvas,
     a partir das posicoes medidas no proprio DOM. Leva poucos milissegundos e
     corre todo dentro do clique, que e o que o Safari exige.                */
  const EXPORT_SELECTOR = ".graph-image-export";
  const S = 2;              // 2x para a imagem nao sair esborratada
  const PAD = 30 * S;
  const svgCache = new Map();

  // Um SVG serializado perde as cores que vinham do CSS: sem isto sai invisivel.
  function svgToImage(svg) {
    return new Promise(function (resolve) {
      const path = svg.querySelector("path");
      const fill = path ? getComputedStyle(path).fill : "#96A0B0";
      const clone = svg.cloneNode(true);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.removeAttribute("style");
      clone.setAttribute("fill", fill);
      const vb = (clone.getAttribute("viewBox") || "").split(/[\s,]+/);
      if (vb.length === 4) {
        clone.setAttribute("width", vb[2]);
        clone.setAttribute("height", vb[3]);
      }
      const blob = new Blob([new XMLSerializer().serializeToString(clone)], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  // Pre-carrega os SVG para a composicao poder ser sincrona no clique.
  function preloadSvgs() {
    const root = document.querySelector(EXPORT_SELECTOR);
    if (!root) return Promise.resolve();
    const svgs = Array.prototype.slice.call(root.querySelectorAll("svg"));
    return Promise.all(
      svgs.map(function (svg) {
        return svgToImage(svg).then(function (img) { svgCache.set(svg, img); });
      })
    );
  }

  function composeExport() {
    const root = document.querySelector(EXPORT_SELECTOR);
    if (!root) return null;
    const R = root.getBoundingClientRect();
    if (!R.width || !R.height) return null;

    const cv = document.createElement("canvas");
    cv.width = Math.round(R.width * S) + PAD * 2;
    cv.height = Math.round(R.height * S) + PAD * 2;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cv.width, cv.height);

    const px = (v) => v * S;
    const X = (b) => PAD + px(b.left - R.left);
    const Y = (b) => PAD + px(b.top - R.top);

    function roundRect(x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
    }

    // 1) fundos, graficos e icones
    root.querySelectorAll("*").forEach(function (el) {
      const b = el.getBoundingClientRect();
      if (b.width < 1 || b.height < 1) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || +cs.opacity === 0) return;
      const tag = el.tagName.toLowerCase();

      if (tag === "canvas") {
        ctx.drawImage(el, X(b), Y(b), px(b.width), px(b.height));
        return;
      }
      if (tag === "svg") {
        const img = svgCache.get(el);
        if (img) ctx.drawImage(img, X(b), Y(b), px(b.width), px(b.height));
        return;
      }
      const bg = cs.backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        ctx.fillStyle = bg;
        roundRect(X(b), Y(b), px(b.width), px(b.height), px(parseFloat(cs.borderRadius) || 0));
      }
    });

    // 2) texto, no a no: apanha tambem texto misturado com elementos filhos
    //    (ex.: "Retencao IRS (1,37%)", em que a percentagem vive num filho)
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let node;
    while ((node = walker.nextNode())) {
      const txt = node.nodeValue.replace(/\s+/g, " ").trim();
      if (!txt) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const b = range.getBoundingClientRect();
      if (b.width < 1 || b.height < 1) continue;
      const cs = getComputedStyle(node.parentElement);
      if (cs.visibility === "hidden" || +cs.opacity === 0) continue;
      ctx.fillStyle = cs.color;
      ctx.font =
        cs.fontStyle + " " + cs.fontWeight + " " + px(parseFloat(cs.fontSize)) + "px " + cs.fontFamily;
      ctx.fillText(txt, X(b), Y(b) + px(b.height) / 2);
    }

    return cv.toDataURL("image/png", 1.0);
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

  // Os icones sao pre-carregados; a composicao em si e sincrona.
  preloadSvgs();
  document.addEventListener("click", function (e) {
    if (e.target && e.target.closest && e.target.closest("#calcular")) preloadSvgs();
  }, true);

  graphButton.addEventListener("click", function (e) {
    e.preventDefault();
    const url = composeExport();
    if (!url) return;
    triggerDownload(url, "simulacao-salario-liquido.png");
  });
});
