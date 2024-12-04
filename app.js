// Importando as funções de gráficos
import { createBarChart } from "./elements/Bar.js";

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

// Função para popular a lista de checkboxes
function populateCountryCheckboxes(data) {
  const countryList = d3.select("#country-checkbox-list");
  const uniqueCountries = [...new Set(data.map((d) => d.name))];
  uniqueCountries.sort(); // Ordenando alfabeticamente

  uniqueCountries.forEach((country) => {
    const checkboxItem = countryList
      .append("li")
      .attr("class", "dropdown-item");

    checkboxItem
      .append("input")
      .attr("type", "checkbox")
      .attr("class", "form-check-input me-2")
      .attr("id", `checkbox-${country}`)
      .attr("value", country);

    checkboxItem
      .append("label")
      .attr("for", `checkbox-${country}`)
      .text(country);
  });
}

// Função para filtrar países conforme o valor digitado
function filterCountries() {
  const searchValue = document
    .getElementById("search-input")
    .value.toLowerCase();

  d3.selectAll("#country-checkbox-list .dropdown-item").each(function () {
    const country = d3.select(this).select("label").text().toLowerCase();

    // Exibe ou oculta o item dependendo se corresponde à busca
    if (country.includes(searchValue)) {
      d3.select(this).style("display", "flex");
    } else {
      d3.select(this).style("display", "none");
    }
  });
}

// Função para obter os países selecionados
function getSelectedCountries() {
  const selected = [];
  d3.selectAll("#country-checkbox-list input:checked").each(function () {
    selected.push(this.value);
  });
  return selected;
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
  createBarChart(data);

  // Evento para o botão de filtrar
  d3.select("#filter-button").on("click", function () {
    const selectedCountries = getSelectedCountries();

    // Filtrar os dados com base nos países selecionados
    const filteredData = selectedCountries.length
      ? data.filter((d) => selectedCountries.includes(d.name))
      : data;

    // Limpando o gráfico de barras anterior e recriando com os dados filtrados
    d3.select("#bar-chart-container").html("");
    createBarChart(filteredData);
  });

  // Evento para o botão de limpar filtros
  d3.select("#clear-filters").on("click", function () {
    // Desmarcar todos os checkboxes
    d3.selectAll("#country-checkbox-list input").property("checked", false);

    // Recriar o gráfico com todos os dados
    d3.select("#bar-chart-container").html("");
    createBarChart(data);
  });
});
