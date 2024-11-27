// Gráfico de Barras
export function createBarChart(data) {
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const width = 400 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const svg = d3
    .select("#bar-chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.year))
    .range([0, width])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)])
    .range([height, 0]);

  const tooltip = d3.select("#tooltip");

  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(0))
    .attr("width", xScale.bandwidth())
    .attr("height", 0)
    .attr("fill", "steelblue")
    .on("mouseover", function (event, d) {
      tooltip.style("opacity", 1).text(`Valor: ${d.value}`);
    })
    .on("mousemove", function (event) {
      // Pega a largura da tooltip e a posição do mouse
      const tooltipWidth = tooltip.node().offsetWidth;
      const tooltipHeight = tooltip.node().offsetHeight;
      const mouseX = event.pageX;
      const mouseY = event.pageY;

      // Calcula a posição da tooltip para que ela não ultrapasse a borda direita
      let left = mouseX + 10; // Adiciona um pequeno espaço em relação ao cursor
      if (mouseX + tooltipWidth + 10 > window.innerWidth) {
        left = mouseX - tooltipWidth - 10; // Mover para a esquerda se ultrapassar a borda direita
      }

      // Posiciona a tooltip com base na posição do mouse
      tooltip
        .style("left", left + "px")
        .style("top", mouseY - tooltipHeight - 10 + "px"); // Ajusta a altura para exibir acima do cursor
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    })
    .transition()
    .duration(1000)
    .attr("y", (d) => yScale(d.value))
    .attr("height", (d) => height - yScale(d.value));

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("text-anchor", "middle")
    .attr("transform", "rotate(0)");

  svg.append("g").call(d3.axisLeft(yScale).ticks(5));

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Anos");

  svg
    .append("text")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .style("font-size", "14px")
    .text("Valores");
}
