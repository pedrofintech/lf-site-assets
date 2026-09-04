console.log("AYOyo");
const taxTables = [
  {
    //Portugal Continental - Tabela I
    location: "Portugal Continental",
    table: "Tabela I",
    maritalStatus: "Não casado / Casado dois titulares",
    salaryBrackets: [
      {
        min: 0,
        max: 920,
        rate: 0.0,
        deduction: 0.0,
        adDep: 0,
        taxaEfetiva: 0.0,
      },
      {
        min: 920.01,
        max: 1042,
        rate: 0.125,
        deduction: "12.50%*2.60(1273.85 - R)",
        adDep: 21.43,
        taxaEfetiva: 0.053,
      },
      {
        min: 1042.01,
        max: 1108,
        rate: 0.157,
        deduction: "15.70%*1.35(1554.83 - R)", //(R) => 16.5 * 1.35 * (1477.67 - R),
        adDep: 21.43,
        taxaEfetiva: 0.072,
      },
      {
        min: 1108.01,
        max: 1154,
        rate: 0.157,
        deduction: 94.71,
        adDep: 21.43,
        taxaEfetiva: 0.075,
      },
      {
        min: 1154.01,
        max: 1212,
        rate: 0.212,
        deduction: 158.18,
        adDep: 21.43,
        taxaEfetiva: 0.081,
      },
      {
        min: 1212.01,
        max: 1819,
        rate: 0.241,
        deduction: 193.33,
        adDep: 21.43,
        taxaEfetiva: 0.135,
      },
      {
        min: 1819.01,
        max: 2119,
        rate: 0.311,
        deduction: 320.66,
        adDep: 21.43,
        taxaEfetiva: 0.16,
      },
      {
        min: 2119.01,
        max: 2499,
        rate: 0.349,
        deduction: 401.19,
        adDep: 21.43,
        taxaEfetiva: 0.188,
      },
      {
        min: 2499.01,
        max: 3305,
        rate: 0.3836,
        deduction: 487.66,
        adDep: 21.43,
        taxaEfetiva: 0.236,
      },
      {
        min: 3305.01,
        max: 5547,
        rate: 0.3969,
        deduction: 531.62,
        adDep: 21.43,
        taxaEfetiva: 0.301,
      },
      {
        min: 5547.01,
        max: 20221,
        rate: 0.4495,
        deduction: 823.4,
        adDep: 21.43,
        taxaEfetiva: 0.409,
      },
      {
        min: 20221.01,
        max: Infinity,
        rate: 0.4717,
        deduction: 1272.31,
        adDep: 21.43,
        taxaEfetiva: null,
      },
    ],
  },
  {
    //R. A. Madeira - Tabela I
    location: "Região Autónoma da Madeira",
    table: "Tabela I",
    maritalStatus: "Não casado / Casado dois titulares",
    salaryBrackets: [
      {
        min: 0,
        max: 980,
        rate: 0.0,
        deduction: 0.0,
        adDep: 0,
        taxaEfetiva: 0.0,
      },
      {
        min: 980.01,
        max: 1028,
        rate: 0.0872,
        deduction: "08.72%*2.60(1356.92 - R)", //(R) => 9.28 * 2.6 * (1176.97 - R),
        adDep: 21.43,
        taxaEfetiva: 0.015,
      },
      {
        min: 1028.01,
        max: 1099,
        rate: 0.1204,
        deduction: "12.04%*1.35(1696.78 - R)", //(R) => 12.6 * 1.35 * (1457.56 - R),
        adDep: 21.43,
        taxaEfetiva: 0.032,
      },
      {
        min: 1099.01,
        max: 1201,
        rate: 0.1204,
        deduction: 97.17,
        adDep: 21.43,
        taxaEfetiva: 0.039,
      },
      {
        min: 1201.01,
        max: 1623,
        rate: 0.1763,
        deduction: 164.31,
        adDep: 21.43,
        taxaEfetiva: 0.075,
      },
      {
        min: 1623.01,
        max: 2332,
        rate: 0.223,
        deduction: 240.11,
        adDep: 21.43,
        taxaEfetiva: 0.12,
      },
      {
        min: 2332.01,
        max: 3203,
        rate: 0.2242,
        deduction: 242.91,
        adDep: 21.43,
        taxaEfetiva: 0.148,
      },
      {
        min: 3203.01,
        max: 3614,
        rate: 0.2727,
        deduction: 398.26,
        adDep: 21.43,
        taxaEfetiva: 0.163,
      },
      {
        min: 3614.01,
        max: 6585,
        rate: 0.2778,
        deduction: 416.7,
        adDep: 21.43,
        taxaEfetiva: 0.215,
      },
      {
        min: 6585.01,
        max: 6954,
        rate: 0.2802,
        deduction: 432.51,
        adDep: 21.43,
        taxaEfetiva: 0.218,
      },
      {
        min: 6954.01,
        max: 21411,
        rate: 0.2924,
        deduction: 517.35,
        adDep: 21.43,
        taxaEfetiva: 0.268,
      },
      {
        min: 21411.01,
        max: Infinity,
        rate: 0.3278,
        deduction: 1275.3,
        adDep: 21.43,
        taxaEfetiva: null,
      },
    ],
  },
  {
    //R. A. Açores - Tabela I
    location: "Região Autónoma dos Açores",
    table: "Tabela I",
    maritalStatus: "Não casado / Casado dois titulares",
    salaryBrackets: [
      {
        min: 0,
        max: 861,
        rate: 0.0,
        deduction: 0.0,
        adDep: 0,
        taxaEfetiva: 0.0,
      },
      {
        min: 861.01,
        max: 959,
        rate: 0.091,
        deduction: "09.10%*2.60(1192.17 - R)", //(R) => 9.1 * 2.6 * (1192.17 - R),
        adDep: 0,
        taxaEfetiva: 0.033,
      },
      {
        min: 959.01,
        max: 1032,
        rate: 0.1155,
        deduction: "11.60%*1.35(1463.36 - R)", //(R) => 11.55 * 1.35 * (1463.36 - R),
        adDep: 0,
        taxaEfetiva: 0.05,
      },
      {
        min: 1032.01,
        max: 1125,
        rate: 0.1155,
        deduction: 67.23,
        adDep: 0,
        taxaEfetiva: 0.056,
      },
      {
        min: 1125.01,
        max: 1175,
        rate: 0.154,
        deduction: 110.54,
        adDep: 0,
        taxaEfetiva: 0.06,
      },
      {
        min: 1175.01,
        max: 1769,
        rate: 0.175,
        deduction: 135.21,
        adDep: 0,
        taxaEfetiva: 0.099,
      },
      {
        min: 1769.01,
        max: 2057,
        rate: 0.224,
        deduction: 221.91,
        adDep: 0,
        taxaEfetiva: 0.116,
      },
      {
        min: 2057.01,
        max: 2408,
        rate: 0.2485,
        deduction: 272.3,
        adDep: 0,
        taxaEfetiva: 0.135,
      },
      {
        min: 2408.01,
        max: 3201,
        rate: 0.271,
        deduction: 326.49,
        adDep: 0,
        taxaEfetiva: 0.169,
      },
      {
        min: 3201.01,
        max: 5492,
        rate: 0.2804,
        deduction: 356.4,
        adDep: 0,
        taxaEfetiva: 0.216,
      },
      {
        min: 5492.01,
        max: 20021,
        rate: 0.3146,
        deduction: 544.59,
        adDep: 0,
        taxaEfetiva: 0.287,
      },
      {
        min: 20021.01,
        max: Infinity,
        rate: 0.3302,
        deduction: 856.42,
        adDep: 0,
        taxaEfetiva: null,
      },
    ],
  },
  {
    //Portugal Continental - Tabela II
    location: "Portugal Continental",
    table: "Tabela II",
    maritalStatus: "Não casado com um ou mais dependentes",
    salaryBrackets: [
      {
        min: 0,
        max: 920,
        rate: 0.0,
        deduction: 0.0,
        adDep: 0.0,
        taxaEfetiva: 0.0,
      },
      {
        min: 920.01,
        max: 1042,
        rate: 0.125,
        deduction: "12.50%*2.60(1273.85 - R)", //(R) => 13 * 2.6 * (1208.32 - R),
        adDep: 34.29,
        taxaEfetiva: 0.053,
      },
      {
        min: 1042.01,
        max: 1108,
        rate: 0.157,
        deduction: "15.70%*1.35(1554.83 - R)", //(R) => 16.5 * 1.35 * (1477.67 - R),
        adDep: 34.29,
        taxaEfetiva: 7.2,
      },
      {
        min: 1108.01,
        max: 1154,
        rate: 0.157,
        deduction: 94.71,
        adDep: 34.29,
        taxaEfetiva: 0.075,
      },
      {
        min: 1154.01,
        max: 1212,
        rate: 0.212,
        deduction: 158.18,
        adDep: 34.29,
        taxaEfetiva: 0.081,
      },
      {
        min: 1212.01,
        max: 1819,
        rate: 0.241,
        deduction: 193.33,
        adDep: 34.29,
        taxaEfetiva: 0.135,
      },
      {
        min: 1819.01,
        max: 2119,
        rate: 0.311,
        deduction: 320.66,
        adDep: 34.29,
        taxaEfetiva: 0.16,
      },
      {
        min: 2119.01,
        max: 2499,
        rate: 0.349,
        deduction: 401.19,
        adDep: 34.29,
        taxaEfetiva: 0.188,
      },
      {
        min: 2499.01,
        max: 3305,
        rate: 0.3836,
        deduction: 487.66,
        adDep: 34.29,
        taxaEfetiva: 0.236,
      },
      {
        min: 3305.01,
        max: 5547,
        rate: 0.3969,
        deduction: 531.62,
        adDep: 34.29,
        taxaEfetiva: 0.301,
      },
      {
        min: 5547.01,
        max: 20221,
        rate: 0.4495,
        deduction: 823.4,
        adDep: 34.29,
        taxaEfetiva: 0.409,
      },
      {
        min: 20221.01,
        max: Infinity,
        rate: 0.4717,
        deduction: 1272.31,
        adDep: 34.29,
        taxaEfetiva: null,
      },
    ],
  },
  {
    //R. A. Madeira - Tabela II
    location: "Região Autónoma da Madeira",
    table: "Tabela II",
    maritalStatus: "Não casado com um ou mais dependentes",
    salaryBrackets: [
      {
        min: 0,
        max: 980,
        rate: 0.0,
        deduction: 0.0,
        adDep: 0.0,
        taxaEfetiva: 0.0,
      },
      {
        min: 980.01,
        max: 1028,
        rate: 0.0872,
        deduction: "08.72%*2.60(1356.92 - R)", //(R) => 9.28 * 2.6 * (1176.97 - R),
        adDep: 34.29,
        taxaEfetiva: 0.015,
      },
      {
        min: 1028.01,
        max: 1099,
        rate: 0.1204,
        deduction: "12.04%*1.35(1696.78 - R)", //(R) => 12.6 * 1.35 * (1457.56 - R),
        adDep: 34.29,
        taxaEfetiva: 0.032,
      },
      {
        min: 1099.01,
        max: 1201,
        rate: 0.1204,
        deduction: 97.17,
        adDep: 34.29,
        taxaEfetiva: 0.039,
      },
      {
        min: 1201.01,
        max: 1623,
        rate: 0.1763,
        deduction: 164.31,
        adDep: 34.29,
        taxaEfetiva: 0.075,
      },
      {
        min: 1623.01,
        max: 2332,
        rate: 0.223,
        deduction: 240.11,
        adDep: 34.29,
        taxaEfetiva: 0.12,
      },
      {
        min: 2332.01,
        max: 3203,
        rate: 0.2242,
        deduction: 242.91,
        adDep: 34.29,
        taxaEfetiva: 0.148,
      },
      {
        min: 3203.01,
        max: 3614,
        rate: 0.2727,
        deduction: 398.26,
        adDep: 34.29,
        taxaEfetiva: 0.163,
      },
      {
        min: 3614.01,
        max: 6585,
        rate: 0.2778,
        deduction: 416.7,
        adDep: 34.29,
        taxaEfetiva: 0.215,
      },
      {
        min: 6585.01,
        max: 6954,
        rate: 0.2802,
        deduction: 432.51,
        adDep: 34.29,
        taxaEfetiva: 0.218,
      },
      {
        min: 6954.01,
        max: 21411,
        rate: 0.2924,
        deduction: 517.35,
        adDep: 34.29,
        taxaEfetiva: 0.268,
      },
      {
        min: 21411.01,
        max: Infinity,
        rate: 0.3278,
        deduction: 1275.3,
        adDep: 34.29,
        taxaEfetiva: null,
      },
    ],
  },
  {
    //R. A. Açores - Tabela II
    location: "Região Autónoma dos Açores",
    table: "Tabela II",
    maritalStatus: "Não casado com um ou mais dependentes",
    salaryBrackets: [
      {
        min: 0,
        max: 861,
        rate: 0.0,
        deduction: 0.0,
        adDep: 0.0,
        taxaEfetiva: 0.0,
      },
      {
        min: 861.01,
        max: 959,
        rate: 0.091,
        deduction: "09.10%*2.60(1192.17 - R)", //(R) => 9.1 * 2.6 * (1192.17 - R),
        adDep: 34.29,
        taxaEfetiva: 0.033,
      },
      {
        min: 959.01,
        max: 1032,
        rate: 0.1155,
        deduction: "11.60%*1.35(1463.36 - R)", //(R) => 11.55 * 1.35 * (1463.36 - R),
        adDep: 34.29,
        taxaEfetiva: 0.05,
      },
      {
        min: 1032.01,
        max: 1125,
        rate: 0.1155,
        deduction: 67.23,
        adDep: 34.29,
        taxaEfetiva: 0.056,
      },
      {
        min: 1125.01,
        max: 1175,
        rate: 0.154,
        deduction: 110.54,
        adDep: 34.29,
        taxaEfetiva: 0.06,
      },
      {
        min: 1175.01,
        max: 1769,
        rate: 0.175,
        deduction: 135.21,
        adDep: 34.29,
        taxaEfetiva: 0.099,
      },
      {
        min: 1769.01,
        max: 2057,
        rate: 0.224,
        deduction: 221.91,
        adDep: 34.29,
        taxaEfetiva: 0.116,
      },
      {
        min: 2057.01,
        max: 2408,
        rate: 0.2485,
        deduction: 272.3,
        adDep: 34.29,
        taxaEfetiva: 0.135,
      },
      {
        min: 2408.01,
        max: 3201,
        rate: 0.271,
        deduction: 326.49,
        adDep: 34.29,
        taxaEfetiva: 0.169,
      },
      {
        min: 3201.01,
        max: 5492,
        rate: 0.2804,
        deduction: 356.4,
        adDep: 34.29,
        taxaEfetiva: 0.216,
      },
      {
        min: 5492.01,
        max: 20021,
        rate: 0.3146,
        deduction: 544.59,
        adDep: 34.29,
        taxaEfetiva: 0.287,
      },
      {
        min: 20021.01,
        max: Infinity,
        rate: 0.3302,
        deduction: 856.42,
        adDep: 34.29,
        taxaEfetiva: null,
      },
    ],
  },
  {
    //Portugal Continental - Tabela III
    location: "Portugal Continental",
    table: "Tabela III",
    maritalStatus: "Casado único titular",
    salaryBrackets: [
      {
        min: 0,
        max: 991,
        rate: 0.0,
        deduction: 0.0,
        adDep: 0.0,
        taxaEfetiva: 0.0,
      },
      {
        min: 991.01,
        max: 1042,
        rate: 0.125,
        deduction: "12.50%*2.60(1372.15 - R)", //(R) => 13.0 * 2.6 * (1324.55 - R),
        adDep: 42.86,
        taxaEfetiva: 0.022,
      },
      {
        min: 1042.01,
        max: 1108,
        rate: 0.125,
        deduction: "12.50%*1.35(1677.85 - R)", //(R) => 13.0 * 1.35 * (1632.65 - R),
        adDep: 42.86,
        taxaEfetiva: 0.038,
      },
      {
        min: 1108.01,
        max: 1119,
        rate: 0.125,
        deduction: 96.17,
        adDep: 42.86,
        taxaEfetiva: 0.039,
      },
      {
        min: 1119.01,
        max: 1432,
        rate: 0.1272,
        deduction: 98.64,
        adDep: 42.86,
        taxaEfetiva: 0.058,
      },
      {
        min: 1432.01,
        max: 1962,
        rate: 0.157,
        deduction: 141.32,
        adDep: 42.86,
        taxaEfetiva: 0.085,
      },
      {
        min: 1962.01,
        max: 2240,
        rate: 0.1938,
        deduction: 213.53,
        adDep: 42.86,
        taxaEfetiva: 0.098,
      },
      {
        min: 2240.01,
        max: 2773,
        rate: 0.2277,
        deduction: 289.47,
        adDep: 42.86,
        taxaEfetiva: 0.123,
      },
      {
        min: 2773.01,
        max: 3389,
        rate: 0.257,
        deduction: 370.72,
        adDep: 42.86,
        taxaEfetiva: 0.148,
      },
      {
        min: 3389.01,
        max: 5965,
        rate: 0.2881,
        deduction: 476.12,
        adDep: 42.86,
        taxaEfetiva: 0.208,
      },
      {
        min: 5965.01,
        max: 20265,
        rate: 0.3843,
        deduction: 1049.96,
        adDep: 42.86,
        taxaEfetiva: 0.332,
      },
      {
        min: 20265.01,
        max: Infinity,
        rate: 0.4717,
        deduction: 2821.13,
        adDep: 42.86,
        taxaEfetiva: null,
      },
    ],
  },
  {
    //R. A. Madeira - Tabela III
    location: "Região Autónoma da Madeira",
    table: "Tabela III",
    maritalStatus: "Casado único titular",
    salaryBrackets: [
      {
        min: 0,
        max: 997,
        rate: 0.0,
        deduction: 0.0,
        adDep: 0.0,
        taxaEfetiva: 0.0,
      },
      {
        min: 997.01,
        max: 1099,
        rate: 0.0872,
        deduction: "08.72%*1.35(1819.64 - R)", //(R) => 9.28 * 1.35 * (1701.4 - R),
        adDep: 42.86,
        taxaEfetiva: 0.01,
      },
      {
        min: 1099.01,
        max: 1141,
        rate: 0.0872,
        deduction: 84.84,
        adDep: 42.86,
        taxaEfetiva: 0.013,
      },
      {
        min: 1141.01,
        max: 1857,
        rate: 0.1033,
        deduction: 103.22,
        adDep: 42.86,
        taxaEfetiva: 0.048,
      },
      {
        min: 1857.01,
        max: 2485,
        rate: 0.1091,
        deduction: 114,
        adDep: 42.86,
        taxaEfetiva: 0.063,
      },
      {
        min: 2485.01,
        max: 3331,
        rate: 0.1236,
        deduction: 150.04,
        adDep: 42.86,
        taxaEfetiva: 0.079,
      },
      {
        min: 3331.01,
        max: 3895,
        rate: 0.1404,
        deduction: 206.01,
        adDep: 42.86,
        taxaEfetiva: 0.088,
      },
      {
        min: 3895.01,
        max: 6673,
        rate: 0.1595,
        deduction: 280.41,
        adDep: 42.86,
        taxaEfetiva: 0.117,
      },
      {
        min: 6673.01,
        max: 6878,
        rate: 0.2213,
        deduction: 692.81,
        adDep: 42.86,
        taxaEfetiva: 0.121,
      },
      {
        min: 6878.01,
        max: 21411,
        rate: 0.2493,
        deduction: 885.4,
        adDep: 42.86,
        taxaEfetiva: 0.208,
      },
      {
        min: 21411.01,
        max: Infinity,
        rate: 0.3278,
        deduction: 2566.17,
        adDep: 42.86,
        taxaEfetiva: null,
      },
    ],
  },
  {
    //R. A. Açores - Tabela III
    location: "Região Autónoma dos Açores",
    table: "Tabela III",
    maritalStatus: "Casado dois titulares com um ou mais dependentes",
    salaryBrackets: [
      {
        min: 0,
        max: 798,
        rate: 0.0,
        deduction: 0.0,
        adDep: 21.43,
        taxaEfetiva: 0.0,
      },
      {
        min: 798.01,
        max: 922,
        rate: 0.1015,
        deduction: "10.15%*2.30(1167.90 - R)", //(R) => 10.15 * 2.3 * (1167.9 - R),
        adDep: 21.43,
        taxaEfetiva: 0.016,
      },
      {
        min: 922.01,
        max: 995,
        rate: 0.147,
        deduction: "14.70%*1.30(1441.94 - R)", //(R) => 14.7 * 1.3 * (1441.94 - R),
        adDep: 21.43,
        taxaEfetiva: 0.04,
      },
      {
        min: 995.01,
        max: 1106,
        rate: 0.1855,
        deduction: 123.72,
        adDep: 21.43,
        taxaEfetiva: 0.054,
      },
      {
        min: 1106.01,
        max: 1600,
        rate: 0.1995,
        deduction: 139.22,
        adDep: 21.43,
        taxaEfetiva: 0.099,
      },
      {
        min: 1600.01,
        max: 1961,
        rate: 0.245,
        deduction: 212.03,
        adDep: 21.43,
        taxaEfetiva: 0.126,
      },
      {
        min: 1961.01,
        max: 2529,
        rate: 0.259,
        deduction: 239.49,
        adDep: 21.43,
        taxaEfetiva: 0.156,
      },
      {
        min: 2529.01,
        max: 3694,
        rate: 0.271,
        deduction: 269.85,
        adDep: 21.43,
        taxaEfetiva: 0.192,
      },
      {
        min: 3694.01,
        max: 5469,
        rate: 0.2804,
        deduction: 304.38,
        adDep: 21.43,
        taxaEfetiva: 0.221,
      },
      {
        min: 5469.01,
        max: 6420,
        rate: 0.299,
        deduction: 406.61,
        adDep: 21.43,
        taxaEfetiva: 0.232,
      },
      {
        min: 6420.01,
        max: 20064,
        rate: 0.3146,
        deduction: 506.61,
        adDep: 21.43,
        taxaEfetiva: 0.288,
      },
      {
        min: 20064.01,
        max: Infinity,
        rate: 0.3302,
        deduction: 819.11,
        adDep: 21.43,
        taxaEfetiva: null,
      },
    ],
  },
];

