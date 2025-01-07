export function createLineChart(containerId, data, xValue, yValue) {
  const maxLabelWidth = 150; // Largura máxima do rótulo no eixo Y
  const lineHeight = 1.1; // Altura da linha (em unidades em)
  const fontSize = 12; // Tamanho da fonte em pixels

  console.log(`Criando gráfico para o contêiner: ${containerId}`);
  const container = document.getElementById(containerId);
  console.log(container); // Verifique se o contêiner existe corretamente

  if (!container) {
    console.error(`Container com id ${containerId} não encontrado!`);
    return;
  }

  // Função para calcular as dimensões do gráfico
  function calculateDimensions() {
    const containerWidth = container.clientWidth; // Largura do container
    const containerHeight = container.clientHeight; // Altura do container fixa para o gráfico
    const width = containerWidth - margin.left - margin.right;
    const height = data.length * 25; // A altura será dinâmica dependendo do número de dados

    return { containerWidth, containerHeight, width, height };
  }

  const margin = { top: 10, right: 10, bottom: 20, left: maxLabelWidth - 50 };

  // Calcula as dimensões do gráfico com base no tamanho atual do container
  const { containerWidth, containerHeight, width, height } =
    calculateDimensions();

  const svg = d3
    .select(`#${containerId}`)
    .html("") // Limpa o contêiner
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
