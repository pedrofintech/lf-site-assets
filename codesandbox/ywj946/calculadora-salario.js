$(document).ready(function () {
  // 2026 EE määrad
  const TULUMAKS = 0.22;
  const SOTSIAALMAKS = 0.33;
  const TA_RATE = 0.008;
  const TT_RATE = 0.016;
  const SOTS_MIN_BAAS = 886; // 2026

  let myDonutChart = null;

  // Sama parser nagu PT originaalis: koma = tuhandeline, punkt = kümnend
  const parseNumber = (v) => {
    if (!v) return 0;
    return parseFloat(String(v).replace(/\s/g, "").replace(/,/g, "")) || 0;
  };
  function formatEuro(v) {
    if (typeof v !== "number" || !isFinite(v)) v = parseFloat(v) || 0;
    return (
      v
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "€"
    );
  }

  $("#calcular").on("click", function (e) {
    e.preventDefault();
    $(".placeholder-results_wrapper").hide();
    $(".all-results_wrapper").css("display", "flex");

    // ── SISENDID ──
    let summa = parseNumber($('[data-type="summa"]').val());
    const tyyp =
      $('input[name="radio-tyyp"]:checked').attr("id") || "brutopalk";
    const perioodVal = ($("#periood").val() || "kuus").toLowerCase();
    const onAasta = perioodVal.indexOf("aas") === 0; // "aastas"/"aasta"
    const maksuvaba = parseNumber($('[data-type="maksuvaba"]').val());

    const sotsMinOn = $("#sotsmaks-min").is(":checked");
    const vanadus = $("#vanaduspension").is(":checked");
    const taOn = $("#ta-tootlus").is(":checked"); // tööandja 0,8% JÄÄB ka pensionieas
    const ttOn = $("#tt-tootlus").is(":checked") && !vanadus; // töötaja 1,6% lõpeb pensionieas

    const pensP = (parseFloat($("#morada").val()) || 0) / 100;

    if (summa <= 0) return;
    if (onAasta) summa = summa / 12; // arvutus käib kuu põhiselt

    const taRate = taOn ? TA_RATE : 0;
    const ttRate = ttOn ? TT_RATE : 0;

    // ── Leia brutopalk sisendi tüübist ──
    let gross;
    if (tyyp === "brutopalk") {
      gross = summa;
    } else if (tyyp === "tooandja-kulu") {
      gross = summa / (1 + SOTSIAALMAKS + taRate);
    } else {
      // netopalk
      const f = 1 - pensP - ttRate;
      let g = (summa - TULUMAKS * maksuvaba) / (f * (1 - TULUMAKS));
      if (g * f <= maksuvaba) g = summa / f;
      gross = g;
    }

    // ── Arvutus ──
    const sotsBaas = sotsMinOn && gross < SOTS_MIN_BAAS ? SOTS_MIN_BAAS : gross;
    const sotsiaalmaks = sotsBaas * SOTSIAALMAKS;
    const taTootus = gross * taRate;
    const tooandjaKulu = gross + sotsiaalmaks + taTootus;
    const kogumispension = gross * pensP;
    const ttTootus = gross * ttRate;
    const maksustatav = Math.max(
      0,
      gross - kogumispension - ttTootus - maksuvaba
    );
    const tulumaks = maksustatav * TULUMAKS;
    const neto = gross - kogumispension - ttTootus - tulumaks;

    // ── TULEMUSED ──
    $("[salario-liquido-result]").text(formatEuro(neto));
    $("[ss-result]").text(formatEuro(sotsiaalmaks));
    $("[irs-retencao-rendi-result]").text(formatEuro(tulumaks));
    $("[irs-retencao-duo-result]").text(formatEuro(kogumispension));
    $("[ret-retribuicao-extra-result]").text(formatEuro(ttTootus));
    $("[rendimento-tributavel-result]").text(formatEuro(tooandjaKulu));
    $("[retribuicao-extra-result]").text(formatEuro(sotsiaalmaks));
    $("[duodecimos-result]").text(formatEuro(taTootus));
    $("[salario-bruto-result]").text(formatEuro(gross));
    $("[valor-bruto-result]").text(formatEuro(gross * 12));
    $("[custo-mensal-empresa-result]").text(formatEuro(tooandjaKulu));
    $("[custo-anual-empresa-result]").text(formatEuro(tooandjaKulu * 12));

    // Kaartide protsendid: eq(0) = Tulumaks kaart, eq(1) = Kogumispension kaart
    $("[irs-percentage-result]").eq(0).text("22%");
    $("[irs-percentage-result]")
      .eq(1)
      .text((pensP * 100).toFixed(0) + "%");

    // ── GRAAFIK ──
    const canvas = document.querySelector(".graph-canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (myDonutChart) myDonutChart.destroy();
      myDonutChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: [
            "Netopalk",
            "Tulumaks",
            "Kogumispension",
            "Töötuskindlustus",
          ],
          datasets: [
            {
              data: [neto, tulumaks, kogumispension, ttTootus],
              backgroundColor: ["#2970FF", "#FD8D2B", "#31AF89", "#FEC84B"],
              borderWidth: 0,
              cutout: "80%",
            },
          ],
        },
        options: { responsive: true, plugins: { legend: { display: false } } },
      });
    }
  });
});
