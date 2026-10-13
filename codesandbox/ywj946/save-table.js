document.addEventListener("DOMContentLoaded", function () {
  // Function to capture and download a div as an image with padding
  function downloadDivAsImage(divSelector, filename, padding = 30) {
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
  /*const tableButton = document.querySelector("[download-table-image-button]");
  if (tableButton) {
    tableButton.addEventListener("click", function () {
      // Make table active
      $("[table-button]").click();
      downloadDivAsImage(
        ".table-content-watermark_wrapper",
        "simulationEU-table-compound-interest.png",
        30 // Padding
      );
    });
  }*/

  const tableButton = document.querySelector("[download-table-image-button]");
  if (tableButton) {
    tableButton.addEventListener("click", function () {
      $("[table-button]").click();

      const fileName = window.location.pathname.includes(
        "/mortgage-calculator-euros"
      )
        ? "simulationEU-table-mortgage-payment-calculator.png"
        : "simulationEU-table-compound-interest.png";

      downloadDivAsImage(".table-content-watermark_wrapper", fileName, 30);
    });
  }
});
