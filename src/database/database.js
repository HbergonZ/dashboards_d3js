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
