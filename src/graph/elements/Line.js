export function createLineChart(id, data, legenda, animated = true) {
  const maxLabelWidth = 40; // Largura máxima do rótulo no eixo Y
  const margin = { top: 20, right: 50, bottom: 50, left: maxLabelWidth + 20 };

  const container = document.getElementById(id);

  const containerWidth = function getWidth() {
    return container.getBoundingClientRect().width;
  };

  const containerHeight = function getHeight() {
    return container.getBoundingClientRect().height;
  };

  const innerHeight = function getInnerHeight() {
    return containerHeight() - margin.top - margin.bottom;
  };

  data.forEach(function (d) {
    d.data = d3.timeParse("%Y-%m-%d")(d.data); // Parse date
    d.contagem = +d.contagem; // Ensure value is numeric
  });

  updateGraphs();

  function addLabels(svg) {
    svg.selectAll(".tempo").remove();
    svg
      .append("text")
      .classed("tempo", true)
      .attr("x", containerWidth() / 2)
      .attr("y", containerHeight() - 40)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("fill", "var(--body-color)")
      .text("Tempo");

    svg.selectAll(".quantidade").remove();
    svg
      .append("text")
      .classed("quantidade", true)
      .attr("x", -45)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .style("font-size", "14px")
      .attr("fill", "var(--body-color)")
      .text("Quantidade");
  }

  function addMarkers(svg, x, y) {
    const tooltip = d3.select("#tooltip-" + id);

    svg.selectAll(".marker").remove();
    svg.selectAll(".marker-escondido").remove();
    const markers_escondidos = svg
      .selectAll(".marker-escondido")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "marker-escondido")
      .attr("cx", (d) => x(new Date(d.data)))
      .attr("cy", (d) => y(d.contagem))
      .attr("r", 8)
      .attr("fill", "var(--pink7)")
      .style("opacity", 0);

    // Sincroniza a animação dos marcadores com o progresso da linha
    markers_escondidos
      .transition()
      .delay((d, i) => (i / data.length) * 1000) // Sincroniza com o progresso da linha
      .duration(200)
      .attr("opacity", 0); // Torna visível gradualmente

    // Adiciona marcadores
    const markers = svg
      .selectAll(".marker")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "marker")
      .attr("cx", (d) => x(new Date(d.data)))
      .attr("cy", (d) => y(d.contagem))
      .attr("r", 3)
      .attr("fill", "var(--pink7)")
      .attr("opacity", 0)
      .style("pointer-events", "none");

    // Sincroniza a animação dos marcadores com o progresso da linha
    markers
      .transition()
      .delay((d, i) => (i / data.length) * 1000) // Sincroniza com o progresso da linha
      .duration(200)
      .attr("opacity", 1);

    svg
      .selectAll(".marker-escondido")
      .on("mouseover", function (event, d) {
        event.target.setAttribute("r", 6);
        event.target.style.opacity = 1;
        tooltip
          .style("opacity", 1)
          .html(
            `<strong class="montserrat">${d.data.toLocaleDateString(
              "pt-BR"
            )}</strong><br> ${legenda}: ${d.contagem}`
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
      .on("mouseout", function (event) {
        event.target.setAttribute("r", 8);
        event.target.style.opacity = 0;
        tooltip.style("opacity", 0);
      });
  }

  function addLine(svg, x, y, animated) {
    svg.selectAll("path.linha").remove();
    let path = svg
      .append("path")
      .classed("linha", true)
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "var(--pink7-transparent)")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d.data);
          })
          .y(function (d) {
            return y(d.contagem);
          })
      );

    if (animated) {
      // Calcula o comprimento total da linha
      const totalLength = path.node().getTotalLength();

      // Animação da linha
      path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

      addMarkers(svg, x, y);
    }
  }

  function addCartesian(svg, x, y) {
    svg.selectAll(".eixox").remove();
    svg.selectAll(".eixoy").remove();
    svg.selectAll(".tick").remove();
    svg.selectAll(".domain").remove();

    svg
      .append("g")
      .classed(".eixox", true)
      .attr("transform", "translate(0," + innerHeight() + ")")
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeMonth) // Ensure it uses months for ticks
          .tickFormat(d3.timeFormat("%b"))
      );

    svg.append("g").classed(".eixoy", true).call(d3.axisLeft(y));
  }

  function updateGraphs() {
    const chartContainer = d3
      .select(`#${id}`)
      .html("") // Limpa o conteúdo anterior
      .append("div")
      .classed("svg-container", true)
      .style("width", `${containerWidth()}px`)
      .style("height", `${containerHeight()}px`);

    let svg = chartContainer
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .classed("svg-content-responsive", true)
      .attr("viewBox", `0 0 ${containerWidth()} ${containerHeight()}`);

    let x = d3
      .scaleTime()
      .domain(
        d3.extent(data, function (d) {
          return d.data;
        })
      )
      .range([0, containerWidth() - 2]);

    let y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function (d) {
          return +d.contagem;
        }),
      ])
      .range([innerHeight(), 5]);

    addCartesian(svg, x, y);

    addLabels(svg);

    addLine(svg, x, y, animated);

    // Adiciona interatividade (tooltip)
  }

  window.addEventListener("resize", function () {
    updateGraphs();
  });
  window.addEventListener("load", function () {
    updateGraphs();
  });
}
