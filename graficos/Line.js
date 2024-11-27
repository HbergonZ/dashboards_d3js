export function createLineChart(data, animated = true) {
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const width = 400 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const svg = d3
    .select("#line-chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scaleTime()
    .domain([
      new Date(
        d3.min(data, (d) => d.year),
        0,
        1
      ),
      new Date(
        d3.max(data, (d) => d.year),
        0,
        1
      ),
    ])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)])
    .range([height, 0]);

  const line = d3
    .line()
    .x((d) => xScale(new Date(d.year, 0, 1)))
    .y((d) => yScale(d.value));

  // Adiciona eixos
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).ticks(d3.timeYear.every(1)));

  svg.append("g").call(d3.axisLeft(yScale));

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Ano");

  svg
    .append("text")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .style("font-size", "14px")
    .text("Valor");

  // Adiciona a linha
  const path = svg
    .append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2);

  if (animated) {
    path
      .attr("stroke-dasharray", function () {
        const totalLength = this.getTotalLength();
        return `${totalLength} ${totalLength}`;
      })
      .attr("stroke-dashoffset", function () {
        return this.getTotalLength();
      })
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
  }

  // Adiciona marcadores
  const markers = svg
    .selectAll(".marker")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "marker")
    .attr("cx", (d) => xScale(new Date(d.year, 0, 1)))
    .attr("cy", animated ? height : (d) => yScale(d.value)) // Começa na base do gráfico se animado
    .attr("r", 5)
    .attr("fill", "steelblue");

  if (animated) {
    markers
      .transition()
      .delay((d, i) => i * 200) // Escalonar animações
      .duration(800)
      .attr("cy", (d) => yScale(d.value));
  }

  // Adiciona interatividade (tooltip)
  const tooltip = d3.select("#tooltip");

  svg
    .selectAll(".marker")
    .on("mouseover", function (event, d) {
      tooltip.style("opacity", 1).html(`Ano: ${d.year}<br>Valor: ${d.value}`);
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
}
