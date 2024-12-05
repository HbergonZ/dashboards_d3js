// Função para popular a lista de checkboxes no dropdown
export function populateCountryCheckboxes(data) {
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

// Função para filtrar países conforme o valor digitado na barra de pesquisa
export function filterCountries() {
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
export function getSelectedCountries() {
  const selected = [];
  d3.selectAll("#country-checkbox-list input:checked").each(function () {
    selected.push(this.value);
  });
  return selected;
}
