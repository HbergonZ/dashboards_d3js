export function createLineChart(containerId, data, xValue, yValues) {
  const maxLabelWidth = 150;
  const lineHeight = 1.1;
  const fontSize = 12;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container com id ${containerId} não encontrado!`);
    return;
  }

  const margin = { top: 10, right: 10, bottom: 60, left: 10 };

  function calculateDimensions() {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    return { width, height };
  }

  const { width, height } = calculateDimensions();

  const tempSvg = d3.select("body").append("svg");

  // Encontrar a maior largura do rótulo do eixo Y
  const yAxisTemp = tempSvg
    .append("g")
    .call(
      d3
        .axisLeft(
          d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d[yValues[0]])])
            .range([height, 0])
        )
        .ticks(5)
    )
    .style("font-size", `${fontSize}px`);

  const maxYLabelWidth = d3.max(
    yAxisTemp.selectAll("text").nodes(),
    (node) => node.getBBox().width
  );

  tempSvg.remove();

  const adjustedWidth = width - maxYLabelWidth;

  const svg = d3
    .select(`#${containerId}`)
    .html("")
    .append("svg")
    .attr("width", adjustedWidth + margin.left + margin.right + maxYLabelWidth)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr(
      "transform",
      `translate(${margin.left + maxYLabelWidth},${margin.top})`
    );

  const isDate = !isNaN(Date.parse(data[0][xValue]));

  let xScale;
  if (isDate) {
    xScale = d3
      .scaleTime()
      .domain([
        new Date(data[0][xValue]),
        new Date(data[data.length - 1][xValue]),
      ])
      .range([0, adjustedWidth]);
  } else {
    xScale = d3
      .scalePoint()
      .domain(data.map((d) => d[xValue]))
      .range([0, adjustedWidth])
      .padding(0.5);
  }

  // Criação das escalas Y para múltiplos valores
  const yScales = yValues.map((yValue) =>
    d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[yValue])])
      .nice()
      .range([height, 0])
  );

  // Criação dos eixos Y
  yScales.forEach((yScale, i) => {
    if (i === 0) {
      svg.append("g").call(d3.axisLeft(yScale).ticks(5)); // Primeira escala Y no lado esquerdo
    } else {
      svg
        .append("g")
        .attr("transform", `translate(${adjustedWidth + 50 * i}, 0)`)
        .call(d3.axisRight(yScale).ticks(5)); // Escalas Y adicionais no lado direito
    }
  });

  // Criação do eixo X
  const xAxis = svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickFormat(isDate ? d3.timeFormat("%b %d") : (d) => d)
    );

  xAxis
    .selectAll("text")
    .attr("transform", `rotate(-45)`)
    .style("text-anchor", "end");

  const tooltip = d3.select("#tooltip");

  // Adicionando a legenda
  const legend = svg
    .append("g")
    .attr("transform", `translate(${width - 150}, 20)`);

  // Criação das linhas para cada valor de Y
  yValues.forEach((yValue, i) => {
    const linePath = svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", d3.schemeCategory10[i % 10]) // Cores diferentes para cada linha
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x((d) => xScale(d[xValue]))
          .y((d) => yScales[i](d[yValue]))
      )
      .attr("stroke-dasharray", function () {
        return this.getTotalLength();
      })
      .attr("stroke-dashoffset", function () {
        return this.getTotalLength();
      })
      .transition()
      .duration(2000)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", 0);

    // Animação dos marcadores (círculos)
    svg
      .selectAll(`.dot-${yValue}`)
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d[xValue]))
      .attr("cy", (d) => yScales[i](d[yValue]))
      .attr("r", 3)
      .attr("fill", "black")
      .style("opacity", 0)
      .transition()
      .duration(2000)
      .delay((d, i) => i * 100)
      .style("opacity", 1);

    // Adicionar a legenda para cada linha
    legend
      .append("circle")
      .attr("cx", 0)
      .attr("cy", i * 20)
      .attr("r", 6)
      .attr("fill", d3.schemeCategory10[i % 10]);

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", i * 20 + 5)
      .style("font-size", "12px")
      .text(yValue);
  });

  // Tooltip para os pontos
  svg
    .selectAll(".dot")
    .on("mouseover", function (event, d) {
      // Função de formatação para valores numéricos
      const formatValue = d3.format(".2f"); // Formata com 2 casas decimais
      const formattedValue = formatValue(d[yValues[0]]).replace(".", ","); // Troca o ponto por vírgula

      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${d[xValue]}</strong><br><span> Valor: ${formattedValue}</span>`
        )
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 40}px`);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 40}px`);
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });
}
