export function createLineChart(
  containerId,
  data,
  xValue,
  yValues,
  legendPosition = "top"
) {
  const maxLabelWidth = 150;
  const fontSize = 12;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container com id ${containerId} não encontrado!`);
    return;
  }

  const margin = {
    top: legendPosition === "top" ? 50 : 10,
    right: legendPosition === "right" ? 100 : 60,
    bottom: 60,
    left: 10,
  };

  function calculateDimensions() {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    return { width, height };
  }

  const { width, height } = calculateDimensions();

  const tempSvg = d3.select("body").append("svg");

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

  const yScales = yValues.map((yValue) =>
    d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[yValue])])
      .nice()
      .range([height, 0])
  );

  yScales.forEach((yScale, i) => {
    if (i === 0) {
      svg.append("g").call(d3.axisLeft(yScale).ticks(5));
    } else {
      svg
        .append("g")
        .attr("transform", `translate(${adjustedWidth}, 0)`)
        .call(d3.axisRight(yScale).ticks(5));
    }
  });

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

  const tooltip = d3
    .select(`#${containerId}`)
    .append("div")
    .attr("class", "tooltip");

  const legend = d3
    .select(`#${containerId} svg`)
    .append("g")
    .attr(
      "transform",
      legendPosition === "right"
        ? `translate(${adjustedWidth + margin.left + 10}, ${margin.top})`
        : `translate(${margin.left}, ${margin.top - 40})`
    );

  const legendItemWidth = 100; // Largura máxima de cada item na legenda
  const legendSpacing = 10; // Espaçamento horizontal entre os itens

  let currentX = 0; // Posição horizontal inicial
  let currentY = 0; // Posição vertical inicial

  yValues.forEach((yValue, i) => {
    if (currentX + legendItemWidth > adjustedWidth) {
      currentX = 0; // Reseta a posição horizontal
      currentY += 20; // Incrementa a posição vertical
    }

    const legendGroup = legend
      .append("g")
      .attr("transform", `translate(${currentX}, ${currentY})`);

    legendGroup
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 6)
      .attr("fill", d3.schemeCategory10[i % 10]);

    legendGroup
      .append("text")
      .attr("x", 20)
      .attr("y", 5)
      .style("font-size", "12px")
      .text(yValue);

    currentX += legendItemWidth + legendSpacing; // Atualiza a posição horizontal
  });

  yValues.forEach((yValue, i) => {
    const line = svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", d3.schemeCategory10[i % 10])
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
      .attr("stroke-dashoffset", 0);

    const circles = svg
      .selectAll(`.circle-${yValue}`)
      .data(data)
      .enter()
      .append("circle")
      .attr("class", `circle-${yValue}`)
      .attr("cx", (d) => xScale(d[xValue]))
      .attr("cy", (d) => yScales[i](d[yValue]))
      .attr("r", 4)
      .attr("fill", d3.schemeCategory10[i % 10])
      .style("opacity", 0)
      .on("mouseover", function (event, d) {
        const formatValue = d3.format(",.0f");
        const formattedValue = formatValue(d[yValue]).replace(/,/g, ".");

        tooltip
          .style("opacity", 1)
          .style("visibility", "visible")
          .html(
            `<strong>${d[xValue]}</strong><br><span> Valor: ${formattedValue}</span>`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 40}px`);
      })
      .on("mousemove", function (event) {
        const [mouseX, mouseY] = d3.pointer(event);
        tooltip
          .style("left", `${mouseX + 10}px`)
          .style("top", `${mouseY - 20}px`);
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0).style("visibility", "hidden");
      });

    circles
      .transition()
      .duration(2000)
      .delay((d, i) => i * 200)
      .style("opacity", 1);
  });
}
