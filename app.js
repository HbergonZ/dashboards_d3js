// Importando as funções de gráficos
import { createBarChart } from "./graficos/Bar.js";
import { createLineChart } from "./graficos/Line.js";
import { createPieChart } from "./graficos/Pie.js";
import { createCombinedChart } from "./graficos/Bar_Line.js"; // Certifique-se de que este caminho está correto

// Função para buscar os dados da API REST Countries
async function fetchData() {
  const url = "https://restcountries.com/v3.1/all"; // URL da API REST Countries
  const response = await fetch(url);
  const data = await response.json();

  // Transformando os dados recebidos para um formato adequado para os gráficos
  const formattedData = data.map((country) => ({
    name: country.name.common,
    population: country.population,
    area: country.area,
    region: country.region,
    languages: Object.values(country.languages || {}),
  }));

  return formattedData;
}

// Usando os dados após carregá-los da API
fetchData().then(function (data) {
  console.log(data); // Verificando os dados carregados

  // Preenchendo o dropdown com os países
  const countrySelect = d3.select("#country-select");
  const uniqueCountries = [...new Set(data.map((d) => d.name))];
  uniqueCountries.sort(); // Ordenando os países alfabeticamente
  uniqueCountries.forEach((country) => {
    countrySelect.append("option").text(country).attr("value", country);
  });

  // Criando os gráficos com todos os dados inicialmente
  createBarChart(data);
  createLineChart(data);
  createPieChart(data);
  createCombinedChart(data);

  // Adicionando o evento de mudança no dropdown
  d3.select("#country-select").on("change", function () {
    const selectedCountry = d3.select(this).node().value;

    // Filtrando os dados com base no país selecionado
    const filteredData = selectedCountry
      ? data.filter((d) => d.name === selectedCountry)
      : data;

    // Limpando os gráficos anteriores
    d3.select("#bar-chart-container").html("");
    d3.select("#line-chart-container").html("");
    d3.select("#pie-chart-container").html("");

    // Recriando os gráficos com os dados filtrados
    createBarChart(filteredData);
    createLineChart(filteredData);
    createPieChart(filteredData);
    createCombinedChart(filteredData);
  });
});
