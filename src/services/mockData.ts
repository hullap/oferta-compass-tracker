
import { Offer } from "@/types/offer";

export const generateMockOffers = (): Offer[] => {
  const currentDate = new Date();
  
  const offers: Offer[] = [
    {
      id: "offer-1",
      name: "Curso Marketing Digital",
      description: "Curso completo de marketing digital para iniciantes",
      adData: generateAdDataTrend(30, 10, 25, 0.5),
      createdAt: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: currentDate.toISOString()
    },
    {
      id: "offer-2",
      name: "E-book Finanças Pessoais",
      description: "Guia completo para organizar suas finanças",
      adData: generateAdDataTrend(20, 18, 5, -0.2),
      createdAt: new Date(currentDate.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: currentDate.toISOString()
    },
    {
      id: "offer-3",
      name: "Mentoria de Vendas",
      description: "Programa de mentoria para aumentar vendas",
      adData: generateAdDataTrend(15, 5, 8, 0.1),
      createdAt: new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: currentDate.toISOString()
    },
    {
      id: "offer-4",
      name: "Treinamento LinkedIn",
      description: "Como usar o LinkedIn para gerar leads",
      adData: generateAdDataTrend(10, 2, 15, 1.2),
      createdAt: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: currentDate.toISOString()
    },
    {
      id: "offer-5",
      name: "Assinatura Software",
      description: "Software para gestão de tráfego pago",
      adData: generateAdDataTrend(5, 12, 9, -0.8),
      createdAt: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: currentDate.toISOString()
    },
  ];
  
  return offers;
};

// Gera dados de anúncios com uma tendência específica
const generateAdDataTrend = (days: number, startValue: number, randomFactor: number, trendFactor: number) => {
  const currentDate = new Date();
  const adData = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    // Calcular tendência linear
    const trend = startValue + trendFactor * (days - i);
    
    // Adicionar aleatoriedade
    const random = Math.floor(Math.random() * randomFactor) - randomFactor / 2;
    
    // Garantir valor mínimo de 0
    const activeAds = Math.max(0, Math.round(trend + random));
    
    adData.push({
      date: date.toISOString().split('T')[0],
      activeAds
    });
  }
  
  return adData;
};
