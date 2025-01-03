//--------------------------------------------------------------------
// IMPORTAÇÃO DE ELEMENTOS
//--------------------------------------------------------------------
/* Gráfico de Barra dos Exemplos */
import { createBarChart } from "./graph/examples/Bar.js";

/* Gráfico de Linha dos Exemplos */
import { createLineChart } from "./graph/examples/Line.js";

/* Consultas */
import { getTop10ByKey, fullDataframe } from "./database/queries.js";

/* Filtros */
import {
  populateCountryCheckboxes,
  filterCountries,
  getSelectedCountries,
} from "./filter/Filtros.js";

//--------------------------------------------------------------------
// FUNÇÕES AUXILIARES
//--------------------------------------------------------------------
function updateCharts(filteredData) {
  d3.select("#bar-chart-container").html("");
  createBarChart("bar-chart-container", filteredData, "population", "name");

  d3.select("#bar-chart-container-2").html("");
  const filteredByLanguages = filteredData.filter(
    (d) => d.languages.length > 0
  );
  createBarChart(
    "bar-chart-container-2",
    filteredByLanguages,
    "population",
    "languages"
  );

  console.log(
    "Dados filtrados para gráfico de barra 2:",
    filteredData.filter((d) => d.languages.length > 0)
  );

  d3.select("#line-chart-container").html("");
  const top10Population = getTop10ByKey(filteredData, "population");
  createLineChart(
    "line-chart-container",
    top10Population,
    "name",
    "population"
  );
}

function applyFilters(data, selectedCountries) {
  return selectedCountries.length
    ? data.filter((d) => selectedCountries.includes(d.name))
    : data;
}

//--------------------------------------------------------------------
// CARREGAMENTO INICIAL
//--------------------------------------------------------------------
(async function () {
  let data = await fullDataframe();
  let filteredData = data; // Variável para armazenar o dataset filtrado

  // Adicionar evento para buscar países na barra de pesquisa
  document
    .getElementById("search-input")
    .addEventListener("input", filterCountries);

  // Popular checkboxes
  populateCountryCheckboxes(data);

  // Inicializar gráficos com dataset completo
  updateCharts(filteredData);

  // Eventos de Filtros
  document.getElementById("filter-button").addEventListener("click", () => {
    const selectedCountries = getSelectedCountries();
    filteredData = applyFilters(data, selectedCountries); // Atualizar `filteredData`
    updateCharts(filteredData);
  });

  // Evento para limpar filtros
  document.getElementById("clear-filters").addEventListener("click", () => {
    d3.selectAll("#country-checkbox-list input").property("checked", false);
    filteredData = data; // Resetar para o dataset original
    updateCharts(filteredData);
  });
})();
