let loanChart = null;
let amortTable = []; // persiste entre cálculos para os botões load/hide

function roundTo2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

function toNumber(val) {
  if (val == null) return 0;
  const s = String(val).trim();
  if (s.includes(",") && s.includes("."))
    return parseFloat(s.replace(/\./g, "").replace(",", "."));
  if (s.includes(",")) return parseFloat(s.replace(",", "."));
  return parseFloat(s) || 0;
}

function renderTable(rows, limit) {
  const data = limit ? rows.slice(0, limit) : rows;
  let tableContent = "";

  data.forEach(function (row) {
    tableContent +=
      "<tr>" +
      "<td>" + row.mes + "</td>" +
      "<td>" + formatCurrency(row.amortizacao) + "</td>" +
      "<td>" + formatCurrency(row.juros) + "</td>" +
      "<td>" + formatCurrency(row.capitalEmDivida) + "</td>" +
      "<td>" + formatCurrency(row.pagamentoMensal) + "</td>" +
      "</tr>";
  });

  document.querySelector(".table-content").innerHTML =
    "<table>" +
    "<thead><tr>" +
    "<th>Mês</th>" +
    "<th>Amortização de capital</th>" +
    "<th>Juros</th>" +
    "<th>Saldo Devedor</th>" +
    "<th>Pagamento Mensal</th>" +
    "</tr></thead>" +
    "<tbody>" + tableContent + "</tbody>" +
    "</table>";
}

$(document).ready(function () {
  // ------ CALCULAR ------
  $("#calcular").on("click", function (e) {
    e.preventDefault();
    $(".all-results_wrapper").css("display", "flex");

    // INPUTS
    const L = roundTo2(
      Number($('[data-type="montante-emprestimo"]').val().replace(/\./g, ""))
    );
    const n = parseInt($('[data-type="period-meses"]').val(), 10);
    const TAEG = toNumber($('[data-type="taeg"]').val()) / 100;

    // CÁLCULOS
    const i = Math.pow(1 + TAEG, 1 / 12) - 1;
    const PMT = roundTo2(i === 0 ? L / n : (L * i) / (1 - Math.pow(1 + i, -n)));
    const MTIC = roundTo2(PMT * n);
    const CustoTotal = roundTo2(MTIC - L);

    // TABELA DE AMORTIZAÇÃO
    amortTable = [];
    const juros = [];
    const amortizacao = [];
    let saldo = L;
    for (let k = 0; k < n; k++) {
      const jurosMes = roundTo2(saldo * i);
      const amortMes = roundTo2(PMT - jurosMes);
      saldo = roundTo2(saldo - amortMes);
      juros.push(jurosMes);
      amortizacao.push(amortMes);
      amortTable.push({
        mes: k + 1,
        juros: jurosMes,
        amortizacao: amortMes,
        capitalEmDivida: saldo,
        pagamentoMensal: PMT,
      });
    }

    // RESULTADOS
    document.querySelector("[pagamento-mensal-medio-value]").textContent =
      formatCurrency(PMT);
    document.querySelector("[custo-total-emprestimo-value]").textContent =
      formatCurrency(CustoTotal);
    document.querySelector("[mtic-value]").textContent = formatCurrency(MTIC);

    // DISCLAIMER
    const taegDisplay =
      toNumber($('[data-type="taeg"]').val()).toFixed(2).replace(".", ",") +
      "%";
    document.querySelector("[data-disclaimer]").innerHTML =
      "Se pedir um <b>empréstimo de " +
      formatCurrency(L) +
      "</b>, por <b>" +
      n +
      " meses</b>, com um <b>CET de " +
      taegDisplay +
      "</b>, terá uma <b>parcela mensal média de " +
      formatCurrency(PMT) +
      "</b>. No total, pagará <b>" +
      formatCurrency(MTIC) +
      "</b>, dos quais <b>" +
      formatCurrency(CustoTotal) +
      " são juros e outros custos</b>.";

    // TABELA
    renderTable(amortTable, 30);
    if (amortTable.length > 30) {
      $("#table-load-more-button").css("display", "flex");
    } else {
      $("#table-load-more-button").hide();
    }
    $("#table-hide-more-button").hide();

    // GRÁFICO
    const canvas = document.querySelector(".graph-canvas");
    if (!canvas) return;

    if (loanChart) loanChart.destroy();

    const labels = Array.from({ length: n }, function (_, k) {
      return k + 1;
    });

    loanChart = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Juros",
            data: juros,
            backgroundColor: "#F1BA05",
            borderSkipped: false,
            barPercentage: 0.9,
            categoryPercentage: 0.8,
            stack: "total",
          },
          {
            label: "Amortização de capital",
            data: amortizacao,
            backgroundColor: "#035B37",
            borderSkipped: false,
            barPercentage: 0.9,
            categoryPercentage: 0.8,
            stack: "total",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          tooltip: {
            displayColors: true,
            backgroundColor: "#121721",
            cornerRadius: 8,
            padding: 12,
            titleFont: { family: "Inter", size: 11, weight: "500" },
            bodyFont: { family: "Inter", size: 11, weight: "500" },
            callbacks: {
              title: function (t) {
                return "Mês " + t[0].label;
              },
              label: function (c) {
                return c.dataset.label + ": " + formatCurrency(c.raw ?? c.parsed?.y);
              },
              labelColor: function (c) {
                return {
                  backgroundColor: c.dataset.backgroundColor,
                  borderColor: c.dataset.backgroundColor,
                  borderWidth: 0,
                  borderRadius: 50,
                };
              },
            },
            usePointStyle: true,
            bodySpacing: 5,
            boxPadding: 3,
          },
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
            },
          },
          title: {
            display: true,
            text: "Valor da prestação",
            align: "start",
            color: "#3A4454",
            font: {
              family: "Inter",
              size: 11,
              weight: "500",
              letterSpacing: "-0.0125em",
            },
            padding: { top: 0, bottom: 25 },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            title: {
              display: true,
              text: "Nº da prestação",
              align: "end",
              color: "#3A4454",
              font: {
                family: "Inter",
                size: 11,
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
          },
          y: {
            stacked: true,
            grid: { color: "#E5E7EB", drawBorder: false },
            ticks: {
              color: "#4F5969",
              font: {
                family: "Inter",
                size: 10,
                weight: "500",
                letterSpacing: "-0.0125em",
              },
              callback: function (value) {
                return formatCurrency(value);
              },
            },
          },
        },
      },
    });
  });

  // ------ VER TODOS OS MESES ------
  $("#table-load-more-button").on("click", function (e) {
    e.preventDefault();
    renderTable(amortTable, null);
    $("#table-load-more-button").hide();
    $("#table-hide-more-button").css("display", "flex");
  });

  // ------ VER MENOS ------
  $("#table-hide-more-button").on("click", function (e) {
    e.preventDefault();
    renderTable(amortTable, 30);
    $("#table-load-more-button").css("display", "flex");
    $("#table-hide-more-button").hide();

    gsap.to(window, {
      duration: 1,
      scrollTo: { y: ".table-content", offsetY: 100 },
      ease: "power1.inOut",
    });
  });
});
