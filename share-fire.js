document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#wf-form-Form"); // Select the form
  const inputs = form.querySelectorAll("input, select"); // Get all inputs and select fields
  const shareUrlButton = document.querySelector("[share-url]"); // Select share button
  const calcularButton = document.querySelector("#calcular"); // Select calcular button

  // Mapping long parameter names to shorter ones
  const paramMap = {
    age: "a",
    "initial-investment": "i-inv",
    "monthly-investment": "m-inv",
    "expected-yield": "e-y",
    taxes: "tx",
    "expected-value": "e-v",
  };

  // Reverse mapping to decode parameters back to full names
  const reverseParamMap = Object.fromEntries(
    Object.entries(paramMap).map(([longName, shortName]) => [
      shortName,
      longName,
    ])
  );

  // Function to get and set values from URL
  const params = new URLSearchParams(window.location.search);
  let hasParams = false;

  inputs.forEach((input) => {
    const longName = input.getAttribute("data-type") || input.name;
    const shortName = paramMap[longName]; // Check if there's a short version

    // Try to get from short name first, then fallback to long name
    const paramValue = params.get(shortName) || params.get(longName);

    if (paramValue !== null) {
      input.value = decodeURIComponent(paramValue);
      hasParams = true;
    }
  });

  // If there were parameters, click the calcular button automatically
  if (hasParams && calcularButton) {
    setTimeout(() => {
      calcularButton.click();
    }, 500); // Small delay to ensure values are properly set before clicking
  }

  // Function to generate and copy the abbreviated URL
  function generateShareableURL() {
    const newParams = new URLSearchParams();
    inputs.forEach((input) => {
      const longName = input.getAttribute("data-type") || input.name;
      const shortName = paramMap[longName] || longName; // Use short name if available

      if (input.value.trim() !== "") {
        newParams.set(shortName, encodeURIComponent(input.value));
      }
    });

    const newUrl = `${window.location.origin}${
      window.location.pathname
    }?${newParams.toString()}`;

    // Copy URL to clipboard
    navigator.clipboard
      .writeText(newUrl)
      .then(() => {
        console.log("Short URL copied:", newUrl);
      })
      .catch((err) => {
        console.error("Error copying link:", err);
      });
  }

  // Attach event to share-url button
  if (shareUrlButton) {
    shareUrlButton.addEventListener("click", generateShareableURL);
  }
});
