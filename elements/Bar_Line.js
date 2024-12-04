export function createCombinedChart(data) {
  const width = 500;
  const height = 300;

  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const graphWidth = width - margin.left - margin.right;
  const graphHeight = height - margin.top - margin.bottom;

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.year))
    .range([0, graphWidth])
    .padding(0.1);

  const yBar = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)])
    .nice()
    .range([graphHeight, 0]);

  const yLine = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)])
    .nice()
    .range([graphHeight, 0]);

  const svg = d3
    .select("#combined-chart-container")
    .html("") // Limpa o conteúdo do gráfico
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Eixos
  svg
    .append("g")
    .attr("transform", `translate(0,${graphHeight})`)
    .call(d3.axisBottom(x));

  svg.append("g").call(d3.axisLeft(yBar));

  svg
    .append("g")
    .attr("transform", `translate(${graphWidth}, 0)`)
    .call(d3.axisRight(yLine));

  // Barra de Animação
  const bars = svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.year))
    .attr("y", graphHeight)
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .style("fill", "steelblue");

  // Animação das barras
  bars
    .transition()
    .duration(1000)
    .attr("y", (d) => yBar(d.value))
    .attr("height", (d) => graphHeight - yBar(d.value));

  // Linha
  const line = d3
    .line()
    .x((d) => x(d.year) + x.bandwidth() / 2)
    .y((d) => yLine(d.value));

  // Adicionar a linha com animação
  const path = svg
    .append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", line)
    .style("fill", "none")
    .style("stroke", "orange")
    .style("stroke-width", 2)
    .style("opacity", 0);

  const totalLength = path.node().getTotalLength();

  // Animação da linha
  setTimeout(() => {
    path
      .style("opacity", 1)
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
  }, 1000);

  // Marcadores de linha
  const lineMarkers = svg
    .selectAll(".line-point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "line-point")
    .attr("cx", (d) => x(d.year) + x.bandwidth() / 2)
    .attr("cy", (d) => yLine(d.value)) // Colocando os pontos na posição correta
    .attr("r", 4)
    .style("fill", "orange")
    .style("opacity", 0); // Inicia com opacidade zero

  // Animação dos marcadores
  lineMarkers
    .transition()
    .delay((d, i) => (i / data.length) * 1000 + 1000) // Delay para garantir que a linha seja animada primeiro
    .duration(500) // Duração mais curta para a animação dos pontos
    .style("opacity", 1); // Marcadores surgem suavemente

  // Tooltip
  const tooltip = d3.select("#tooltip").style("opacity", 0);

  // Função para o tooltip nas barras
  bars
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`Ano: ${d.year}<br>Valor: ${d.value}`);
    })
    .on("mousemove", function (event) {
      const tooltipWidth = tooltip.node().offsetWidth;
      const tooltipHeight = tooltip.node().offsetHeight;
      let left = event.pageX + 5;
      if (event.pageX + tooltipWidth + 10 > window.innerWidth) {
        left = event.pageX - tooltipWidth - 5;
      }
      tooltip
        .style("left", `${left}px`)
        .style("top", `${event.pageY - tooltipHeight - 10}px`);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // Função para o tooltip nos marcadores da linha
  lineMarkers
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`Ano: ${d.year}<br>Valor: ${d.value}`);
    })
    .on("mousemove", function (event) {
      const tooltipWidth = tooltip.node().offsetWidth;
      const tooltipHeight = tooltip.node().offsetHeight;
      let left = event.pageX + 5;
      if (event.pageX + tooltipWidth + 10 > window.innerWidth) {
        left = event.pageX - tooltipWidth - 5;
      }
      tooltip
        .style("left", `${left}px`)
        .style("top", `${event.pageY - tooltipHeight - 10}px`);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
    });
}
