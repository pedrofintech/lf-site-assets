var TULUMAX_MAAR = 0.22;
var III_SAMBA_MAX_AASTAS = 6000;
var III_SAMBA_PROTSENT = 0.15;
var PENSIONIIGA = 65;

function parseNum(value) {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
}

function formatEur(value) {
  return (
    "\u20AC" +
    value
      .toFixed(2)
      .replace(".", ",")
      .replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0")
  );
}

function formatEurShort(value) {
  return (
    value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0") + "\u00a0\u20AC"
  );
}

function arvutaKasvuPeriood(monthlyInvestment, annualYield, periodYears) {
  if (periodYears <= 0)
    return {
      finalCapital: 0,
      totalDeposits: 0,
      accumulatedInterest: 0,
      tableData: [],
    };
  var periodsPerYear = 12;
  var previousTotal = 0;
  var totalDeposits = 0;
  var finalCapital = 0;
  var tableData = [];

  for (var period = 1; period <= periodYears * periodsPerYear; period++) {
    var montanteInicial = period === 1 ? 0 : previousTotal;
    var interest = montanteInicial * (annualYield / 100 / 12);
    var totalAmount = montanteInicial + interest + monthlyInvestment;
    totalDeposits += monthlyInvestment;
    previousTotal = totalAmount;
    if (period % periodsPerYear === 0) {
      finalCapital = totalAmount;
    }
    tableData.push({
      period: period,
      totalAmount: totalAmount,
      totalDeposits: totalDeposits,
    });
  }

  return {
    finalCapital: finalCapital,
    totalDeposits: totalDeposits,
    accumulatedInterest: finalCapital - totalDeposits,
    tableData: tableData,
  };
}

function arvutaTulumaksutagastusKokku(
  aastaneSissemakse,
  brutotulAastas,
  aastad
) {
  var maxTagastatav = Math.min(
    brutotulAastas * III_SAMBA_PROTSENT,
    III_SAMBA_MAX_AASTAS
  );
  var tegelikTagastatav = Math.min(aastaneSissemakse, maxTagastatav);
  return tegelikTagastatav * TULUMAX_MAAR * aastad;
}

// Arvuta 55-aastase väljamakse maksumäär lepingu aja ja kogumisperioodi põhjal
function arvuta55Maksumaar(lepingEnne2021, aastad55) {
  if (lepingEnne2021) {
    // Enne 2021: 55+ ja vähemalt 5 aastat kogutud -> 10%
    if (aastad55 >= 5) return 0.1;
    // Alla 5 aasta kogutud -> 22%
    return 0.22;
  } else {
    // Pärast 2021: 55-aastaselt ei saa soodusmäära, pensionieani >5a -> 22%
    return 0.22;
  }
}

function uuendaSoovitus() {
  var brutopalk = parseNum(
    (document.querySelector('[data-type="brutopalk"]') || { value: "0" }).value
  );
  var muuTulu = parseNum(
    (document.querySelector('[data-type="muu-tulu"]') || { value: "0" }).value
  );
  var brutotulAastas = brutopalk * 12 + muuTulu;
  var maxSissemakse = Math.min(
    brutotulAastas * III_SAMBA_PROTSENT,
    III_SAMBA_MAX_AASTAS
  );
  var kuineSoovitus = maxSissemakse / 12;

  var el = document.querySelector("[sissemakse-soovitus-text]");
  if (el) {
    el.textContent =
      kuineSoovitus > 0
        ? "Soovituslik: " + formatEurShort(kuineSoovitus) + " / kuus"
        : "";
  }

  var kasutajaSissemakseTemp = parseNum(
    (document.querySelector('[data-type="sissemakse"]') || { value: "0" }).value
  );
  var tegelikSissemakse =
    kasutajaSissemakseTemp > 0 ? kasutajaSissemakseTemp * 12 : maxSissemakse;
  var tegelikTagastus =
    Math.min(tegelikSissemakse, maxSissemakse) * TULUMAX_MAAR;

  var el2 = document.querySelector("[tulumaksuvoit-value]");
  if (el2) el2.textContent = formatEurShort(tegelikTagastus);

  var el3 = document.querySelector("[kuine-soovitus-value]");
  if (el3) el3.textContent = formatEurShort(kuineSoovitus);

  return { kuineSoovitus: kuineSoovitus, brutotulAastas: brutotulAastas };
}

