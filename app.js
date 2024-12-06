// Importando as funções de gráficos
import { createBarChart } from "./elements/Bar.js";
// Importando as funções de filtro
import {
  populateCountryCheckboxes,
  filterCountries,
  getSelectedCountries,
} from "./elements/Filtros.js";

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

  // Popular a lista de checkboxes
  populateCountryCheckboxes(data);

  // Adicionar o evento de filtro para a barra de busca
  document
    .getElementById("search-input")
    .addEventListener("input", function () {
      filterCountries(); // Chama a função de filtro
    });

  // Criar o gráfico de barras com todos os dados inicialmente
  createBarChart("bar-chart-container", data, "population", "name");

  // Evento para o botão de filtrar
  d3.select("#filter-button").on("click", function () {
    const selectedCountries = getSelectedCountries();

    // Filtrar os dados com base nos países selecionados
    const filteredData = selectedCountries.length
      ? data.filter((d) => selectedCountries.includes(d.name))
      : data;

    // Limpando o gráfico de barras anterior e recriando com os dados filtrados
    d3.select("#bar-chart-container").html("");
    createBarChart("bar-chart-container", filteredData, "population", "name"); // Incluindo os argumentos xValue e yValue
  });

  // Evento para o botão de limpar filtros
  d3.select("#clear-filters").on("click", function () {
    // Desmarcar todos os checkboxes
    d3.selectAll("#country-checkbox-list input").property("checked", false);

    // Recriar o gráfico com todos os dados
    d3.select("#bar-chart-container").html("");
    createBarChart("bar-chart-container", data, "population", "name"); // Incluindo os argumentos xValue e yValue
  });
});
