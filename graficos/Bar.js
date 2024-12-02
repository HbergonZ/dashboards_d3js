export function createBarChart(data) {
  // Calculando a largura máxima dos nomes no eixo Y
  const maxLabelWidth = Math.max(
    ...data.map((d) => getTextWidth(d.name, "12px sans-serif"))
  );

  // Ajuste da margem esquerda, considerando a largura máxima dos nomes e a distância de 10px
  const margin = { top: 20, right: 20, bottom: 100, left: maxLabelWidth + 10 };

  const containerWidth = document.getElementById(
    "bar-chart-container"
  ).clientWidth; // Obtendo a largura da div
  const containerHeight = 300; // Altura fixa, mas pode ser ajustada
  const width = containerWidth - margin.left - margin.right;
  const height = data.length * 30;

  data.sort((a, b) => b.population - a.population);

  const chartContainer = d3
    .select("#bar-chart-container")
    .html("") // Limpar o conteúdo anterior
    .append("div")
    .style("width", `${containerWidth}px`)
    .style("height", `${containerHeight}px`)
    .style("overflow-y", "auto")
    .style("overflow-x", "hidden");

  const svg = chartContainer
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.population)])
    .range([0, width - 20]);

  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.name))
    .range([0, height])
    .padding(0.1);

  const tooltip = d3.select("#tooltip");

  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", (d) => yScale(d.name))
    .attr("width", (d) => xScale(d.population))
    .attr("height", yScale.bandwidth())
    .attr("fill", "steelblue")
    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${
            d.name
          }</strong><br>População: ${d.population.toLocaleString()}`
        );
    })
    .on("mousemove", function (event) {
      const tooltipWidth = tooltip.node().offsetWidth;
      const tooltipHeight = tooltip.node().offsetHeight;
      const mouseX = event.pageX;
      const mouseY = event.pageY;

      let left = mouseX + 10;
      if (mouseX + tooltipWidth + 10 > window.innerWidth) {
        left = mouseX - tooltipWidth - 10;
      }

      tooltip
        .style("left", left + "px")
        .style("top", mouseY - tooltipHeight - 10 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  svg
    .selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", (d) => {
      const barEnd = xScale(d.population);
      const labelText = `${(d.population / 1000000).toFixed(1)} mi`;
      const labelWidth = getTextWidth(labelText, "11px sans-serif"); // Alterado para 10px

      // Se o rótulo não couber na barra, posiciona-o fora
      return barEnd + labelWidth + 10 < width
        ? barEnd + 10
        : barEnd - labelWidth - 10;
    })
    .attr("y", (d) => yScale(d.name) + yScale.bandwidth() / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", "start")
    .text((d) => {
      const million = 1000000;
      if (d.population >= million) {
        return `${(d.population / million).toFixed(1)} mi`;
      }
      return d.population.toLocaleString();
    })
    .style("fill", "black")
    .style("font-size", "11px") // Definindo o tamanho da fonte para 10px
    .style("white-space", "pre-wrap") // Permitindo quebra de linha no rótulo
    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${
            d.name
          }</strong><br>População: ${d.population.toLocaleString()}`
        );
    })
    .on("mousemove", function (event) {
      const tooltipWidth = tooltip.node().offsetWidth;
      const tooltipHeight = tooltip.node().offsetHeight;
      const mouseX = event.pageX;
      const mouseY = event.pageY;

      let left = mouseX + 10;
      if (mouseX + tooltipWidth + 10 > window.innerWidth) {
        left = mouseX - tooltipWidth - 10;
      }

      tooltip
        .style("left", left + "px")
        .style("top", mouseY - tooltipHeight - 10 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  svg
    .append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("font-size", "12px");

  // Função para calcular a largura do texto (para ajustar o rótulo)
  function getTextWidth(text, font) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font;
    return context.measureText(text).width;
  }
}
