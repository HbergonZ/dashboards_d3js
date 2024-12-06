export function createBarChart(containerId, data, xValue, yValue) {
  const maxLabelWidth = 150; // Largura máxima do rótulo no eixo Y
  const lineHeight = 1.1; // Altura da linha (em unidades em)
  const fontSize = 12; // Tamanho da fonte em pixels
  const container = document.getElementById(containerId);

  // Função para calcular as dimensões do gráfico
  function calculateDimensions() {
    const containerWidth = container.clientWidth; // Largura do container
    const containerHeight = container.clientHeight; // Altura do container fixa para o gráfico
    const width = containerWidth - margin.left - margin.right;
    const height = data.length * 30;

    return { containerWidth, containerHeight, width, height };
  }

  const margin = { top: 20, right: 50, bottom: 10, left: maxLabelWidth + 20 };

  // Calcula as dimensões do gráfico com base no tamanho atual do container
  const { containerWidth, containerHeight, width, height } =
    calculateDimensions();

  // Ordenar os dados pelo valor de população
  data.sort((a, b) => b[xValue] - a[xValue]);

  const chartContainer = d3
    .select(`#${containerId}`)
    .html("") // Limpa o conteúdo anterior
    .append("div")
    .style("width", `${containerWidth}px`)
    .style("height", `${containerHeight}px`)
    .style("overflow-y", "auto")
    .style("overflow-x", "hidden");

  const svg = chartContainer
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Função para abreviar números grandes
  const abbreviateNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toString();
  };

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[xValue]) * 1.05]) // Adiciona 5% de margem ao limite máximo
    .range([10, width]); // Adiciona 10px de margem inicial na escala X

  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d[yValue]))
    .range([0, height])
    .padding(0.1);

  const tooltip = d3.select("#tooltip");

  svg
    .selectAll(".bar")
    .data(data.filter((d) => d[xValue] > 0)) // Filtra os itens com valor maior que 0
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", (d) => yScale(d[yValue]))
    .attr("width", 0) // Inicia com largura 0
    .attr("height", yScale.bandwidth())
    .attr("fill", "steelblue")
    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${d[yValue]}</strong><br>${xValue}: ${d[
            xValue
          ].toLocaleString()}`
        );
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
    })
    .transition() // Adiciona a animação
    .duration(700) // Duração de 1 segundo
    .attr("width", (d) => xScale(d[xValue])) // Animação de largura das barras
    .on("end", function () {
      // Após a animação das barras, exibe os rótulos
      svg
        .selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d) => xScale(d[xValue]) + 5)
        .attr("y", (d) => yScale(d[yValue]) + yScale.bandwidth() / 2)
        .attr("dy", ".35em")
        .text((d) => abbreviateNumber(d[xValue]))
        .style("font-size", "11px")
        .style("fill", "black")
        .on("mouseover", function (event, d) {
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>${d[yValue]}</strong><br>${xValue}: ${d[
                xValue
              ].toLocaleString()}`
            );
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
    });

  svg
    .append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("font-size", `${fontSize}px`)
    .each(function (d) {
      const text = d3.select(this);
      const words = d.split(" ");
      const x = text.attr("x");
      const y = text.attr("y");
      const dy = parseFloat(text.attr("dy")) || 0;

      // Limpa o texto original
      text.text(null);

      // Adiciona um tspan para cada linha
      let tspan = text
        .append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", `${dy}em`);

      let line = [];
      words.forEach((word) => {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > maxLabelWidth) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", `${lineHeight}em`)
            .text(word);
        }
      });
    });

  // Redimensiona o gráfico quando a janela for redimensionada
  window.addEventListener("resize", function () {
    const { containerWidth, containerHeight, width, height } =
      calculateDimensions();
    xScale.range([10, width]); // Atualiza a escala X
    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    chartContainer
      .style("width", `${containerWidth}px`)
      .style("height", `${containerHeight}px`);

    // Atualiza as barras
    svg.selectAll(".bar").attr("width", (d) => xScale(d[xValue]));

    // Atualiza os labels
    svg.selectAll(".label").attr("x", (d) => xScale(d[xValue]) + 5);
  });
}
