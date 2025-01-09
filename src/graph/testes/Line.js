export function createLineChart(containerId, data, xValue, yValue) {
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
  const yScaleTemp = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[yValue])])
    .range([height, 0]);

  const yAxisTemp = tempSvg
    .append("g")
    .call(d3.axisLeft(yScaleTemp).ticks(5))
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

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[yValue])])
    .nice()
    .range([height, 0]);

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

  svg.append("g").call(d3.axisLeft(yScale).ticks(5));

  const tooltip = d3.select("#tooltip");

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
          `<strong>${d[xValue]}</strong><br><span>Valor: ${d[yValue]}</span>`
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
