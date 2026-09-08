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

  // O Safari do iPhone so autoriza um download enquanto ele ainda esta colado
  // ao toque da pessoa. O html2canvas demora centenas de milissegundos a
  // desenhar a tabela, o que cai sempre fora dessa janela — por isso o
  // download nunca funcionava em iPhone. A imagem passa a ser gerada quando o
  // menu "..." abre, e o clique fica instantaneo.
  var TABLE_SELECTOR = ".table-content-watermark_wrapper";
  var PADDING = 30;
  var cachedUrl = null;
  var pending = null;

  function invalidate() {
    cachedUrl = null;
    pending = null;
  }

  function buildImage() {
    var target = document.querySelector(TABLE_SELECTOR);
    if (!target) return Promise.reject(new Error("Div not found: " + TABLE_SELECTOR));

    var h2cReady = ensureHtml2Canvas();

    // Renderiza um clone fora do ecra: assim nao e preciso mudar de separador
    // nem mexer no que a pessoa esta a ver para gerar a imagem.
    var wrapper = document.createElement("div");
    wrapper.style.cssText =
      "position:absolute;left:-9999px;top:0;padding:" +
      PADDING +
      "px;background:#fff;box-sizing:border-box;";
    var clone = target.cloneNode(true);
    clone.style.display = "block";
    clone.style.maxHeight = "none";
    clone.style.overflow = "visible";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    function cleanup() {
      if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    }

    return Promise.resolve()
      .then(function () {
        return document.fonts && document.fonts.ready;
      })
      .then(function () {
        return new Promise(function (r) {
          requestAnimationFrame(function () {
            requestAnimationFrame(r);
          });
        });
      })
      .then(function () {
        return h2cReady;
      })
      .then(function (html2canvas) {
        var rect = wrapper.getBoundingClientRect();
        var maxDim = 16384; // safe-ish browser limit
        var scale = Math.min(
          2, // don't force 4x for very tall content
          maxDim / Math.max(rect.width, 1),
          maxDim / Math.max(rect.height, 1)
        );
        return html2canvas(wrapper, {
          backgroundColor: "#fff",
          useCORS: true,
          willReadFrequently: true,
          scale: scale,
        });
      })
      .then(function (canvas) {
        var url = canvas.toDataURL("image/png");
        cleanup();
        return url;
      })
      .catch(function (err) {
        cleanup();
        throw err;
      });
  }

  function warm() {
    if (cachedUrl || pending) return pending;
    pending = buildImage()
      .then(function (url) {
        cachedUrl = url;
        return url;
      })
      .catch(function (err) {
        pending = null;
        throw err;
      });
    return pending;
  }

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
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    // O link tem de estar no documento: o Safari ignora cliques em elementos soltos.
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const tableButton = document.querySelector("[download-table-image-button]");
  const isHabitacao = window.location.pathname.includes(
    "/simulador-credito-a-habitacao"
  );
  const fileName = isHabitacao
    ? "simulacaoLT-tabela-prestacao-credito-habitacao.png"
    : "simulacaoLT-tabela-juros-compostos.png";

  if (tableButton) {
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
    var dropdown = tableButton.closest(".w-dropdown");
    var toggle = dropdown && dropdown.querySelector(".w-dropdown-toggle");
    if (toggle) {
      toggle.addEventListener("pointerdown", function () {
        warm().catch(function () {});
      });
    }
    tableButton.addEventListener("pointerenter", function () {
      warm().catch(function () {});
    });

    tableButton.addEventListener("click", function (e) {
      e.preventDefault();
      $("[table-button]").click();

      if (cachedUrl) {
        // Caminho rapido: nada de assincrono entre o toque e o download.
        triggerDownload(cachedUrl, fileName);
        return;
      }

      // Sem imagem pronta (desktop, ou menu aberto por teclado): o
      // comportamento antigo continua a funcionar.
      warm()
        .then(function (url) {
          triggerDownload(url, fileName);
        })
        .catch(function (err) {
          console.error(err);
        });
    });
  }
});
