export function createLineChart(containerId, data, xValue, yValue) {
  const container = d3.select(`#${containerId}`);
  container.html(""); // Limpa o contêiner

  const width = 400;
  const height = 300;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };

  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scalePoint()
    .domain(data.map((d) => d[xValue]))
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[yValue])])
    .range([height, 0]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg.append("g").call(d3.axisLeft(yScale));

  svg
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
    );
}
