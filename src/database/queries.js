// Importar a função fetchData que busca os dados da API
import { fetchData } from "./database.js";

// Função para obter o Top 10 por um critério específico
export function getTop10ByKey(data, key) {
  if (!Array.isArray(data)) {
    console.error("getTop10ByKey espera um array, mas recebeu:", data);
    return [];
  }
  return data
    .sort((a, b) => b[key] - a[key]) // Ordenar do maior para o menor
    .slice(0, 10); // Selecionar os 10 primeiros
}

// Função para trazer todos os dados
export async function fullDataframe() {
  const data = await fetchData();
  return data;
}

// Outras funções
