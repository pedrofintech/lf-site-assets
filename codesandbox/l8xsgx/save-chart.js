document.addEventListener("DOMContentLoaded", function () {
  function downloadGraphImage() {
    const graphElement = document.querySelector(".graph-image-export");

    if (!graphElement) {
      console.error("Graph export element not found.");
      return;
    }

    html2canvas(graphElement, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true, // Ensures cross-origin images can be loaded
      allowTaint: false, // Prevents tainting by ignoring non-CORS images
    })
      .then((canvas) => {
        addPaddingAndSave(canvas, 40); // Adds 20px padding
      })
      .catch((error) => {
        console.error("Error capturing graph with html2canvas:", error);
      });
  }

  function addPaddingAndSave(originalCanvas, padding) {
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = originalCanvas.width + padding * 2;
    finalCanvas.height = originalCanvas.height + padding * 2;
    const ctx = finalCanvas.getContext("2d");

    // Fill background with white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // Draw the original canvas onto the new one with padding
    ctx.drawImage(originalCanvas, padding, padding);

    saveImage(finalCanvas);
  }

  function saveImage(canvas) {
    // Determine the filename based on the URL
    const fileName = window.location.pathname.includes("/fire-calculator")
      ? "simulationBM-chart-FIRE.png"
      : window.location.pathname.includes("/sp500-calculator")
      ? "simulationBM-chart-SP500.png"
      : window.location.pathname.includes("/sip-calculator")
      ? "simulationBM-chart-SIP.png"
      : "simulationBM-chart-compound-interest.png";

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png", 1.0);
    link.download = fileName;
    link.click();
  }

  const graphButton = document.querySelector("[download-graph-image-button]");
  if (graphButton) {
    graphButton.addEventListener("click", downloadGraphImage);
  }
});
