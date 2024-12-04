// Importando as funções de gráficos
import { createBarChart } from "./graficos/Bar.js";

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

  // Criando o gráfico de barras com todos os dados inicialmente
  createBarChart(data);

  // Evento para o botão de filtrar
  d3.select("#filter-button").on("click", function () {
    const selectedCountry = d3.select("#country-select").node().value;

    // Filtrando os dados com base no país selecionado
    const filteredData = selectedCountry
      ? data.filter((d) => d.name === selectedCountry)
      : data;

    // Limpando o gráfico de barras anterior e recriando com os dados filtrados
    d3.select("#bar-chart-container").html("");
    createBarChart(filteredData);
  });

  // Evento para o botão de limpar filtros
  d3.select("#clear-filters").on("click", function () {
    d3.select("#country-select").node().value = ""; // Limpa o dropdown
    d3.select("#bar-chart-container").html(""); // Limpa o gráfico de barras
    createBarChart(data); // Recria o gráfico com todos os dados
  });
});
