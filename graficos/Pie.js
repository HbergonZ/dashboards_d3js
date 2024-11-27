export function createPieChart(data) {
  // Contar quantos valores estão acima e abaixo de 75
  let above75 = 0;
  let below75 = 0;

  // Contagem de valores acima e abaixo de 75 com base nos dados filtrados
  data.forEach((d) => {
    if (d.value > 75) {
      above75++;
    } else {
      below75++;
    }
  });

  // Dados para o gráfico de pizza
  const pieData = [
    { category: "Acima de 75", value: above75 },
    { category: "Abaixo de 75", value: below75 },
  ];

  const width = 400;
  const height = 300;
  const outerRadius = Math.min(width, height) / 2 - 10;
  const innerRadius = outerRadius * 0.65;
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Criar o SVG para o gráfico
  const svg = d3
    .select("#pie-chart-container")
    .html("") // Limpa o conteúdo do gráfico antes de desenhá-lo
    .append("svg")
    .attr("width", width + 200) // Adiciona largura extra para a legenda
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Gerador de arco para o gráfico de pizza
  const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

  // Gerador de segmentos para o gráfico de pizza
  const pie = d3.pie().value((d) => d.value);

  // Criar os segmentos do gráfico de pizza
  const g = svg
    .selectAll(".arc")
    .data(pie(pieData))
    .enter()
    .append("g")
    .attr("class", "arc");

  // Adicionar a cor aos segmentos
  const path = g
    .append("path")
    .attr("d", arc)
    .style("fill", (d, i) => color(i))
    .each(function (d) {
      this._current = d; // Armazenar o valor inicial de ângulos
    });

  // Criar o elemento do tooltip
  const tooltip = d3
    .select("body") // Pode ajustar para um contêiner específico
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#fff")
    .style("border", "1px solid #ddd")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("box-shadow", "0 2px 5px rgba(0,0,0,0.15)");

  // Função de transição para o gráfico
  function arcTween(a) {
    const i = d3.interpolate(this._current, a);
    this._current = i(0);
    return (t) => arc(i(t));
  }

  // Função para alterar os valores do gráfico com transição
  function change(value) {
    pie.value((d) => d[value]); // Alterar a função de valor com base no filtro
    const newData = pie(pieData); // Calcular os novos dados com o filtro aplicado

    path
      .data(newData) // Atualiza os dados do gráfico
      .transition()
      .duration(750) // Duração da transição
      .attrTween("d", arcTween); // Aplica a transição aos segmentos
  }

  // Adicionar o texto no gráfico
  g.append("text")
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .attr("dy", ".35em")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text((d) => `${d.data.category}: ${d.data.value}`);

  // Adicionar eventos de tooltip
  path
    .on("mouseover", function (event, d) {
      tooltip
        .style("visibility", "visible")
        .text(`${d.data.category}: ${d.data.value}`); // Texto do tooltip
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", `${event.pageY + 10}px`) // Ajustar a posição
        .style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden"); // Esconder o tooltip
    });

  // Adicionar o título
  svg
    .append("text")
    .attr("x", 0)
    .attr("y", -outerRadius - 20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Distribuição dos Valores");

  // Adicionar a legenda
  const legendWidth = 150;
  const legendHeight = 50;
  const legend = svg
    .append("g")
    .attr("transform", `translate(${outerRadius + 50}, ${-height / 2})`); // Ajustar a posição da legenda

  const legendItems = legend
    .selectAll(".legend-item")
    .data(pieData)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

  // Adicionar círculos coloridos para cada categoria na legenda
  legendItems
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 10)
    .attr("r", 6)
    .style("fill", (d, i) => color(i));

  // Adicionar texto à legenda
  legendItems
    .append("text")
    .attr("x", 15)
    .attr("y", 10)
    .attr("dy", ".35em")
    .style("font-size", "14px")
    .text((d) => d.category);

  // Retornar a função change para ser usada ao aplicar o filtro
  return {
    change,
  };
}
