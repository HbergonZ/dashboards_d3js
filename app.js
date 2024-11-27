// Importando as funções de gráficos
import { createBarChart } from "./graficos/Bar.js";
import { createLineChart } from "./graficos/Line.js";
import { createPieChart } from "./graficos/Pie.js";
import { createCombinedChart } from "./graficos/Bar_Line.js"; // Certifique-se de que este caminho está correto

// Usando os gráficos após carregar os dados
d3.json("data.json").then(function (data) {
  console.log(data);

  // Criando os gráficos com todos os dados inicialmente
  createBarChart(data);
  createLineChart(data);
  createPieChart(data); // Criando o gráfico de pizza com todos os dados inicialmente
  createCombinedChart(data);

  // Adicionando o filtro
  d3.select("#filter-button").on("click", function () {
    const startYear = parseInt(d3.select("#start-date").node().value);
    const endYear = parseInt(d3.select("#end-date").node().value);

    // Verificando se o intervalo de anos é válido
    if (isNaN(startYear) || isNaN(endYear) || startYear > endYear) {
      alert("Por favor, insira um intervalo de anos válido.");
      return;
    }

    // Filtrando os dados conforme os anos informados
    const filteredData = data.filter(
      (d) => d.year >= startYear && d.year <= endYear
    );

    // Limpando os gráficos anteriores
    d3.select("#bar-chart-container").html("");
    d3.select("#line-chart-container").html("");
    d3.select("#pie-chart-container").html(""); // Limpando o gráfico de pizza também

    // Criando os gráficos com os dados filtrados
    createBarChart(filteredData);
    createLineChart(filteredData);
    createPieChart(filteredData); // Recriando o gráfico de pizza com os dados filtrados
    createCombinedChart(filteredData); // Atualizando o gráfico combinado
  });

  // Função para limpar os filtros e mostrar todos os dados
  d3.select("#clear-filters").on("click", function () {
    // Limpando os campos de filtro
    d3.select("#start-date").node().value = "";
    d3.select("#end-date").node().value = "";

    // Exibindo novamente os gráficos com os dados completos
    d3.select("#bar-chart-container").html("");
    d3.select("#line-chart-container").html("");
    d3.select("#pie-chart-container").html(""); // Limpando o gráfico de pizza também

    createBarChart(data);
    createLineChart(data);
    createPieChart(data); // Recriando o gráfico de pizza com todos os dados
    createCombinedChart(data); // Atualizando o gráfico combinado
  });
});
