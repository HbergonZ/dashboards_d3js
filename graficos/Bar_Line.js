export function createCombinedChart(data) {
  const width = 500;
  const height = 300;

  // Margens para o gráfico
  const margin = { top: 20, right: 30, bottom: 40, left: 40 };

  // Dimensões do gráfico
  const graphWidth = width - margin.left - margin.right;
  const graphHeight = height - margin.top - margin.bottom;

  // Escalas
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.year)) // Mudando para 'year' para eixo X
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

  // Criação do SVG
  const svg = d3
    .select("#combined-chart-container")
    .html("") // Limpa o conteúdo do gráfico
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Eixo X (anos)
  svg
    .append("g")
    .attr("transform", `translate(0,${graphHeight})`)
    .call(d3.axisBottom(x));

  // Eixo Y para barras
  svg.append("g").call(d3.axisLeft(yBar));

  // Eixo Y para a linha
  svg
    .append("g")
    .attr("transform", `translate(${graphWidth}, 0)`)
    .call(d3.axisRight(yLine));

  // Criar gráfico de barras
  const bars = svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.year)) // Usando 'year' para as barras
    .attr("y", (d) => yBar(d.value))
    .attr("width", x.bandwidth())
    .attr("height", (d) => graphHeight - yBar(d.value))
    .style("fill", "steelblue");

  // Criar gráfico de linha
  const line = d3
    .line()
    .x((d) => x(d.year) + x.bandwidth() / 2) // Centraliza a linha sobre as barras
    .y((d) => yLine(d.value));

  svg
    .append("path")
    .data([data]) // Usando os mesmos dados para a linha
    .attr("class", "line")
    .attr("d", line)
    .style("fill", "none")
    .style("stroke", "orange")
    .style("stroke-width", 2);

  // Tooltip
  const tooltip = d3.select("#tooltip").style("opacity", 0);

  // Função de mouseover para mostrar o tooltip
  bars
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(`Ano: ${d.year}<br>Valor: ${d.value}`)
        .style("left", `${event.pageX + 5}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // Função para tooltip na linha
  svg
    .selectAll(".line-point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "line-point")
    .attr("cx", (d) => x(d.year) + x.bandwidth() / 2)
    .attr("cy", (d) => yLine(d.value))
    .attr("r", 4)
    .style("fill", "orange")
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(`Ano: ${d.year}<br>Valor: ${d.value}`)
        .style("left", `${event.pageX + 5}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
    });
}
