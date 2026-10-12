$(document).ready(function () {
  $("#calcular").on("click", function (e) {
    e.preventDefault();

    // Mostrar secção de resultados
    $(".all-results_wrapper").css("display", "flex");

    const parseFormattedNumber = (value) => {
      if (!value) return 0;
      return parseFloat(value.replace(/\./g, "").replace(",", "."));
    };

    const formatCurrency = (value) => {
      return value
        .toFixed(2) // Fix to 2 decimal places
        .replace(".", ",") // Replace the decimal dot with a comma
        .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Add dots as thousand separators
    };

    const idadeAtual = parseInt($("#Investimento-Inicial").val());
    const investimentoInicial = parseFormattedNumber(
      $("#Investimento-Mensal").val()
    );
    const investimentoMensal = parseFormattedNumber($("#Anos").val());
    const taxaRentabilidadeAnual =
      parseFloat($("#Anos-2").val().replace(",", ".")) / 100;
    const taxaImposto = parseFloat($("#Taxa").val().replace(",", ".")) / 100; // Taxa de imposto
    const taxaMensal = taxaRentabilidadeAnual / 12;

    // Calcular valor FIRE
    const valorMensalDesejado = parseFormattedNumber($("#Taxa-2").val());
    const valorFire =
      (valorMensalDesejado * 12) / (taxaRentabilidadeAnual * (1 - taxaImposto));

    let idade = idadeAtual;
    let montanteInicial = investimentoInicial;
    let montanteTotal = investimentoInicial;
    let totalJurosAcumulados = 0;

    const historico = [];
    const years = [];
    const interestData = [];
    const adjustedTotalData = [];
    const realTotalData = [];

    while (montanteTotal < valorFire) {
      // Calcular juros do capital inicial
      const jurosCapitalInicial = montanteInicial * taxaRentabilidadeAnual;

      // Calcular juros dos reforços corretamente (excluindo reforços)
      let jurosReforcos = 0;
      for (let i = 0; i < 12; i++) {
        const reforcoMensal = investimentoMensal; // Valor fixo do reforço mensal
        jurosReforcos +=
          reforcoMensal * Math.pow(1 + taxaMensal, 11 - i) - reforcoMensal;
      }

      // Calcular montante total
      const reforcosAno = investimentoMensal * 12;
      const jurosAno = jurosCapitalInicial + jurosReforcos;
      montanteTotal = montanteInicial + jurosAno + reforcosAno;

      // Atualizar total de juros acumulados
      totalJurosAcumulados += jurosAno;

      // Calcular valor líquido mensal
      const valorLiquidoMensal = montanteTotal * taxaMensal * (1 - taxaImposto);

      // Guardar histórico
      historico.push({
        ano: historico.length + 1,
        idade: idade,
        jurosCapitalInicial: formatCurrency(jurosCapitalInicial),
        jurosReforcos: formatCurrency(jurosReforcos),
        reforcosAno: formatCurrency(reforcosAno),
        totalJuros: formatCurrency(totalJurosAcumulados),
        montanteTotal: formatCurrency(montanteTotal),
        valorLiquidoMensal: formatCurrency(valorLiquidoMensal),
      });

      // Dados para o gráfico
      years.push(historico.length);
      interestData.push(totalJurosAcumulados);
      adjustedTotalData.push(montanteTotal - totalJurosAcumulados);
      realTotalData.push(montanteTotal);

      // Atualizar montante inicial
      montanteInicial = montanteTotal;
      idade++;
    }

    // Console log com detalhes por ano
    console.table(
      historico.map((item) => ({
        Ano: item.ano,
        Idade: item.idade,
        "Juros do Capital Inicial (€)": item.jurosCapitalInicial,
        "Juros dos Reforços (€)": item.jurosReforcos,
        "Reforços (€)": item.reforcosAno,
        "Total de Juros (€)": item.totalJuros,
        "Montante Total (€)": item.montanteTotal,
        "Valor Líquido Mensal (€)": item.valorLiquidoMensal,
      }))
    );

    // Criar ou atualizar o gráfico
    const ctx = document.getElementById("resultsChart").getContext("2d");

    if (window.chartInstance) {
      window.chartInstance.data.labels = years;
      window.chartInstance.data.datasets[0].data = interestData;
      window.chartInstance.data.datasets[1].data = adjustedTotalData;
      window.chartInstance.update();
    } else {
      window.chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: years,
          datasets: [
            {
              label: "Juros Acumulados",
              data: interestData,
              backgroundColor: "#2970FF",
              stack: "Stack 0",
            },
            {
              label: "Total de Investimentos",
              data: adjustedTotalData,
              backgroundColor: "rgba(253, 141, 43, 1)",
              stack: "Stack 0",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const datasetLabel = tooltipItem.dataset.label;
                  const index = tooltipItem.dataIndex;

                  if (datasetLabel === "Montante Total (€)") {
                    return `${datasetLabel}: ${formatCurrency(
                      realTotalData[index]
                    )}`;
                  }

                  return `${datasetLabel}: ${formatCurrency(tooltipItem.raw)}`;
                },
              },
            },
            legend: {
              position: "bottom",
              labels: {
                color: "#202432",
                font: {
                  family: "Inter",
                  size: 14,
                  weight: "bold",
                },
                usePointStyle: true, // Habilitar o uso de ponto personalizado
                pointStyle: "circle", // Definir o estilo do ponto como círculo
              },
              onClick: null, // Disable legend interaction
            },
          },
          scales: {
            x: {
              stacked: true,
              title: {
                display: true,
                text: "Anos",
                color: "#202432",
                font: {
                  family: "Inter",
                  size: 16,
                  weight: "600",
                },
              },
              ticks: {
                color: "#202432",
                font: {
                  family: "Inter",
                  size: 12,
                },
              },
            },
            y: {
              stacked: true,
              ticks: {
                callback: function (value) {
                  return formatCurrency(value);
                },
                color: "#202432",
                font: {
                  family: "Inter",
                  size: 12,
                },
              },
              title: {
                display: true,
                text: "Montante (€)",
                color: "#202432",
                font: {
                  family: "Inter",
                  size: 16,
                  weight: "600",
                },
              },
            },
          },
        },
      });
    }

    // Atualizar valores no HTML
    const retirementAge = idade;
    const retirementYear =
      new Date().getFullYear() + (retirementAge - idadeAtual);
    const yearsToRetirement = retirementAge - idadeAtual;

    $("[fire-value]").text(formatCurrency(valorFire) + "€");
    $("[retirement-age]").text(`${retirementAge} anos`);
    $("[retirement-year]").text(`${retirementYear}`);
    $("[retirement-time-left]").text(
      `Estás a ${yearsToRetirement} anos da tua reforma antecipada, aos ${retirementAge} anos.`
    );
  });
});
