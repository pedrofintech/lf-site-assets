$(document).on("change", 'input[name="radio-sp"]', function () {
  const selectedValue = $(this).val(); // Get selected radio value
  $('[data-type="yield"]').val(selectedValue); // Set it to the yield input
});

$('input[name="radio-sp"]').on("change", function () {
  const $label = $(this).closest("label");
  const selectedLabel = $label.find("span").text().trim();
  const description = $label.attr("description-radio-text")?.trim();
  const $input = $('[data-type="yield"]');
  const $descriptionTarget = $("[description-radio-text-description]");

  // Toggle disabled state
  if (
    selectedLabel === "S&P 500*" ||
    selectedLabel === "MSCI World*" ||
    selectedLabel === "MSCI ACWI*"
  ) {
    $input.addClass("is-disabled");
  } else {
    $input.removeClass("is-disabled");
    $('[data-format="decimal-number"][data-type="yield"]').focus();
  }

  // Handle description text
  if (description) {
    $descriptionTarget.text(description).show();
  } else {
    $descriptionTarget.hide();
  }
});

//CALCULAR

document.getElementById("calcular").addEventListener("click", function (e) {
  e.preventDefault();

  $(".all-results_wrapper").css("display", "flex");

  /*const parseFormattedNumber = (value) =>
    parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;

  const formatCurrency = (value) => {
    return (
      value
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "$"
    );
  };*/
  const parseFormattedNumber = (value) =>
    parseFloat(
      value
        .replace(/[^\d,.-]/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    ) || 0;

  const formatCurrency = (value) => {
    return (
      "$" +
      value
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    );
  };

  const initialInvestment = parseFormattedNumber(
    document.querySelector('[data-type="initial-investment"]').value
  );

  const monthlyInvestment = parseFormattedNumber(
    document.querySelector('[data-type="monthly-investment"]').value
  );

  const periodYears = parseInt(
    document.querySelector('[data-type="period-years"]').value
  );

  const annualYield = parseFormattedNumber(
    document.querySelector('[data-type="yield"]').value
  );

  const frequencyDropdown = document.querySelector("#Frequ-ncia");
  const frequency = "Anual";

  let totalDeposits = initialInvestment;
  let previousTotal = initialInvestment;
  let yearStartAmount = initialInvestment;
  const tableData = [];
  const annualData = [];
  const totalData = [];
  const interestData = [];
  let finalCapital = 0;
  let accumulatedInterest = 0;

  const periodsPerYear =
    frequency === "Mensal" ? 12 : frequency === "Trimestral" ? 4 : 1;

  for (let period = 1; period <= periodYears * periodsPerYear; period++) {
    let montanteInicialComJuros;
    let interest;
    let contributions;
    let totalAmount;

    if (frequency === "Mensal") {
      montanteInicialComJuros =
        period === 1 ? initialInvestment : previousTotal;

      // Calculate interest only on the initial amount
      interest = montanteInicialComJuros * (annualYield / 100 / 12);

      // Monthly investments are added without interest compounding
      contributions = monthlyInvestment;

      // Total amount at the end of the month
      totalAmount = montanteInicialComJuros + interest + contributions;
    } else if (frequency === "Trimestral") {
      montanteInicialComJuros =
        period % 4 === 1 ? yearStartAmount : previousTotal;

      // Calculate interest
      interest = montanteInicialComJuros * (1 + annualYield / 100 / 4 - 1);

      // Calculate reinforced contributions with adjusted compounding
      contributions =
        monthlyInvestment * Math.pow(1 + annualYield / 100 / 4, 2 / 3) +
        monthlyInvestment * Math.pow(1 + annualYield / 100 / 4, 1 / 3) +
        monthlyInvestment;

      // Calculate interest on contributions
      jurosReforcos = previousTotal - 3 * monthlyInvestment;

      // Total amount at the end of the quarter
      totalAmount = montanteInicialComJuros + interest + contributions;
    } else {
      montanteInicialComJuros =
        period === 1 ? initialInvestment : yearStartAmount;

      // Calculate interest
      interest = montanteInicialComJuros * (annualYield / 100);

      // Calculate reinforced contributions with adjusted compounding
      contributions = 0;
      for (let i = 11; i >= 0; i--) {
        contributions +=
          monthlyInvestment * Math.pow(1 + annualYield / 100, i / 12);
      }

      // Total amount at the end of the year
      totalAmount = montanteInicialComJuros + interest + contributions;
    }

    totalDeposits += monthlyInvestment * (frequency === "Mensal" ? 1 : 3);
    previousTotal = totalAmount;

    if (period % periodsPerYear === 0) {
      yearStartAmount = totalAmount;
      const year = period / periodsPerYear;
      finalCapital = totalAmount;
      accumulatedInterest = totalAmount - totalDeposits;

      annualData.push({
        Ano: year,
        "Total de Depósitos": totalDeposits,
        "Rentabilidade total acumulada": accumulatedInterest,
        "Montante Total": totalAmount,
      });

      totalData.push(totalAmount - accumulatedInterest);
      interestData.push(accumulatedInterest);
    }

    tableData.push({
      Periodo:
        frequency === "Mensal"
          ? `Mês ${period}`
          : frequency === "Trimestral"
          ? `Trimestre ${period}`
          : `Ano ${period}`,
      "Montante Inicial com Juros": montanteInicialComJuros,
      Juros: interest,
      Reforços: contributions,
      "Montante Total": totalAmount,
    });
  }

  // Console log detalhado com todos os períodos
  let jurosAcumulados = 0; // Inicializar o acumulador de juros
  let totalDepositsFinal = 0; // Inicializar o total de depósitos para o console log

  const consoleTableData = tableData.map((row, index) => {
    const year = Math.ceil((index + 1) / periodsPerYear); // Determinar o ano correspondente ao período

    // Reforços ao longo do ano (mensal * 12)
    const reforcosNoAno = monthlyInvestment * 12;

    // Calcular reforços totais (valor inicial + reforços acumulados ano a ano)
    const reforcosTotais =
      initialInvestment + reforcosNoAno * (year - 1) + reforcosNoAno;

    // Juros dos reforços (reforços com juros - reforços sem juros)
    const jurosReforcos =
      row.Reforços -
      monthlyInvestment *
        (frequency === "Mensal" ? 1 : frequency === "Trimestral" ? 3 : 12);

    // Calcular juros do ano (Juros + Juros dos Reforços)
    const jurosDoAno = row.Juros + jurosReforcos;

    // Atualizar os juros acumulados
    jurosAcumulados += jurosDoAno;

    // Atualizar valores finais
    totalDepositsFinal = reforcosTotais;

    return {
      Periodo: row.Periodo,
      "Montante Inicial com Juros": formatCurrency(
        row["Montante Inicial com Juros"]
      ),
      Juros: formatCurrency(row.Juros),
      "Juros dos Reforços": formatCurrency(jurosReforcos),
      "Juros do Ano": formatCurrency(jurosDoAno),
      "Juros Acumulados": formatCurrency(jurosAcumulados),
      "Total de Depósitos": formatCurrency(totalDepositsFinal),
      "Montante Total": formatCurrency(row["Montante Total"]),
    };
  });

  //console.table(consoleTableData);

  // Atualizar tabela HTML
  let filteredTableData = tableData.filter((_, index) => {
    if (frequency === "Trimestral") {
      return (index + 1) % 4 === 0;
    } else if (frequency === "Mensal") {
      return (index + 1) % 12 === 0;
    } else {
      return true;
    }
  });

  /*

  let tableContent = "";
  filteredTableData.forEach((row, index) => {
    const consoleRow = consoleTableData.find(
      (consoleData) => consoleData.Periodo === row.Periodo
    );

    tableContent += `
          <tr>
            <td>${index + 1}</td>
            <td>${consoleRow["Total de Depósitos"]}</td>
            <td>${consoleRow["Juros Acumulados"]}</td>
            <td>${formatCurrency(row["Montante Total"])}</td>
          </tr>
        `;
  });

  const tableElement = document.querySelector(".table-content");
  tableElement.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Período</th>
              <th>Total de investimentos</th>
              <th>Juros acumulados</th>
              <th>Montante total</th>
            </tr>
          </thead>
          <tbody>
            ${tableContent}
          </tbody>
        </table>
      `;*/

  // Atualizar valores finais no HTML
  const lastConsoleRow = consoleTableData[consoleTableData.length - 1];

  document.querySelector("[capital-final-value]").textContent =
    formatCurrency(finalCapital);
  document.querySelector("[total-depositos-value]").textContent = lastConsoleRow
    ? lastConsoleRow["Total de Depósitos"]
    : formatCurrency(totalDeposits);
  document.querySelector("[total-juros-acumulados-value]").textContent =
    lastConsoleRow
      ? lastConsoleRow["Juros Acumulados"]
      : formatCurrency(accumulatedInterest);

  const resumeText = `
    Se começares com um <b>investimento inicial de ${formatCurrency(
      initialInvestment
    )}</b> e investires <b>${formatCurrency(
    monthlyInvestment
  )}</b> por mês a uma <b>taxa anual de ${annualYield
    .toFixed(2)
    .replace(
      ".",
      ","
    )}%</b> durante <b>${periodYears} anos</b>, alcançarás um <b>capital final de ${formatCurrency(
    finalCapital
  )}</b>. Este montante é composto por <b>${
    lastConsoleRow
      ? lastConsoleRow["Total de Depósitos"]
      : formatCurrency(totalDepositsFinal)
  } em investimentos</b> e <b>${
    lastConsoleRow
      ? lastConsoleRow["Juros Acumulados"]
      : formatCurrency(totalJurosAcumuladosFinal)
  } em rentabilidade total acumulada</b>.
    `;
  document.querySelector("[resume-text]").innerHTML = resumeText;

  // Gerar ou atualizar o gráfico
  const ctx = document.getElementById("resultsChart").getContext("2d");

  // Extrair os valores corretos da console table, garantindo que apenas os períodos finais de cada ano sejam considerados
  const filteredConsoleTableData = consoleTableData.filter((_, index) => {
    if (frequency === "Trimestral") {
      return (index + 1) % 4 === 0; // Apenas a cada 4 trimestres (fim do ano)
    } else if (frequency === "Mensal") {
      return (index + 1) % 12 === 0; // Apenas a cada 12 meses (fim do ano)
    } else {
      return true; // Anual mantém todos os valores corretamente
    }
  });

  const jurosAcumuladosGraphData = filteredConsoleTableData.map((row) =>
    parseFormattedNumber(row["Juros Acumulados"])
  );
  const montanteTotalGraphData = filteredConsoleTableData.map(
    (row) =>
      parseFormattedNumber(row["Montante Total"]) -
      parseFormattedNumber(row["Juros Acumulados"])
  );

  // ———————————————————————————————————————————————
  // ———————————————————————————————————————————————
  // ———————————————————————————————————————————————
  const updateChart = () => {
    const labels = filteredConsoleTableData.map((_, i) => i + 1);

    if (window.chartInstance) window.chartInstance.destroy();

    const ctx = document.getElementById("resultsChart").getContext("2d");

    window.chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Total de investimentos",
            data: montanteTotalGraphData,
            backgroundColor: "#FD8D2B",
            stack: "Stack 0",
          },
          {
            label: "Rentabilidade total acumulada",
            data: jurosAcumuladosGraphData,
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
                return chart.data.datasets.map((dataset, index) => {
                  const meta = chart.getDatasetMeta(index);
                  return {
                    text: dataset.label,
                    fillStyle: dataset.backgroundColor,
                    strokeStyle: dataset.backgroundColor,
                    lineWidth: 0,
                    hidden: meta.hidden,
                    datasetIndex: index,
                    fontColor: meta.hidden
                      ? "rgba(58, 68, 84, 0.5)"
                      : "#3A4454",
                    textDecoration: "none",
                    opacity: meta.hidden ? 0.5 : 1,
                  };
                });
              },
            },
            onClick: function (e, legendItem, legend) {
              const datasetIndex = legendItem.datasetIndex;
              const meta = legend.chart.getDatasetMeta(datasetIndex);
              meta.hidden = meta.hidden === null ? true : !meta.hidden;
              legend.chart.update();
            },
            onHover: (event) => {
              event.chart.canvas.style.cursor = "pointer";
            },
            onLeave: (event) => {
              event.chart.canvas.style.cursor = "default";
            },
          },
          tooltip: {
            displayColors: true,
            position: "nearest",
            backgroundColor: "#121721",
            cornerRadius: 8,
            padding: 12,
            titleFont: {
              family: "Inter",
              size: 11,
              weight: "500",
              color: "#CED5DF",
            },
            bodyFont: {
              family: "Inter",
              size: 11,
              weight: "500",
              color: "#E6E6E6",
            },
            callbacks: {
              title: (t) =>
                t[0].dataIndex + 1 === 1
                  ? "1 ano"
                  : `${t[0].dataIndex + 1} anos`,
              label: (c) => formatCurrency(c.raw),
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
            text: "Capital total",
            align: "start",
            color: "#3A4454",
            font: {
              family: "Inter",
              size: 13, // Increased by 2 points
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
              text: "Anos",
              align: "end",
              color: "#3A4454",
              font: {
                family: "Inter",
                size: 13, // Increased by 2 points
                weight: "500",
                letterSpacing: "-0.0125em",
              },
              padding: { top: 10 },
            },
            ticks: {
              color: "#4F5969",
              font: {
                family: "Inter",
                size: 10, // Increased by 1 point
                weight: "500",
                letterSpacing: "-0.0125em",
              },
            },
            grid: { drawOnChartArea: false },
          },
          y: {
            stacked: true,
            title: {
              display: false, // Removed "Capital total" from the left Y-axis
            },
            ticks: {
              color: "#4F5969",
              font: {
                family: "Inter",
                size: 10, // Increased by 1 point
                weight: "500",
                letterSpacing: "-0.0125em",
              },
              callback: (v) =>
                v >= 1_000_000
                  ? `${(v / 1_000_000).toFixed(1).replace(".0", "")}M`
                  : v >= 1_000
                  ? `${(v / 1_000).toFixed(1).replace(".0", "")}m`
                  : v,
            },
          },
        },
      },
    });
  };

  // Call updateChart after setting up the chart
  updateChart();
});