$(document).ready(function () {
  $("#calcular").on("click", function (e) {
    e.preventDefault();

    $(".all-results_wrapper").css("display", "flex");

    const parseNumber = (value) => {
      if (!value) return 0;
      return parseFloat(value.replace(/\./g, "").replace(",", "."));
    };
    // --------------------------------------------------------------------
    // --------------------------------------------------------------------
    // ------------------------------ INPUTS ------------------------------
    // --------------------------------------------------------------------
    // --------------------------------------------------------------------
    // Get values from form
    //$D$14 Estado Civil
    //$D$15 Nº de Dependentes
    //$D$16 Morada Fiscal
    //$D$22 - Vencimento Base
    //$D$23 - Retribuição Extraordinária:
    //$D$24 - Rendimentos suj. a IRS e SS:
    //$D$25 Rendimentos suj. só a IRS:
    //$D$26 Outros Rendimentos Isentos:
    //$D$28 Beneficiário ADSE
    //$D$29 Subsídio de Alimentação:
    //$D$19 Select Subsídios Duodécimos
    //$D$30 Valor Diário:
    //$D$31 Dias:
    //T2D26 IRS Jovem
    const D14_estadoCivil = $("#estado-civil").val();
    const D15_dependentes = parseInt($("#dependentes").val()) || 0;
    const D16_morada = $("#morada").val();
    const D22_salarioBruto = parseNumber(
      $('[data-type="salario-bruto"]').val()
    );
    const D23_retribuicaoExtra = parseNumber(
      $('[data-type="retribuicao-extraordinaria"]').val()
    );
    const D24_outrosRendIRS_SS = parseNumber(
      $('[data-type="outros-rendimentos-irs-ss"]').val()
    );
    const D25_outrosRendIRS = parseNumber(
      $('[data-type="outros-rendimentos-irs"]').val()
    );
    const D26_outrosRendIsentos = parseNumber(
      $('[data-type="outros-rendimentos-isentos"]').val()
    );
    const D28_adse = $("#adse").is(":checked");
    const D29_tipoSubRefeicao = $('[name="tipo-sub-refeicao"]').val();
    const D19_subsidiosDuodecimos = $('[name="subsidios-duodecimos"]').val();
    const D30_valorSubRefeicao = parseNumber(
      $('[data-type="valor-sub-refeicao"]').val()
    );
    const D31_diasSubRefeicao = parseNumber(
      $('[data-type="dias-sub-refeicao"]').val()
    );
    const T2D26_irsJovem = $("#irs-jovem").val();

    // --------------------------------------------------------------------
    // --------------------------------------------------------------------
    // ------------------------------ TABLE -------------------------------
    // --------------------------------------------------------------------
    // --------------------------------------------------------------------
    // Determine correct tax table
    let selectedTable = taxTables.find((table) => {
      return (
        table.location === D16_morada &&
        ((D15_dependentes > 0 &&
          D14_estadoCivil.includes("Não casado") &&
          table.table === "Tabela II") ||
          (D14_estadoCivil.includes("Casado, 1 titular") &&
            table.table === "Tabela III") ||
          (D14_estadoCivil.includes("Casado, 2 titulares") &&
            table.table === "Tabela I") ||
          (D14_estadoCivil.includes("Não casado") &&
            D15_dependentes === 0 &&
            table.table === "Tabela I"))
      );
    });
    function get_selectedRow(x) {
      let rownumber = 999999;
      let selectedR;
      //Infinity
      if (x > selectedTable.salaryBrackets[11].max) {
        selectedR = selectedTable.salaryBrackets[11];
      } else {
        for (let n = 0; n < 12; n++) {
          if (
            (x >= selectedTable.salaryBrackets[n].min) &
            (x <= selectedTable.salaryBrackets[n].max)
          ) {
            rownumber = n;
            selectedR = selectedTable.salaryBrackets[n];
          }
          //console.log("Possibility " + n + " " + selectedTable.salaryBrackets[n].max);
        }
      }
      //console.log("Number of Rows: " + selectedTable.salaryBrackets.length);
      //console.log("Possibility selected: " + rownumber + " " + selectedR.max);
      return selectedR;
    }
    // --------------------------------------------------------------------
    // --------------------------------------------------------------------
    // -------------------------- CALCULATE T1 ----------------------------
    // --------------------------------------------------------------------
    // --------------------------------------------------------------------
    //calcula $D$34 rendimento tributavel
    //calcula $D$35 o parentesis após rendimento tributavel
    //calcula $B$36 traz o texto dos duodécimos
    //calcula $D$36 duodecimos
    //calcula $D$38 subsidio alimentação
    //calcula $D$41 salario bruto
    //$D$43
    //$D$44
    //$D$45
    //calcula $D$47 Contribuição SS
    //calcula $D$48 Contrbuição ADSE
    //$D$50
    function calculate_D34_RendimentoTributavel(D22, D24, D25, D29, D30, D31) {
      let sum = D22 + D24 + D25;
      result = sum;
      if (D29 === "Cartão/Vales de refeição" && D30 > 10.46) {
        result = sum + D31 * (D30 - 10.46);
      } else if (D29 === "Rendimento" && D30 > 6.15) {
        result = sum + D31 * (D30 - 6.15);
      } else {
        result = sum;
      }
      return Math.max(result, 0);
    }
    function calculate_D35_IFS(D29, D30, D31) {
      if (D29 === "Cartão/Vales de refeição" && D30 > 10.46) {
        return D31 * (D30 - 10.46);
      } else if (D29 === "Rendimento" && D30 > 6.15) {
        return D31 * (D30 - 6.15);
      } else {
        return 0;
      }
    }
    function get_DuodecimosText(D19) {
      let percentage = "0"; // Default value

      if (D19 === "Recebo 50% de um subsídio em duodécimos") {
        percentage = "25";
      } else if (
        D19 ===
        "Recebo 50% dos dois subsídios ou 1 subsídio a 100% em duodécimos"
      ) {
        percentage = "50";
      } else if (D19 === "Recebo os dois subsídios a 100% em duodécimos") {
        percentage = "100";
      }
      return `Duodécimos (${percentage}%):`;
    }
    function calculate_D36_Duodecimos(B36, D22) {
      let match = B36.match(/\d+/); // Extract the first number from B36
      let extractedNumber = match ? parseInt(match[0], 10) : 0;
      return Math.round(0.01 * extractedNumber * ((2 * D22) / 12) * 100) / 100;
    }
    function calculate_D38_SubsidioAlimentacao(D29, D30, D31, D35) {
      return D29 !== "Não tenho" ? D30 * D31 - D35 : 0;
    }
    function calculate_D41_SalarioBruto(D34, D36, D37, D38, D39) {
      return Math.round((D34 + D36 + D37 + D38 + D39) * 100) / 100;
    }
    function calculate_D43(D15, D34, D45) {
      let selectedR = get_selectedRow(D34);
      let baseCalculation =
        D34 * selectedR.rate - selectedR.deduction - D15 * selectedR.adDep;

      let alternativeCalculation =
        D34 * selectedR.rate -
        0.01 *
          parseFloat(String(selectedR.deduction).slice(0, 5)) *
          parseFloat(String(selectedR.deduction).slice(7, 11)) *
          (parseFloat(String(selectedR.deduction).slice(12, 20)) - D34) -
        D15 * selectedR.adDep;

      const real_deduction =
        typeof selectedR.deduction === "string"
          ? alternativeCalculation
          : baseCalculation; // "Parcela a Abater"
      /*
      console.log("YO - - - " + real_deduction);
      console.log(String(selectedR.deduction).slice(0, 5));
      console.log(String(selectedR.deduction).slice(7, 11));
      console.log(String(selectedR.deduction).slice(12, 20));
      console.log("1 - " + baseCalculation);
      console.log("2 - " + alternativeCalculation);
      console.log("Rate - " + selectedR.rate);
      console.log("Deduction - " + selectedR.deduction);
      console.log("AdDep - " + selectedR.adDep);
      */
      const yo = D45 - Math.floor(D45);
      //console.log("AQUIIIIIIIIIIIIIIIIII - " + real_deduction);
      //console.log("Yo" + yo);
      return Math.max(
        Math.max(Math.round(real_deduction), 0) - (D45 - Math.floor(D45)),
        0
      );
    }
    /*
    function calculate_D44(D15, D37) {
      let selectedR = get_selectedRow(D37);
      let baseCalculation =
        D37 * selectedR.rate - selectedR.deduction - D15 * selectedR.adDep;
      //D37*(index1)-(index2)-D15*index2;
      let alternativeCalculation =
        D37 * selectedR.rate -
        0.01 *
          parseFloat(String(selectedR.deduction).slice(0, 5)) *
          parseFloat(String(selectedR.deduction).slice(7, 11)) *
          (parseFloat(String(selectedR.deduction).slice(12, 20)) - D37) -
        D15 * selectedR.adDep;

      const real_deduction = isNaN(selectedR.deduction)
        ? alternativeCalculation
        : baseCalculation; // "Parcela a Abater"

      return Math.round(Math.max(real_deduction, 0)); //* 100) / 100;
    }
    */
    function calculate_D44(D15, D37, D34) {
      let selectedR = get_selectedRow(D37);
      let baseCalculation = D37 * selectedR.rate;

      return Math.round(baseCalculation * 100) / 100; //* 100) / 100;
    }
    function calculate_D45(D22, D15, D36, selectedR) {
      let baseCalculation =
        D22 * selectedR.rate - selectedR.deduction - D15 * selectedR.adDep;
      let alternativeCalculation =
        D22 * selectedR.rate -
        0.01 *
          parseFloat(String(selectedR.deduction).slice(0, 5)) *
          parseFloat(String(selectedR.deduction).slice(7, 11)) *
          (parseFloat(String(selectedR.deduction).slice(12, 20)) - D22) -
        D15 * selectedR.adDep;
      const real_deduction =
        typeof selectedRow.deduction === "string"
          ? alternativeCalculation
          : baseCalculation; // "Parcela a Abater"
      let reall = (Math.max(real_deduction, 0) / D22) * D36;
      /*
      console.log("YOOOOOOOOOOOOOOOOOO " + real_deduction);
      console.log("YOOOOOOOOOOOOOOOOOO " + reall);
      */
      return Math.round((Math.max(real_deduction, 0) / D22) * D36 * 100) / 100;
    }
    function calculate_D47_contribuicaoSS(D25, D34, D36, D37) {
      return Math.round(0.11 * (D34 + D36 + D37 - D25) * 100) / 100;
    }
    function calculate_D48_contribuicaoAdse(D22, D28) {
      return D28 ? 0.035 * D22 : 0;
    }
    function calculate_D50_SalarioLiquido(D41, D43, D44, T1D45, D47, D48) {
      return D41 - D43 - D44 - T1D45 - D47 - D48;
    }
    // --------------------------------------------------------------------
    // --------------------------------------------------------------------
    // -------------------------- CALCULATE T2 ----------------------------
    // --------------------------------------------------------------------
    // --------------------------------------------------------------------
    function calculate_D30irs(D29) {
      let resultado = 1;
      if (D29 == "1.º ano de obtenção de rendimentos") {
        resultado = 1.0;
      } else if (D29 == "Do 2.º ao 4.º ano") {
        resultado = 0.75;
      } else if (D29 == "Do 5.º ao 7.º ano") {
        resultado = 0.5;
      } else if (D29 == "Do 8.º ao 10.º ano") {
        resultado = 0.25;
      }
      return resultado;
    }
    function calculate_T2D43(T2D26, T2D30, T2D31, T2D34, T1D43) {
      if (T2D26 == "Não aplicável") {
        resultado = T1D43;
      } else {
        if (T2D30 * T2D34 > T2D31) {
          resultado = Math.floor(((T2D34 - T2D31) * T1D43) / T2D34);
        } else {
          resultado = Math.floor(((1 - T2D30) * T2D34 * T1D43) / T2D34);
        }
      }

      return Math.round(Math.max(resultado, 0) * 100) / 100;
    }
    function calculate_T2D44irs(D26, T1D44, T2D31, D37, D34, T2D30) {
      let result;

      // If "Sem IRS Jovem", return T1D44 directly
      if (D26 === "Não aplicável") {
        result = T1D44;
      } else {
        if (D37 > 0) {
          //let regexExtract = String(T2D30).match(/\d+/);
          //let extractedValue = regexExtract ? parseInt(regexExtract[0]) : 0;
          if (D34 + D37 > T2D31) {
            if (D34 > T2D31) {
              result = T1D44 / D37;
            } else {
              result =
                ((D37 - (T2D31 - D34)) * T1D44) / D37 +
                (1 - T2D30) * (T2D31 - D34) * (T1D44 / D37);
            }
          } else {
            result = (1 - T2D30) * T1D44;
          }
        } else {
          result = 0;
        }
      }

      return Math.floor(result); // Ensure result is never undefined
    }
    function calculate_T2D45(
      T2D26,
      T1D15,
      T1D34,
      T1D43,
      T1D45,
      T2D34,
      T2D36,
      T2D43
    ) {
      let selectedR = get_selectedRow(T1D34);
      let result = 0;
      if (T2D26 === "Não aplicável") {
        result = T1D45;
      } else {
        if (T1D43 == 0 || T2D34 == 0) {
          result = 0;
        } else {
          // Extracting values from deduction assuming it's structured properly
          let deductionStr = String(selectedR.deduction);
          let index_value1 = parseFloat(deductionStr.slice(0, 5)); // First part
          let index_value2 = parseFloat(deductionStr.slice(7, 11)); // Second part
          let index_value3 = parseFloat(deductionStr.slice(12, 20)); // Third part
          //"16.50%*1.35(1477.67 - R)",
          let baseCalculation =
            T1D34 * selectedR.rate -
            selectedR.deduction -
            T1D15 * selectedR.adDep;

          let alternativeCalculation =
            T1D34 * selectedR.rate -
            0.01 * index_value1 * index_value2 * (index_value3 - T1D34) -
            T1D15 * selectedR.adDep;

          const real_deduction =
            typeof selectedR.deduction === "string"
              ? alternativeCalculation
              : baseCalculation; // "Parcela a Abater"
          //T1D15
          /*
          console.log(
            "1,2,3 " + index_value1 + "," + index_value2 + "," + index_value3
          );
          */
          console.log("Alte Calculation: " + alternativeCalculation);
          console.log("Base Calculation: " + baseCalculation);
          result = Math.floor(
            (real_deduction / T2D34) * T2D36 * (T2D43 / T1D43)
          );
        }
      }
      /*
      console.log("GWEUYRGNWEIURWERG - " + result);
      console.log("SDUFHDG + T2D26 | " + T2D26);
      console.log("SDUFHDG + T1D15 | " + T1D15);
      console.log("SDUFHDG + T1D34 | " + T1D34);
      console.log("SDUFHDG + T1D43 | " + T1D43);
      console.log("SDUFHDG + T1D45 | " + T1D45);
      console.log("SDUFHDG + T2D34 | " + T2D34);
      console.log("SDUFHDG + T2D36 | " + T2D36);
      console.log("SDUFHDG + T2D43 | " + T2D43);
      */
      return result;
    }
    function calculate_T2D50(D41, T2D43, T2D44, T2D45, D47, D48) {
      /*
      console.log("D41 | " + D41);
      console.log("T2D43 | " + T2D43);
      console.log("T2D44 | " + T2D44);
      console.log("T2D45 | " + T2D45);
      console.log("D47 | " + D47);
      console.log("D48 | " + D48);
      */
      return Math.round((D41 - T2D43 - T2D44 - T2D45 - D47 - D48) * 100) / 100;
    }
    // --------------------------------------------------------------------
    // --------------------------------------------------------------------
    // ---------------------------- DEFINE T1 -----------------------------
    // --------------------------------------------------------------------
    // --------------------------------------------------------------------
    //$D$34 Rendimento Tributável
    //$D$35 (Subsidio de Alimentação)
    //$B$36 Duodécimos - Texto
    //$D$36 Duodécimos
    //$D$38 Subsidio de Alimentação
    //$D$41 Salário Bruto
    //$D$48 Contribuição ADSE
    //$D$47 Contribuição SS
    //$D$18
    //selectedRow
    //T1D45 Retenção IRS (Duodécimos)
    //$D$43 Retenção IRS (Rendimento)
    //$D$44 Retenção IRS (Retribuição Extra)
    //$D$50 Salário Líquido
    let D34_real_rendimentoTributavel = calculate_D34_RendimentoTributavel(
      D22_salarioBruto,
      D24_outrosRendIRS_SS,
      D25_outrosRendIRS,
      D29_tipoSubRefeicao,
      D30_valorSubRefeicao,
      D31_diasSubRefeicao
    );
    let D35_real_rendimentoTributavelSubAlim = calculate_D35_IFS(
      D29_tipoSubRefeicao,
      D30_valorSubRefeicao,
      D31_diasSubRefeicao
    );
    let B36_duodecimosText = get_DuodecimosText(D19_subsidiosDuodecimos);
    let D36_duodecimos = calculate_D36_Duodecimos(
      B36_duodecimosText,
      D22_salarioBruto
    );
    let D38_real_subsidioAlimentacao = calculate_D38_SubsidioAlimentacao(
      D29_tipoSubRefeicao,
      D30_valorSubRefeicao,
      D31_diasSubRefeicao,
      D35_real_rendimentoTributavelSubAlim
    );
    let D41_real_salarioBruto = calculate_D41_SalarioBruto(
      D34_real_rendimentoTributavel,
      D36_duodecimos,
      D23_retribuicaoExtra,
      D38_real_subsidioAlimentacao,
      D26_outrosRendIsentos
    );
    let D48_contribuicaoAdse = calculate_D48_contribuicaoAdse(
      D22_salarioBruto,
      D28_adse
    );
    let D47_contribuicaoSS = calculate_D47_contribuicaoSS(
      D25_outrosRendIRS,
      D34_real_rendimentoTributavel,
      D36_duodecimos,
      D23_retribuicaoExtra
    );
    let D18 = selectedTable.location + " " + selectedTable.table;
    let selectedRow = get_selectedRow(D22_salarioBruto);
    let T1D45_retIRSduodecimos = calculate_D45(
      D22_salarioBruto,
      D15_dependentes,
      D36_duodecimos,
      selectedRow
    );
    let D43_retIRSrendimentos = calculate_D43(
      D15_dependentes,
      D34_real_rendimentoTributavel,
      T1D45_retIRSduodecimos
    );
    let D44_retIRSextra = calculate_D44(
      D15_dependentes,
      D23_retribuicaoExtra,
      D34_real_rendimentoTributavel
    );
    let D50_salario_liquido = calculate_D50_SalarioLiquido(
      D41_real_salarioBruto,
      D43_retIRSrendimentos,
      D44_retIRSextra,
      T1D45_retIRSduodecimos,
      D47_contribuicaoSS,
      D48_contribuicaoAdse
    );
    // --------------------------------------------------------------------
    // --------------------------------------------------------------------
    // ---------------------------- DEFINE T2 -----------------------------
    // --------------------------------------------------------------------
    // --------------------------------------------------------------------
    let T2_IAS = 537.13;
    let T2D30_taxaIsencaoIRS = calculate_D30irs(T2D26_irsJovem);
    let T2D31_limiteRendIsento = Math.round(((55 * T2_IAS) / 14) * 100) / 100;
    let T2D44_retIRSextra = calculate_T2D44irs(
      T2D26_irsJovem,
      D44_retIRSextra,
      T2D31_limiteRendIsento,
      D23_retribuicaoExtra,
      D34_real_rendimentoTributavel,
      T2D30_taxaIsencaoIRS
    );
    let T2D43_retIRSrendimentos = calculate_T2D43(
      T2D26_irsJovem,
      T2D30_taxaIsencaoIRS,
      T2D31_limiteRendIsento,
      D34_real_rendimentoTributavel,
      D43_retIRSrendimentos
    );
    let T2D45_retIRSduodecimos = calculate_T2D45(
      T2D26_irsJovem,
      D15_dependentes,
      D34_real_rendimentoTributavel,
      D43_retIRSrendimentos,
      T1D45_retIRSduodecimos,
      D34_real_rendimentoTributavel,
      D36_duodecimos,
      T2D43_retIRSrendimentos
    );
    let T2D50_salario_liquido = calculate_T2D50(
      D41_real_salarioBruto,
      T2D43_retIRSrendimentos,
      T2D44_retIRSextra,
      T2D45_retIRSduodecimos,
      D47_contribuicaoSS,
      D48_contribuicaoAdse
    );

    function logs() {
      // Há valores de células são iguais a outras, então não existe "D37", por exemplo, porque é igual a "D23".
      console.log("-------------------------------------------------");
      console.log("--------------------- INPUTS --------------------");
      console.log("-------------------------------------------------");
      console.log("D14 | Estado Civil:", D14_estadoCivil);
      console.log("D15 | Dependentes:", D15_dependentes);
      console.log("D16 | Morada Fiscal:", D16_morada);
      console.log("D22 | Vencimento: " + D22_salarioBruto);
      console.log("D23 | Retribuição Extraordinária: " + D23_retribuicaoExtra);
      console.log("D24 | Rendimentos suj. a IRS e SS: " + D24_outrosRendIRS_SS);
      console.log("D25 | Rendimentos suj. só a IRS: " + D25_outrosRendIRS);
      console.log("D26 | Outros Rendimentos Isentos: " + D26_outrosRendIsentos);
      console.log("D28 | Beneficiário ADSE: " + D28_adse);
      console.log("D29 | Subsídio de Alimentação: " + D29_tipoSubRefeicao);
      console.log("D30 | Valor Diário: " + D30_valorSubRefeicao);
      console.log("D31 | Dias: " + D31_diasSubRefeicao);
      console.log("T2D26 | IRS Jovem: " + T2D26_irsJovem);
      console.log("T2D30 | Taxa de Isenção IRS: " + T2D30_taxaIsencaoIRS);
      console.log(
        "T2D31 | Limite de Rendimento Isento: " + T2D31_limiteRendIsento
      );
      console.log("--------------------------------------------------");
      console.log("--------------------- OUTPUTS --------------------");
      console.log("--------------------------------------------------");
      console.log(
        "D34 | Rendimento Tributavel: " + D34_real_rendimentoTributavel + "€"
      );
      console.log(
        "D35 | (inclui parte tributada do sub. alim. ) " +
          D35_real_rendimentoTributavelSubAlim +
          "€"
      );
      console.log("D36 | " + B36_duodecimosText + " +" + D36_duodecimos + "€");
      // Há valores de células são iguais a outras, então não existe "D37", por exemplo, porque é igual a "D23".
      console.log("D37 | Retribuição Extra: +" + D23_retribuicaoExtra + "€");
      console.log(
        "D38 | Sub. de Alimentação (parte ñ trib.): +" +
          D38_real_subsidioAlimentacao +
          "€"
      );
      console.log(
        "D39 | Outros Rendimentos Isentos: +" + D26_outrosRendIsentos + "€"
      );
      console.log("-----------------------------------------------------");
      console.log("D41 | Salário Bruto: " + D41_real_salarioBruto + "€");
      console.log("-----------------------------------------------------");
      console.log(
        "D43 | Retenção IRS (Rendimento): " + T2D43_retIRSrendimentos
      );
      console.log(
        "D44 | Retenção IRS (Retribuição Extra): " + T2D44_retIRSextra
      );
      console.log("D45 | Retenção IRS (Duodécimos): " + T2D45_retIRSduodecimos);
      console.log("D47 | Contribuição SS: " + D47_contribuicaoSS);
      console.log("D48 | Contribuição ADSE: " + D48_contribuicaoAdse);
      console.log("D50 | Salário Líquido: " + T2D50_salario_liquido);
    }
    //logs();
    //0 25 50 100
    function calculcate_D100BrutoAnual(D34, B36, D36, D38) {
      //D41_real_salarioBruto * 12;
      const result =
        D22_salarioBruto * 14 +
        (D23_retribuicaoExtra +
          D24_outrosRendIRS_SS +
          D25_outrosRendIRS +
          D26_outrosRendIsentos) *
          12 +
        D30_valorSubRefeicao * D31_diasSubRefeicao * 11;
      let multiplier;
      B36_match = B36.match(/\d+/);
      if (B36_match == 0) {
        multiplier = 2;
      } else if (B36_match == 25) {
        multiplier = 1.5;
      } else if (B36_match == 50) {
        multiplier = 1;
      } else if (B36_match == 100) {
        multiplier = 0;
      }
      //console.log("Aqui - - - " + multiplier);
      return result; //D38 * 11 + D36 * 12 + D34 * 12 + D34 * multiplier;
    }
    let D100_BrutoAnual = calculcate_D100BrutoAnual(
      D34_real_rendimentoTributavel,
      B36_duodecimosText,
      D36_duodecimos,
      D38_real_subsidioAlimentacao
    );
    //————————————————————————————————————————————————————————————————————————————————————————————————————
    //————————————————————————————————————————————————————————————————————————————————————————————————————
    //————————————————————————————————————————————————————————————————————————————————————————————————————
    function applyValues() {
      /*
      const custoMensalPatrao =
        (D34_real_rendimentoTributavel +
          D23_retribuicaoExtra +
          D24_outrosRendIRS_SS) *
          1.2375 +
        D38_real_subsidioAlimentacao +
        D25_outrosRendIRS +
        D26_outrosRendIsentos;
      
      const custoAnualPatrao =
        custoMensalPatrao * 14 -
        D38_real_subsidioAlimentacao * 3 +
        (D25_outrosRendIRS + D26_outrosRendIsentos) * 2;
      
      D24_outrosRendIRS_SS;
      */
      const custoAnualPatrao =
        D22_salarioBruto * 1.2375 * 14 +
        D23_retribuicaoExtra * 1.2375 * 12 +
        D24_outrosRendIRS_SS * 1.2375 * 12 +
        D25_outrosRendIRS * 12 +
        D26_outrosRendIsentos * 12 +
        D38_real_subsidioAlimentacao * 11;
      /*
      console.log("D41 " + D41_real_salarioBruto);
      console.log("D23 " + D23_retribuicaoExtra);
      console.log("D24 " + D24_outrosRendIRS_SS);
      console.log("D25 " + D25_outrosRendIRS);
      console.log("D26 " + D26_outrosRendIsentos);
      console.log("D38 " + D38_real_subsidioAlimentacao);
      */
      const custoMensalPatrao = custoAnualPatrao / 12;
      $("[custo-mensal-empresa-result]").text(formatEuro(custoMensalPatrao));
      $("[custo-anual-empresa-result]").text(formatEuro(custoAnualPatrao));

      const IRSPercentage =
        (T2D43_retIRSrendimentos / D34_real_rendimentoTributavel) * 100;
      $("[irs-percentage-result]").text(formatPercent(IRSPercentage));
      const subAlimPercentage =
        (T2D45_retIRSduodecimos / D41_real_salarioBruto) * 100;
      $("[sub-alim-ret-percentage]").text(formatPercent(subAlimPercentage));

      $("[rendimento-tributavel-result]").text(
        formatEuro(D34_real_rendimentoTributavel)
      );

      $("[duodecimos-result]").text(formatEuro(D36_duodecimos));
      $("[sub-alimentacao-result]").text(
        formatEuro(D38_real_subsidioAlimentacao)
      );
      $("[salario-bruto-result]").text(formatEuro(D41_real_salarioBruto));
      $("[irs-retencao-rendi-result]").text(
        formatEuro(T2D43_retIRSrendimentos)
      );
      $("[irs-retencao-duo-result]").text(
        formatEuro(Math.abs(T2D45_retIRSduodecimos))
      );
      $("[ss-result]").text(formatEuro(D47_contribuicaoSS));
      $("[salario-liquido-result]").text(formatEuro(T2D50_salario_liquido));
      $("[valor-bruto-result]").text(formatEuro(D100_BrutoAnual));
      //Extras
      $("[retribuicao-extra-result]").text(formatEuro(D23_retribuicaoExtra));
      $("[outros-rendimentos-result]").text(formatEuro(D26_outrosRendIsentos));
      $("[ret-retribuicao-extra-result]").text(formatEuro(D44_retIRSextra));

      // GRAPH
      const ctx = document.querySelector(".graph-canvas").getContext("2d");

      // Destroy previous chart if it exists
      if (myDonutChart) {
        myDonutChart.destroy();
      }

      // Create new chart
      myDonutChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          datasets: [
            {
              data: [
                T2D50_salario_liquido,
                D47_contribuicaoSS,
                T2D43_retIRSrendimentos,
                T2D45_retIRSduodecimos,
              ],
              backgroundColor: ["#FD8D2B", "#FEC84B", "#31AF89", "#2970FF"],
              borderWidth: 0,
              cutout: "80%",
            },
          ],
        },
        options: {
          // Sem animacao: corta ~1s de trabalho na main thread apos o clique (INP).
          animation: false,
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });

      //CREATE TABLE
      //———————————————————————————————————————————————
      //———————————————————————————————————————————————
      //———————————————————————————————————————————————
      //$("[morada-fiscal-result]").text(D16_morada);
      //$("[tabela-description-result]").text(selectedTable.maritalStatus);
      const tabelaTextValues = `
      <div class="tabela-irs-title_wrapper">
      <span class="text-size-small text-weight-medium" morada-fiscal-result="">${D16_morada}</span>
      <span class="text-weight-medium">·</span>
      <span class="text-color-tertiary text-size-small" tabela-description-result="">${selectedTable.maritalStatus}</span>
      </div>
        `;
      document.querySelector(".tabela-irs-values-content").innerHTML =
        tabelaTextValues;
      //console.log(selectedRow);

      function formatEuro(value) {
        if (typeof value === "number") {
          return (
            value
              .toFixed(2)
              .replace(".", ",")
              .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "€"
          );
        } else if (!isNaN(parseFloat(value))) {
          const num = parseFloat(value);
          return (
            num
              .toFixed(2)
              .replace(".", ",")
              .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "€"
          );
        }
        return value;
      }

      function formatPercent(value) {
        if (typeof value === "number") {
          return value.toFixed(2).replace(".", ",") + "%";
        } else if (!isNaN(parseFloat(value))) {
          return parseFloat(value).toFixed(2).replace(".", ",") + "%";
        }
        return value;
      }

      // TABELA
      //———————————————————————————————————————————————
      //———————————————————————————————————————————————
      //———————————————————————————————————————————————
      let tableContent = "";
      const brackets = selectedTable.salaryBrackets;
      const lastIndex = brackets.length - 1;

      brackets.forEach((row, index) => {
        //console.log(row.deduction + " ————————— ");

        const isLast = index === lastIndex;
        const label = isLast
          ? `mais de ${formatEuro(brackets[index - 1].max)}`
          : `até ${formatEuro(row.max)}`;

        const rowClass = row === selectedRow ? "is-selected" : "";

        tableContent += `
      <tr class="${rowClass}">
        <td>${label}</td>
        <td>${
          row.rate !== null
            ? (row.rate * 100).toFixed(2).replace(".", ",") + "%"
            : "-"
        }</td>
        <td>${
          typeof row.deduction === "number"
            ? formatEuro(row.deduction)
            : row.deduction.replace(/\./g, ",")
        }</td>
        <td>${
          row.taxaEfetiva !== null
            ? (row.taxaEfetiva * 100).toFixed(2).replace(".", ",") + "%"
            : "-"
        }</td>
      </tr>
    `;
      });

      const tableElement = document.querySelector(".table-wrapper");
      tableElement.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Remuneração mensal (R)</th>
          <th>Taxa marginal máx.</th>
          <th>Parcela a abater</th>
          <th>Taxa efectiva</th>
        </tr>
      </thead>
      <tbody>
        ${tableContent}
      </tbody>
    </table>
  `;
      //———————————————————————————————————————————————
      //———————————————————————————————————————————————
      //———————————————————————————————————————————————

      if (D36_duodecimos == 0) {
        //
        $("[irs-row-data]").css("display", "none");
      } else {
        $("[irs-row-data]").css("display", "flex");
      }
      /*
      $("[retribuicao-extra-result]").text(formatEuro(D23_retribuicaoExtra));
      $("[outros-rendimentos-result]").text(formatEuro(D26_outrosRendIsentos));
      $("[ret-retribuicao-extra-result]").text(formatEuro(D44_retIRSextra));
      */
      if (D26_outrosRendIsentos <= 0) {
        $("[outros-rendimentos-row-data]").css("display", "none");
      } else {
        $("[outros-rendimentos-row-data]").css("display", "flex");
      }
      if (D44_retIRSextra <= 0) {
        $("[retencao-retribuicao-extra-row-data]").css("display", "none");
      } else {
        $("[retencao-retribuicao-extra-row-data]").css("display", "flex");
      }
      if (D23_retribuicaoExtra <= 0) {
        $("[retribuicao-extra-row-data]").css("display", "none");
      } else {
        $("[retribuicao-extra-row-data]").css("display", "flex");
      }
    }
    applyValues();

    logs();
  });

  let myDonutChart = null;
});
