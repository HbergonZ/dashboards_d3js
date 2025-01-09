//--------------------------------------------------------------------
// CONEXÃO COM API E FORMATAÇÃO DOS DADOS
//--------------------------------------------------------------------
// Função para buscar os dados da API REST Countries
export async function fetchData() {
  const url = "https://restcountries.com/v3.1/all"; // URL da API REST Countries
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao buscar dados da API.");
    const data = await response.json();

    return data.map((country) => ({
      name: country.name.common,
      population: country.population,
      area: country.area,
      region: country.region,
      languages: Object.values(country.languages || {}),
    }));
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    return [];
  }
}

// Função para buscar os dados do arquivo JSON local
export async function fetchLocalData() {
  const filePath = "../bases_teste/data_records.json"; // Caminho do arquivo JSON
  try {
    const response = await fetch(filePath); // Assumindo que o arquivo esteja acessível via fetch
    if (!response.ok)
      throw new Error("Erro ao carregar dados do arquivo JSON.");
    const data = await response.json();

    // Processando os dados para o formato adequado para o gráfico
    return data.map((item) => ({
      date: new Date(item.date), // Convertendo a string de data para um objeto Date
      quantity: item.quantity, // Mantendo a quantidade como está
    }));
  } catch (error) {
    console.error("Erro ao carregar dados locais:", error);
    return [];
  }
}
