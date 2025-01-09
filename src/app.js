//--------------------------------------------------------------------
// IMPORTAÇÃO DE ELEMENTOS
//--------------------------------------------------------------------
/* Gráfico de Barra dos Exemplos */
import { createBarChart } from "./graph/examples/Bar.js";

/* Gráfico de Linha dos Exemplos */
import { createLineChart } from "./graph/examples/Line.js";

/* Gráfico de Linha Thomas */
/* import { createLineChart } from "./graph/elements/Line.js"; */

/* Consultas */
import {
  getTop10ByKey,
  fullDataframe,
  fullLocalDataframe,
} from "./database/queries.js";

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

  const top10Population = getTop10ByKey(filteredData, "area");
  console.log("Top 10 por população:", top10Population);
  createLineChart("line-chart-container", top10Population, "name", [
    "population",
    "area",
  ]);
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
  console.log("Dados recebidos para updateCharts:", data);
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