// Radio: leping enne/pärast 2021 - sama loogika nagu radio-sp
$(document).on("change", 'input[name="radio-leping"]', function () {
  var selectedValue = $(this).val();
  $('[data-type="leping-aasta"]').val(selectedValue);

  // Uuenda kirjeldus kui on
  var $label = $(this).closest("label");
  var description = $label.attr("description-radio-text");
  var $descriptionTarget = $("[description-leping-text]");
  if (description) {
    $descriptionTarget.text(description.trim()).show();
  } else {
    $descriptionTarget.hide();
  }
});

$(document).on(
  "input",
  '[data-type="brutopalk"], [data-type="muu-tulu"], [data-type="sissemakse"]',
  function () {
    uuendaSoovitus();
  }
);

$(document).ready(function () {
  uuendaSoovitus();
});

document.getElementById("calcular").addEventListener("click", function (e) {
  e.preventDefault();

  $(".all-results_wrapper").css("display", "flex");

  var soovitus = uuendaSoovitus();

  var kasutajaSissemakse = parseNum(
    (document.querySelector('[data-type="sissemakse"]') || { value: "0" }).value
  );
  var monthlyInvestment =
    kasutajaSissemakse > 0 ? kasutajaSissemakse : soovitus.kuineSoovitus;
  var aastaneSissemakse = monthlyInvestment * 12;

  var vanus =
    parseInt(
      (document.querySelector('[data-type="vanus"]') || { value: "30" }).value
    ) || 30;

  var annualYield = parseNum(
    (document.querySelector('[data-type="yield"]') || { value: "6" }).value
  );

  // Leping enne või pärast 2021 - loe radio väärtust
  var lepingValik = $('input[name="radio-leping"]:checked').val();
  var lepingEnne2021 = lepingValik === "enne-2021";

  // Perioodid vanuse põhjal
  var aastad55 = Math.max(0, 55 - vanus);
  var aastad60 = Math.max(0, 60 - vanus);
  var aastad65 = Math.max(0, PENSIONIIGA - vanus);

  // Stsenaarium: pensionil (65) - peamine, alati maksuvaba
  var sc65 = arvutaKasvuPeriood(monthlyInvestment, annualYield, aastad65);
  var sc65Tagastus = arvutaTulumaksutagastusKokku(
    aastaneSissemakse,
    soovitus.brutotulAastas,
    aastad65
  );
  var sc65Katte = sc65.finalCapital + sc65Tagastus;

  // Stsenaarium: 10% - enne 2021: 55-aastaselt, pärast 2021: 60-aastaselt (pensionieani alla 5a)
  var scSoodusAastad = lepingEnne2021 ? aastad55 : aastad60;
  var scSoodusVanus = lepingEnne2021 ? 55 : 60;
  var scSoodus = arvutaKasvuPeriood(
    monthlyInvestment,
    annualYield,
    scSoodusAastad
  );
  var scSoodusTagastus = arvutaTulumaksutagastusKokku(
    aastaneSissemakse,
    soovitus.brutotulAastas,
    scSoodusAastad
  );
  var scSoodusMaksProtsent = scSoodusAastad >= 5 ? 0.1 : 0.22;
  var scSoodusMaks = scSoodus.finalCapital * scSoodusMaksProtsent;
  var scSoodusKatte = scSoodus.finalCapital - scSoodusMaks + scSoodusTagastus;

  // Stsenaarium: 22% - vara väljavõtmine
  var sc22Aastad = lepingEnne2021 ? aastad55 : aastad55;
  var sc22Vanus = lepingEnne2021 ? 55 : 55;
  var sc55 = arvutaKasvuPeriood(monthlyInvestment, annualYield, aastad55);
  var sc55Tagastus = arvutaTulumaksutagastusKokku(
    aastaneSissemakse,
    soovitus.brutotulAastas,
    aastad55
  );
  var sc55MaksProtsent = 0.22;
  var sc55Maks = sc55.finalCapital * 0.22;
  var sc55Katte = sc55.finalCapital - sc55Maks + sc55Tagastus;

  // --- TABEL ---
  var filteredTableData65 = sc65.tableData.filter(function (_, i) {
    return (i + 1) % 12 === 0;
  });

  var tableContent = "";
  filteredTableData65.forEach(function (row, index) {
    var deposits = formatEur(row.totalDeposits);
    var interest = formatEur(row.totalAmount - row.totalDeposits);
    var total = formatEur(row.totalAmount);
    tableContent +=
      "<tr><td>" +
      (index + 1) +
      "</td><td>" +
      deposits +
      "</td><td>" +
      interest +
      "</td><td>" +
      total +
      "</td></tr>";
  });

  var tableEl = document.querySelector(".table-content");
  if (tableEl) {
    tableEl.innerHTML =
      "<table><thead><tr>" +
      "<th>Periood</th>" +
      "<th>Investeeringud kokku</th>" +
      "<th>Kogunenud intress</th>" +
      "<th>Lõppsumma</th>" +
      "</tr></thead><tbody>" +
      tableContent +
      "</tbody></table>";
  }

  // --- PEAMINE TULEMUS (pensionil) ---
  var elMain = document.querySelector("[capital-final-value]");
  if (elMain) elMain.textContent = formatEur(sc65Katte);

  var elDeposits = document.querySelector("[total-depositos-value]");
  if (elDeposits) elDeposits.textContent = formatEur(sc65.totalDeposits);

  var elInterest = document.querySelector("[total-juros-acumulados-value]");
  if (elInterest) elInterest.textContent = formatEur(sc65.accumulatedInterest);

  var elTagastus = document.querySelector("[tulumaksutagastus-kokku-value]");
  if (elTagastus) elTagastus.textContent = formatEurShort(sc65Tagastus);

  // --- STSENAARIUMIDE LAUSE ---
  var resumeEl = document.querySelector("[resume-text]");
  if (resumeEl) {
    var sc55MakstekstProts = Math.round(sc55MaksProtsent * 100);
    var vahe = sc65Katte - sc55Katte;

    var tekst =
      "Investeerides <b>" +
      formatEur(monthlyInvestment) +
      " kuus</b> <b>" +
      annualYield.toFixed(1).replace(".", ",") +
      "% tootlusega</b>: ";

    if (aastad65 <= 0) {
      tekst +=
        "<br><br><b>Pensionil kätte saad ükskõik kuidas välja võttes: <b>" +
        formatEur(sc65Katte) +
        "</b>.</b> Kui valid eluaegse või keskmiselt elada jäänud aastatele jaotatud tähtajalise pensioni, on väljamaksed <b>maksuvabad</b>.";
    } else if (lepingEnne2021) {
      tekst +=
        "<br><br><b>Pensionil (65) kätte saad: " +
        formatEur(sc65Katte) +
        "</b>. Kui valid eluaegse või keskmiselt elada jäänud aastatele jaotatud tähtajalise pensioni, on väljamaksed <b>maksuvabad ehk 0% tulumaksu</b>.";
      if (scSoodusAastad >= 5) {
        tekst +=
          "<br><br><b>55-aastaselt kätte saad: " +
          formatEur(scSoodusKatte) +
          "</b>. Kuna oled kogunud üle 5 aasta ja leping on sõlmitud enne 2021, rakendub <b>10% tulumaks</b>. See kehtib ühekordse või lühema tähtajalise väljamakse korral.";
      }
      tekst +=
        "<br><br><b>Alla 55-aastaselt või kui oled kogunud alla 5 aasta</b>, rakendub <b>22% tulumaks</b> kogu kogutud summalt.";
    } else {
      tekst +=
        "<br><br><b>Pensionil (65) kätte saad: " +
        formatEur(sc65Katte) +
        "</b>. Kui valid eluaegse või keskmiselt elada jäänud aastatele jaotatud tähtajalise pensioni, on väljamaksed <b>maksuvabad ehk 0% tulumaksu</b>.";
      if (scSoodusAastad >= 5) {
        tekst +=
          "<br><br><b>60-aastaselt kätte saad: " +
          formatEur(scSoodusKatte) +
          "</b>. Kuna pensionieani jääb alla 5 aasta ja oled kogunud üle 5 aasta, rakendub <b>10% tulumaks</b>. See kehtib ühekordse või lühema tähtajalise väljamakse korral.";
      }
      tekst +=
        "<br><br><b>Enne 60. eluaastat või kui oled kogunud alla 5 aasta</b>, rakendub <b>22% tulumaks</b> kogu kogutud summalt.";
    }

    resumeEl.innerHTML = tekst;
  }

  // --- GRAAFIK ---
  var filteredData65 = sc65.tableData.filter(function (_, i) {
    return (i + 1) % 12 === 0;
  });

  var labels = filteredData65.map(function (_, i) {
    return i + 1;
  });
  var depositsData = filteredData65.map(function (row) {
    return row.totalDeposits;
  });
  var interestData = filteredData65.map(function (row) {
    return row.totalAmount - row.totalDeposits;
  });

  if (window.chartInstance) window.chartInstance.destroy();
  var ctx = document.getElementById("resultsChart").getContext("2d");

  window.chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Sissemaksed kokku",
          data: depositsData,
          backgroundColor: "#FD8D2B",
          stack: "Stack 0",
        },
        {
          label: "Kogunenud intress",
          data: interestData,
          backgroundColor: "#2970FF",
          stack: "Stack 0",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: window.innerWidth < 768 ? 20 : 10 } },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 20,
            color: "#3A4454",
            font: {
              family: "Inter",
              size: 12,
              weight: "500",
              letterSpacing: "-0.0125em",
            },
            generateLabels: function (chart) {
              return chart.data.datasets.map(function (dataset, index) {
                var meta = chart.getDatasetMeta(index);
                return {
                  text: dataset.label,
                  fillStyle: dataset.backgroundColor,
                  strokeStyle: dataset.backgroundColor,
                  lineWidth: 0,
                  hidden: meta.hidden,
                  datasetIndex: index,
                  fontColor: meta.hidden ? "rgba(58, 68, 84, 0.5)" : "#3A4454",
                  opacity: meta.hidden ? 0.5 : 1,
                };
              });
            },
          },
          onClick: function (e, legendItem, legend) {
            var meta = legend.chart.getDatasetMeta(legendItem.datasetIndex);
            meta.hidden = meta.hidden === null ? true : !meta.hidden;
            legend.chart.update();
          },
          onHover: function (e) {
            e.chart.canvas.style.cursor = "pointer";
          },
          onLeave: function (e) {
            e.chart.canvas.style.cursor = "default";
          },
        },
        tooltip: {
          displayColors: true,
          position: "nearest",
          backgroundColor: "#121721",
          cornerRadius: 8,
          padding: 12,
          titleFont: { family: "Inter", size: 11, weight: "500" },
          bodyFont: { family: "Inter", size: 11, weight: "500" },
          callbacks: {
            title: function (t) {
              return t[0].dataIndex + 1 === 1
                ? "1 aasta"
                : t[0].dataIndex + 1 + " aastat";
            },
            label: function (c) {
              return c.dataset.label + ": " + formatEur(parseFloat(c.raw));
            },
            labelColor: function (context) {
              return {
                backgroundColor: context.dataset.backgroundColor,
                borderColor: context.dataset.backgroundColor,
                borderWidth: 0,
                borderRadius: 50,
              };
            },
          },
          usePointStyle: true,
          bodySpacing: 5,
          boxPadding: 3,
        },
        title: {
          display: true,
          text: "Kogumi kasv ajas",
          align: "start",
          color: "#3A4454",
          font: {
            family: "Inter",
            size: 13,
            weight: "500",
            letterSpacing: "-0.0125em",
          },
          padding: { top: 0, bottom: 25 },
        },
      },
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: "Aastad",
            align: "end",
            color: "#3A4454",
            font: {
              family: "Inter",
              size: 13,
              weight: "500",
              letterSpacing: "-0.0125em",
            },
            padding: { top: 10 },
          },
          ticks: {
            color: "#4F5969",
            font: {
              family: "Inter",
              size: 10,
              weight: "500",
              letterSpacing: "-0.0125em",
            },
          },
          grid: { drawOnChartArea: false },
        },
        y: {
          stacked: true,
          ticks: {
            color: "#4F5969",
            font: {
              family: "Inter",
              size: 10,
              weight: "500",
              letterSpacing: "-0.0125em",
            },
            callback: function (v) {
              return v >= 1000000
                ? (v / 1000000).toFixed(1).replace(".0", "") + "M"
                : v >= 1000
                ? (v / 1000).toFixed(1).replace(".0", "") + "k"
                : v;
            },
          },
        },
      },
    },
  });
});
