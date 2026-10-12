/*$(document).ready(function () {
  
  function formatDecimalNumberInput(input) {
    // Remove invalid characters (keep only digits, dots, and commas)
    let rawValue = input.replace(/[^0-9,\.]/g, ""); // Allow only numbers, dots, and commas

    // Normalize to use ',' as the decimal separator
    rawValue = rawValue.replace(/\./g, ",");

    // Split into integer and decimal parts
    const parts = rawValue.split(",");
    let integerPart = parts[0].replace(/\D/g, ""); // Keep only digits in the integer part
    const decimalPart = parts[1] ? parts[1].slice(0, 2) : ""; // Limit the decimal part to 2 digits

    // Ensure the integer part is within the maximum limit
    if (parseInt(integerPart, 10) > 100) {
      integerPart = "100"; // Cap the integer part at 100
    }

    // If the total value exceeds 100, ensure no decimal part
    if (integerPart === "100") {
      return "100"; // Return exactly 100
    }

    // Return the formatted value
    return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
  }

 
  function formatPositiveIntegerInput(input) {
    return input.replace(/\D/g, ""); // Remove all non-digit characters
  }

 
  function formatCurrencyInput(input) {
    const rawValue = input.replace(/\D/g, ""); // Remove all non-digit characters
    return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Add thousands separators
  }

  // Event bindings for decimal-number inputs
  $("[data-format='decimal-number']").on("input", function () {
    const currentValue = $(this).val(); // Get the current value of the input
    const formattedValue = formatDecimalNumberInput(currentValue); // Format and validate the value
    $(this).val(formattedValue); // Update the input value with the formatted result
  });

  // Event bindings for positive-integer-number inputs
  $("[data-format='positive-integer-number']").on("input", function () {
    const currentValue = $(this).val(); // Get the current value of the input
    const formattedValue = formatPositiveIntegerInput(currentValue); // Format the value
    $(this).val(formattedValue); // Update the input value with the formatted result
  });

  // Event bindings for currency inputs
  $("[data-format='currency']").on("input", function () {
    const currentValue = $(this).val(); // Get the current value of the input
    const formattedValue = formatCurrencyInput(currentValue); // Format the value
    $(this).val(formattedValue); // Update the input value with the formatted result
  });

  // Keypress restrictions for decimal-number inputs
  $("[data-format='decimal-number']").on("keypress", function (e) {
    const char = String.fromCharCode(e.which);

    // Allow only digits, commas, and dots
    if (!/[0-9,\.]/.test(char)) {
      e.preventDefault();
    }

    // If the user presses '.', treat it as ','
    if (char === "." || char === ",") {
      e.preventDefault();
      const currentValue = $(this).val();
      if (!currentValue.includes(",")) {
        $(this).val(currentValue + ",");
      }
    }
  });

  // Keypress restrictions for positive-integer-number inputs
  $("[data-format='positive-integer-number']").on("keypress", function (e) {
    const char = String.fromCharCode(e.which);

    // Allow only digits
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  });

  // Keypress restrictions for currency inputs
  $("[data-format='currency']").on("keypress", function (e) {
    const char = String.fromCharCode(e.which);

    // Allow only digits
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  });

  // Handle focus and blur for all inputs
  $(
    "[data-format='decimal-number'], [data-format='positive-integer-number'], [data-format='currency']"
  ).on("focus", function () {
    if ($(this).val() === "") {
      $(this).val($(this).attr("placeholder")); // Set placeholder as value
    }
    $(this).attr("placeholder", ""); // Clear placeholder
  });

  $(
    "[data-format='decimal-number'], [data-format='positive-integer-number'], [data-format='currency']"
  ).on("blur", function () {
    if ($(this).val() === "") {
      $(this).attr("placeholder", $(this).val()); // Keep current value as placeholder
    }
  });
});
*/

