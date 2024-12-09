// tooltip.js

export function setupTooltips() {
  const tooltip = d3.select("#tooltip");

  // Retorna a função que pode ser chamada para ativar o tooltip
  return function (event, d) {
    tooltip.style("opacity", 1).html(`Ano: ${d.year}<br>Valor: ${d.value}`);
    tooltip
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 20 + "px");
  };
}

export function hideTooltip() {
  d3.select("#tooltip").style("opacity", 0);
}
