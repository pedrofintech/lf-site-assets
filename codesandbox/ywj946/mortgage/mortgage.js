//
let chartJsLoaded = false;
let loanChart = null;

function loadChartJS() {
  return new Promise((resolve) => {
    if (chartJsLoaded) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.onload = () => {
      chartJsLoaded = true;
      resolve();
    };
    document.head.appendChild(script);
  });
}
const selectedTable = [];
//
//
//
//
//
//
//
//
$(document).ready(function () {
  console.log("Check2047");
  $("#calcular").on("click", function (e) {
    e.preventDefault();
    $(".all-results_wrapper").css("display", "flex");
    $("#table-load-more-button").show();
    //

    function toNumber(val) {
      if (val == null) return 0;
      const s = String(val).trim();

      // If it has both, assume "." is thousands and "," is decimal (pt-PT style)
      if (s.includes(",") && s.includes(".")) {
        return parseFloat(s.replace(/\./g, "").replace(",", "."));
      }

      // If only comma, treat as decimal
      if (s.includes(",")) {
        return parseFloat(s.replace(",", "."));
      }

      // If only dot, treat as decimal
      return parseFloat(s);
    }

    function toInt(val) {
      if (val == null) return 0;
      const digits = String(val).replace(/[^\d]/g, "");
      return digits ? parseInt(digits, 10) : 0;
    }

    // ------------------INPUTS------------------
    //
    const L_montanteEmprestimo = roundTo2(
      Number($('[data-type="montante-emprestimo"]').val().replace(/\./g, ""))
    );
    const n_prazoMeses = roundTo2(
      $('[data-type="period-emprestimo"]').val() * 12
    );
    const n_prazoAnos = $('[data-type="period-emprestimo"]').val();
    const TAN_taxaAnualNominal = toNumber($('[data-type="yield"]').val()) / 100;
    const C0_comissoesIniciais = toInt(
      $('[data-type="comissoes-iniciais"]').val().replace(/\./g, "")
    );

    const SeguroAnual_premioAnual = roundTo2(
      Number($('[data-type="premio-seguro"]').val().replace(/\./g, ""))
    );
    // custom attribute -> total-juros-value
    //
    // ------------------INPUTS------------------
    //
    //
    // ------------------CONSTANTES------------------
    //
    const i = TAN_taxaAnualNominal / 12;
    const SeguroMensal = roundTo2(SeguroAnual_premioAnual / 12); //(16.66666666)
    const ComissoesMensais = roundTo2(C0_comissoesIniciais / n_prazoMeses); //1.6666667
    const OutrosCustosFixos = roundTo2(SeguroMensal + ComissoesMensais);
    //
    // ------------------CONSTANTES------------------
    //
    //
    // ------------------Prestação Base do Empréstimo------------------
    //
    const PrestacaoBase = roundTo2(
      (L_montanteEmprestimo * i) / (1 - (1 + i) ** -n_prazoMeses)
    );
    //
    // ------------------Prestação Base do Empréstimo------------------
    //
    //
    // ------------------RESULTADOS------------------
    //
    /*PAGAMENTO MENSAL TAMBÉM ESTÁ MAIS À FRENTE*/
    const PagamentoMensal = roundTo2(
      PrestacaoBase + SeguroMensal + ComissoesMensais
    );
    const TotalJuros = roundTo2(
      PrestacaoBase * n_prazoMeses - L_montanteEmprestimo
    );
    const SeguroTotal = SeguroAnual_premioAnual * (n_prazoMeses / 12);
    const TotalComissoesSeguros = C0_comissoesIniciais + SeguroTotal;
    const CustoTotal = roundTo2(TotalJuros + TotalComissoesSeguros);
    const MontanteTotalConsumidor = roundTo2(L_montanteEmprestimo + CustoTotal);
    //
    // ------------------RESULTADOS------------------
    //
    //
    // Plano de Amortização
    // TABELA
    //
    const col_SaldoInicio = [];
    const col_SaldoFim = [];
    const col_Juros = [];
    const col_Amortizacao = [];
    const col_OutrosCustos = [];
    /*PAGAMENTO MENSAL TAMBÉM ESTÁ MAIS ATRÁS*/
    const col_PagamentoMensal = [];
    const col_CapitalEmDivida = [];
    //
    //
    selectedTable.length = 0;
    for (let k = 1; k < n_prazoMeses + 1; k++) {
      if (k == 1) {
        col_SaldoInicio[k] = L_montanteEmprestimo;
      } else {
        col_SaldoInicio[k] = col_SaldoFim[k - 1];
      }
      col_Juros[k] = roundTo2(col_SaldoInicio[k] * i);
      col_Amortizacao[k] = roundTo2(PrestacaoBase - col_Juros[k]);
      col_OutrosCustos[k] = OutrosCustosFixos;
      col_PagamentoMensal[k] = PrestacaoBase + col_OutrosCustos[k];
      //
      //
      col_SaldoFim[k] = roundTo2(col_SaldoInicio[k] - col_Amortizacao[k]);
      col_CapitalEmDivida[k] = col_SaldoFim[k];
      //
      //
      selectedTable.push({
        mes: k,
        saldoInicio: col_SaldoInicio[k],
        juros: col_Juros[k],
        amortizacao: col_Amortizacao[k],
        outrosCustos: col_OutrosCustos[k],
        pagamentoMensal: col_PagamentoMensal[k],
        saldoFim: col_SaldoFim[k],
        capitalEmDivida: col_CapitalEmDivida[k],
      });
      if (selectedTable.length > 30) {
        $("#table-load-more-button").show();
      } else {
        $("#table-load-more-button").hide();
      }
      /*
      if (k < 5) {
      console.log(
        "-".repeat(10) + "MES " + selectedTable[k - 1].mes + "-".repeat(10)
      );
      console.log("Saldo Início: " + selectedTable[k - 1].saldoInicio);
      console.log("Juros: " + selectedTable[k - 1].juros);
      console.log("Amortização: " + selectedTable[k - 1].amortizacao);
      console.log("Outros Custos: " + selectedTable[k - 1].outrosCustos);
      console.log("Pagamento Mensal: " + selectedTable[k - 1].pagamentoMensal);
      console.log("Capital Em Divida: " + selectedTable[k - 1].capitalEmDivida);
      console.log("Saldo Fim: " + selectedTable[k - 1].saldoFim);
      console.log(
        "-".repeat(10) + "MES " + selectedTable[k - 1].mes + "-".repeat(10)
      );
      console.log("\n".repeat(2));
      }
      */
    }
    //
    // ------------------TAEG------------------
    //
    function presentValue(r, pagamento, nMeses) {
      let pv = 0;
      for (let k = 1; k <= nMeses; k++) {
        pv += pagamento / Math.pow(1 + r, k);
      }
      return pv;
    }

    function solveRate({
      pagamento,
      nMeses,
      netAmount,
      tol = 1e-10,
      maxIter = 1000,
    }) {
      let low = 0;
      let high = 0.02; // 2% monthly is safely above expected
      let mid;

      for (let i = 0; i < maxIter; i++) {
        mid = (low + high) / 2;
        const pv = presentValue(mid, pagamento, nMeses);

        if (Math.abs(pv - netAmount) < tol) {
          return mid;
        }

        if (pv > netAmount) {
          low = mid; // rate too low
        } else {
          high = mid; // rate too high
        }
      }

      return mid;
    }

    // ---- usage ----
    const r = solveRate({
      pagamento: PrestacaoBase + SeguroMensal,
      nMeses: n_prazoMeses,
      netAmount: L_montanteEmprestimo - C0_comissoesIniciais,
    });

    const taeg = Math.pow(1 + r, 12) - 1;

    console.log("Monthly rate:", r);
    console.log("Monthly rate (%):", (r * 100).toFixed(4));
    console.log("TAEG (%):", (taeg * 100).toFixed(2));
    //
    //
    //
    //
    //
    /*
    const tabelaTextValues = `
      <div class="tabela-irs-title_wrapper">
      <span class="text-size-small text-weight-medium" morada-fiscal-result="">Plano de Amortização</span>
      <span class="text-weight-medium">·</span>
      <span class="text-color-tertiary text-size-small" tabela-description-result="">Plano de Amortização</span>
      </div>
        `;
    */
    //document.querySelector(".tabela-irs-values-content").innerHTML =
    //  tabelaTextValues;
    //

    renderTable(selectedTable, 30);

    //
    // ------------------TAEG------------------
    //
    //
    // ------------------RESULTADOS OUTPUT------------------
    //

    const TAEGValue = (document.querySelector("[taeg-value]").textContent =
      (taeg * 100).toFixed(2).replace(".", ",") + "%");

    //
    document.querySelector("[pagamento-mensal-medio-value]").textContent =
      formatEuro(PagamentoMensal);
    document.querySelector("[taeg-value]").textContent =
      (taeg * 100).toFixed(2).replace(".", ",") + "%";
    document.querySelector("[total-juros-value]").textContent =
      formatEuro(TotalJuros);
    document.querySelector("[total-impostos-comissoes-value]").textContent =
      formatEuro(TotalComissoesSeguros);
    document.querySelector("[custo-total-emprestimo-value]").textContent =
      formatEuro(CustoTotal);
    document.querySelector("[mtic-value]").textContent = formatEuro(
      MontanteTotalConsumidor
    );
    //
    // ------------------TULEMUSTE VÄLJUND------------------
    //
    // ------------------Disclaimer VÄLJUND------------------
    document.querySelector("[data-disclaimer]").innerHTML =
      "Kui võtate <b>laenu summas " +
      formatEuro(L_montanteEmprestimo) +
      "</b>, perioodiga <b>" +
      n_prazoAnos +
      " aastat</b>, <b>intressimääraga " +
      TAEGValue +
      "</b> (sisaldades kindlustust, tasusid ja riigilõive), on teie keskmine <b>kuumakse " +
      formatEuro(PagamentoMensal) +
      "</b>. Kokku tasute pangaarvele <b>" +
      formatEuro(MontanteTotalConsumidor) +
      "</b>, millest <b>" +
      formatEuro(CustoTotal) +
      " moodustavad intressid ja muud kaasnevad kulud.</b> <b>KKM</b> (krediidi kulukuse määr) on näitaja, mis peegeldab laenu kogukulu, sisaldades kõiki seonduvaid makseid.";

    // ------------------Disclaimer OUTPUT------------------
    //

    logs();

    function logs() {
      //
      // ------------------INPUTS------------------
      //
      console.log("\n".repeat(2));
      console.log("-".repeat(20) + "INPUT" + "-".repeat(20));
      console.log("Montante do Empréstimo: " + L_montanteEmprestimo);
      console.log("Prazo em Meses: " + n_prazoMeses);
      console.log("Taxa Anual Nominal: " + TAN_taxaAnualNominal);
      console.log("Comissões Iniciais: " + C0_comissoesIniciais);
      console.log("Prémio Anual do Seguro: " + SeguroAnual_premioAnual);
      console.log("-".repeat(20) + "INPUT" + "-".repeat(20));
      console.log("\n".repeat(2));
      //
      // ------------------CONSTANTES------------------
      //
      console.log("-".repeat(20) + "CONSTANTS" + "-".repeat(20));
      console.log("Taxa Mensal (TAN Nominal): " + i);
      console.log("Seguro Mensal: " + SeguroMensal);
      console.log("Comissões iniciais diluídas por mês: " + ComissoesMensais);
      console.log("Outros custos (fixos/mês): " + OutrosCustosFixos);
      console.log("-".repeat(20) + "CONSTANTS" + "-".repeat(20));
      console.log("\n".repeat(2));
      //
      // ------------------Prestação Base do Empréstimo------------------
      //
      console.log(
        "-".repeat(20) + "Prestação Base do Empréstimo" + "-".repeat(20)
      );
      console.log(
        "Prestação base do Empréstimo (capital + juros): " + PrestacaoBase
      );
      console.log(
        "-".repeat(20) + "Prestação Base do Empréstimo" + "-".repeat(20)
      );
      console.log("\n".repeat(2));
      //
      // ------------------RESULTADOS------------------
      //
      console.log("-".repeat(20) + "RESULTADOS" + "-".repeat(20));
      console.log("Pagamento Mensal: " + PagamentoMensal);
      console.log("Total de Juros: " + TotalJuros);
      console.log("Seguro Total: " + SeguroTotal);
      console.log("Total Comissões Seguros: " + TotalComissoesSeguros);
      console.log("Custo Total: " + CustoTotal);
      console.log("Montante Total Consumidor: " + MontanteTotalConsumidor);
      console.log("-".repeat(20) + "RESULTADOS" + "-".repeat(20));
      console.log("\n".repeat(2));
    }
    const canvas = document.getElementById("resultsChart");
    if (!canvas) {
      console.warn("Canvas #resultsChart not found");
      return;
    }

    const ctx = canvas.getContext("2d");

    // ---- SAMPLE DATA (replace with your real logic) ----
    const numeroPrestacoes = n_prazoMeses;
    /*
  let juros = [];
  let amortizacao = [];

  for (let i = 0; i < totalMonths; i++) {
    const interest = Math.max(400 - i * 3.3, 0);
    const amort = monthlyPayment - interest;

    juros.push(Number(interest.toFixed(2)));
    amortizacao.push(Number(amort.toFixed(2)));
  }
  */
    /*
    const labels = Array.from({ length: totalMonths }, (_, i) => i + 1);
  */
    const juros = selectedTable.map((row) => Number(row.juros.toFixed(2)));
    const amortizacao = selectedTable.map((row) =>
      Number(row.amortizacao.toFixed(2))
    );

    const labels = Array.from({ length: numeroPrestacoes }, (_, i) => i + 1);

    const jurosGraphData = juros; // array
    const amortizacaoGraphData = amortizacao; // array
    // ---------------------------------------------------

    // Destroy previous chart (important!)
    if (loanChart) {
      loanChart.destroy();
    }
    /*
  console.log(
    "-".repeat(10) + "MES " + selectedTable[k - 1].mes + "-".repeat(10)
  );
  console.log("Saldo Início: " + selectedTable[k - 1].saldoInicio);
  console.log("Juros: " + selectedTable[k - 1].juros);
  console.log("Amortização: " + selectedTable[k - 1].amortizacao);
  console.log("Outros Custos: " + selectedTable[k - 1].outrosCustos);
  console.log("Pagamento Mensal: " + selectedTable[k - 1].pagamentoMensal);
  console.log("Capital Em Divida: " + selectedTable[k - 1].capitalEmDivida);
  console.log("Saldo Fim: " + selectedTable[k - 1].saldoFim);
  console.log(
    "-".repeat(10) + "MES " + selectedTable[k - 1].mes + "-".repeat(10)
  );
    console.log("\n".repeat(2));
  */
    loanChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Intress",
            data: juros,
            backgroundColor: "#FD8D2B", // other - FF8A1F
            //borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.9,
            categoryPercentage: 0.8,
            stack: "total",
          },
          {
            label: "Põhiosa tagasimakse",
            data: amortizacao,
            backgroundColor: "#2970FF", // other - 2F6DF6
            // borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.9,
            categoryPercentage: 0.8,
            stack: "total",
          },
        ],
        /*datasets: [
          {
            label: "Juros",
            data: jurosGraphData,
            backgroundColor: "#6B4EFF",
            stack: "Stack 0",
          },
          {
            label: "Amortização de capital",
            data: amortizacaoGraphData,
            backgroundColor: "#C7BFFF",
            stack: "Stack 0",
          },
        ],*/
      },
      /*
      layout: {
        padding: {
          top: 32,
          right: 12,
          left: 8,
        },
      },
      */
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: {
          mode: "index", // group by index (month)
          intersect: false, // trigger even if not directly over a bar
        },
        plugins: {
          /*tooltip: {
            caretSize: 0,
            padding: 12,
            boxPadding: 6,
            yAlign: "bottom",

            callbacks: {
              title: (items) => `Mês ${items[0].label}`,

              label: (ctx) => {
                return `${ctx.dataset.label}: ${formatEuro(ctx.parsed.y)}`;
              },
            },
          },*/
          tooltip: {
            displayColors: true,
            //position: "nearest",

            position: undefined, // or just remove this line
            //yAlign: "bottom", // keep if you liked the old anchor
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
              title: (t) => `Kuu ${t[0].label}`,
              label: (c) =>
                `${c.dataset.label}: ${formatEuro(c.raw ?? c.parsed?.y)}`,
              labelColor: (context) => ({
                backgroundColor: context.dataset.backgroundColor,
                borderColor: context.dataset.backgroundColor,
                borderWidth: 0,
                borderRadius: 50,
              }),
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
            text: "Laenu igakuised maksed",
            align: "start",
            color: "#3A4454",
            font: {
              family: "Inter",
              size: 13, // Increased by 2 points
              color: "#3A4454",
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
              text: "Makse number",
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
            grid: {
              display: false,
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
          },
          y: {
            stacked: true,
            title: {
              display: false,
              text: "Valor Da Prestação",
              align: "start",
              color: "#6B7280",
              rotation: 0,
              font: {
                size: 13,
                weight: "500",
              },
              padding: {
                bottom: 24,
              },
            },
            grid: {
              color: "#E5E7EB",
              drawBorder: false,
            },
            ticks: {
              color: "#4F5969",
              font: {
                family: "Inter",
                size: 10, // Increased by 1 point
                weight: "500",
                letterSpacing: "-0.0125em",
              },
              callback: (value) => formatEuro(value),
            },
          },
        },
      },
    });
  });
  $("#table-load-more-button").on("click", function (e) {
    e.preventDefault();
    renderTable(selectedTable, null);
    $("#table-load-more-button").hide();
  });
});
//graph-canvas

function renderTable(rows, limit = null) {
  let tableContent = "";

  const data = limit ? rows.slice(0, limit) : rows;

  data.forEach((row) => {
    tableContent += `
<tr>
  <td>${row.mes}</td>
  <td>${formatEuro(row.amortizacao)}</td>
  <td>${formatEuro(row.juros)}</td>
  <td>${formatEuro(row.outrosCustos)}</td>
  <td>${formatEuro(row.capitalEmDivida)}</td>
  <td>${formatEuro(row.pagamentoMensal)}</td>
</tr>
`;
  });

  document.querySelector(".table-content").innerHTML = `
<table>
<thead>
  <tr>
    <th>Kuu</th>
    <th>Põhiosa makse</th>
    <th>Intress</th>
    <th>Muud kulud</th>
    <th>Laenujääk</th>
    <th>Kuumakse kokku</th>
  </tr>
</thead>
<tbody>
  ${tableContent}
</tbody>
</table>
`;
}
function roundTo2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
function formatEuro(value) {
  if (typeof value === "number") {
    return (
      "€" +
      value
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    );
  } else if (!isNaN(parseFloat(value))) {
    const num = parseFloat(value);
    return (
      "€" +
      num
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    );
  }
  return value;
}