$(document).ready(function () {
  function formatDecimalNumberWithDot(input, maxValue) {
    let rawValue = input.replace(/[^0-9.,]/g, "");

    // Normalize: convert first comma to temporary marker to distinguish from thousands separator
    rawValue = rawValue.replace(",", "#");

    // Replace remaining periods (thousands separators) with nothing
    rawValue = rawValue.replace(/\./g, "");

    // Restore decimal comma
    rawValue = rawValue.replace("#", ",");

    const parts = rawValue.split(",");
    let integerPart = parts[0].replace(/\D/g, "");
    let decimalPart = parts[1] ? parts[1].slice(0, 2) : "";

    if (maxValue !== null && parseInt(integerPart, 10) > maxValue) {
      integerPart = maxValue.toString();
      decimalPart = "";
    }

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return decimalPart
      ? `${formattedInteger},${decimalPart}`
      : formattedInteger;
  }

  $("[data-format='decimal-number-with-dot']").each(function () {
    handleInput($(this), formatDecimalNumberWithDot);
  });

  $("[data-format='decimal-number-with-dot']").on("keypress", function (e) {
    const char = String.fromCharCode(e.which);
    if (!/[0-9,\.]/.test(char)) e.preventDefault();

    if (char === "." || char === ",") {
      e.preventDefault();
      if (!$(this).val().includes(",")) {
        $(this).val($(this).val() + ",");
      }
    }
  });
  /**
   * Format and validate decimal-number input (max value from attribute)
   */
  function formatDecimalNumberInput(input, maxValue) {
    let rawValue = input.replace(/[^0-9,\.]/g, ""); // Allow only numbers, dots, and commas
    rawValue = rawValue.replace(/\./g, ","); // Normalize decimal separator

    const parts = rawValue.split(",");
    let integerPart = parts[0].replace(/\D/g, ""); // Keep only digits
    const decimalPart = parts[1] ? parts[1].slice(0, 2) : ""; // Limit decimal places

    if (maxValue !== null && parseInt(integerPart, 10) > maxValue) {
      integerPart = maxValue.toString();
    }

    if (integerPart === maxValue?.toString()) {
      return maxValue.toString(); // No decimals if at max value
    }

    return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
  }

  /**
   * Format positive-integer input (with max value)
   */
  function formatPositiveIntegerInput(input, maxValue) {
    let value = input.replace(/\D/g, ""); // Remove non-numeric
    if (maxValue !== null && parseInt(value, 10) > maxValue) {
      value = maxValue.toString();
    }
    return value;
  }

  /**
   * Format currency input with thousands separators (with max value)
   */
  function formatCurrencyInput(input, maxValue) {
    let rawValue = input.replace(/\D/g, ""); // Remove non-numeric
    if (maxValue !== null && parseInt(rawValue, 10) > maxValue) {
      rawValue = maxValue.toString();
    }
    return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Add thousands separator
  }

  // General function to handle input events for all formats
  function handleInput($input, formatter) {
    const maxValue = $input.attr("max-value")
      ? parseInt($input.attr("max-value"), 10)
      : null;
    $input.on("input", function () {
      $(this).val(formatter($(this).val(), maxValue));
    });
  }

  // Bind events to respective inputs
  $("[data-format='decimal-number']").each(function () {
    handleInput($(this), formatDecimalNumberInput);
  });

  $("[data-format='positive-integer-number']").each(function () {
    handleInput($(this), formatPositiveIntegerInput);
  });

  $("[data-format='currency']").each(function () {
    handleInput($(this), formatCurrencyInput);
  });

  // Keypress restrictions
  $("[data-format='decimal-number']").on("keypress", function (e) {
    const char = String.fromCharCode(e.which);
    if (!/[0-9,\.]/.test(char)) e.preventDefault();
    if (char === "." || char === ",") {
      e.preventDefault();
      if (!$(this).val().includes(",")) $(this).val($(this).val() + ",");
    }
  });

  $("[data-format='positive-integer-number'], [data-format='currency']").on(
    "keypress",
    function (e) {
      if (!/[0-9]/.test(String.fromCharCode(e.which))) e.preventDefault();
    }
  );

  // Handle focus and blur for placeholders
  $("[data-format]").on("focus", function () {
    if ($(this).val() === "") $(this).val($(this).attr("placeholder"));
    $(this).attr("placeholder", "");
  });

  $("[data-format]").on("blur", function () {
    if ($(this).val() === "") $(this).attr("placeholder", $(this).val());
  });
});
