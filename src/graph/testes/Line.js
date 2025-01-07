export function createLineChart(containerId, data, xValue, yValue) {
  const maxLabelWidth = 150;
  const lineHeight = 1.1;
  const fontSize = 12;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container com id ${containerId} não encontrado!`);
    return;
  }

  function calculateDimensions() {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const width = containerWidth - margin.left - margin.right;
    const height = 290 - margin.bottom;

    return { containerWidth, containerHeight, width, height };
  }

  const margin = { top: 10, right: 10, bottom: 50, left: 100 };

  const { containerWidth, containerHeight, width, height } =
    calculateDimensions();

  const svg = d3
    .select(`#${containerId}`)
    .html("")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Verifica se os valores do eixo X são datas ou não
  const isDate = !isNaN(Date.parse(data[0][xValue]));

  let xScale;

  if (isDate) {
    // Usando escala de tempo se for data
    xScale = d3
      .scaleTime()
      .domain([
        d3.min(data, (d) => new Date(d[xValue])),
        d3.max(data, (d) => new Date(d[xValue])),
      ])
      .range([0, width]);
  } else {
    // Usando escala de pontos se não for data
    xScale = d3
      .scalePoint()
      .domain(data.map((d) => d[xValue]))
      .range([0, width]);
  }

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[yValue])])
    .range([height, 0]);

  function abbreviateValue(value) {
    if (value.length > 10) {
      return `${value.substring(0, 7)}...`;
    }
    return value;
  }

  const tickSpacing = width / data.length;

  const xAxis = svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      isDate
        ? d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d")) // Formatação para datas
        : d3.axisBottom(xScale).tickFormat(abbreviateValue) // Abreviação se não for data
    );

  xAxis
    .selectAll("text")
    .attr("transform", function (d) {
      return tickSpacing < 50 ? "rotate(-45)" : "";
    })
    .style("text-anchor", "end");

  svg.append("g").call(d3.axisLeft(yScale));

  const tooltip = d3.select("#tooltip");

  const formatValue = d3.format(",.2f");

  function formatValueWithComma(value) {
    return formatValue(value).replace(".", ",");
  }

  const linePath = svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line()
        .x((d) => xScale(d[xValue]))
        .y((d) => yScale(d[yValue]))
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

  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale(d[xValue]))
    .attr("cy", (d) => yScale(d[yValue]))
    .attr("r", 3)
    .attr("fill", "black")
    .style("opacity", 0)
    .transition()
    .duration(2000)
    .delay((d, i) => i * 100)
    .style("opacity", 1);

  svg
    .selectAll(".dot")
    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${d[xValue]}</strong><br><span>Valor: ${formatValue(
            d[yValue]
          )}</span>`
        )
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 40}px`);
    })
    .on("mousemove", function (event) {
      const tooltipWidth = tooltip.node().offsetWidth;
      const tooltipHeight = tooltip.node().offsetHeight;

      let left = event.pageX + 10;
      if (event.pageX + tooltipWidth + 10 > window.innerWidth) {
        left = event.pageX - tooltipWidth - 10;
      }

      tooltip
        .style("left", left + "px")
        .style("top", event.pageY - tooltipHeight - 10 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });
}
