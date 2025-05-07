
import { Offer, Score, ScoreResult, TrendInfo } from "@/types/offer";

// Função para calcular score com base na matriz de decisão
export const calculateScore = (offer: Offer): Score => {
  const adData = offer.adData;
  
  // Se não houver dados suficientes, retorna um score neutro
  if (!adData || adData.length < 3) {
    return {
      value: 50,
      label: "Dados insuficientes",
      result: "medium"
    };
  }

  // Calculamos a média de anúncios ativos
  const avgActiveAds = adData.reduce((sum, data) => sum + data.activeAds, 0) / adData.length;
  
  // Verificamos a tendência dos anúncios (crescente, estável, decrescente)
  const firstHalf = adData.slice(0, Math.floor(adData.length / 2));
  const secondHalf = adData.slice(Math.floor(adData.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, data) => sum + data.activeAds, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, data) => sum + data.activeAds, 0) / secondHalf.length;
  
  const trend = secondHalfAvg - firstHalfAvg;
  
  // Consistência (desvio padrão)
  const consistencyFactor = calculateConsistency(adData.map(d => d.activeAds));
  
  // Tempo de atividade (dias)
  const daysActive = adData.length;
  
  // Calculamos o score final (0-100)
  let score = Math.min(100, Math.max(0,
    // Base score from average active ads (0-50 points)
    Math.min(50, avgActiveAds * 2.5) + 
    // Trend bonus/penalty (-20 to +20 points)
    (trend > 0 ? Math.min(20, trend * 2) : Math.max(-20, trend * 2)) +
    // Consistency bonus (0-15 points)
    (15 * (1 - consistencyFactor)) +
    // Days active bonus (0-15 points)
    Math.min(15, daysActive * 0.5)
  ));
  
  // Arredondamos para um número inteiro
  score = Math.round(score);
  
  // Determinamos o resultado com base no score
  let result: ScoreResult;
  let label: string;
  
  if (score >= 70) {
    result = "high";
    label = "Vale a pena testar";
  } else if (score >= 40) {
    result = "medium";
    label = "Talvez";
  } else {
    result = "low";
    label = "Não vale a pena";
  }
  
  return { value: score, label, result };
};

// Função para calcular a tendência da oferta (para exibição no card)
export const calculateTrend = (offer: Offer): TrendInfo => {
  const adData = offer.adData;
  
  // Se não houver dados suficientes, retorna uma tendência estável
  if (!adData || adData.length < 2) {
    return { direction: "stable", percentage: 0 };
  }
  
  // Ordena os dados por data para garantir a sequência correta
  const sortedData = [...adData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Pega os dois dados mais recentes
  const latest = sortedData[sortedData.length - 1].activeAds;
  const previous = sortedData[sortedData.length - 2].activeAds;
  
  // Calcula a diferença percentual
  if (previous === 0) {
    return latest > 0 ? { direction: "up", percentage: 100 } : { direction: "stable", percentage: 0 };
  }
  
  const percentChange = ((latest - previous) / previous) * 100;
  
  // Define a direção com base na variação percentual
  let direction: "up" | "down" | "stable" = "stable";
  
  if (Math.abs(percentChange) >= 5) { // Considera uma variação significativa se for >= 5%
    direction = percentChange > 0 ? "up" : "down";
  }
  
  return {
    direction,
    percentage: percentChange
  };
};

// Calcula o índice de consistência (0-1) onde menor é melhor
const calculateConsistency = (values: number[]): number => {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Normalização para um valor entre 0-1
  return Math.min(1, stdDev / (mean || 1));
};

// Formatar a porcentagem para exibição
export const formatScorePercent = (score: number): string => {
  return `${score}%`;
};
