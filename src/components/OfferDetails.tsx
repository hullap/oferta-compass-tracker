
import { useMemo } from "react";
import { calculateScore } from "@/services/scoreService";
import { Offer } from "@/types/offer";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import AdDataForm from "./AdDataForm";
import AdTrendChart from "./AdTrendChart";
import ScoreBadge from "./ScoreBadge";
import { ChartBar, Calendar, ArrowUp, ArrowDown } from "lucide-react";

interface OfferDetailsProps {
  offer: Offer;
  onBack: () => void;
  onUpdateAdData: (offerId: string, activeAds: number, date: string) => void;
}

const OfferDetails = ({ offer, onBack, onUpdateAdData }: OfferDetailsProps) => {
  const score = useMemo(() => calculateScore(offer), [offer]);
  
  const latestAds = offer.adData[offer.adData.length - 1]?.activeAds || 0;
  const previousAds = offer.adData[offer.adData.length - 2]?.activeAds || 0;
  const adsDifference = latestAds - previousAds;
  const adsTrend = adsDifference !== 0 ? (adsDifference > 0 ? 'up' : 'down') : 'stable';
  
  // Cálculo de estatísticas
  const stats = useMemo(() => {
    if (!offer.adData.length) return { avg: 0, max: 0, min: 0 };
    
    const adsValues = offer.adData.map(d => d.activeAds);
    const avg = adsValues.reduce((a, b) => a + b, 0) / adsValues.length;
    const max = Math.max(...adsValues);
    const min = Math.min(...adsValues);
    
    return { avg, max, min };
  }, [offer.adData]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} className="border-gray-700">
          Voltar
        </Button>
        <h2 className="text-xl font-bold">{offer.name}</h2>
        <div className="w-[70px]" /> {/* Espaçador para centralizar o título */}
      </div>
      
      <p className="text-muted-foreground">{offer.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-800 card-gradient col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Desempenho</span>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar size={14} className="mr-1" />
                {offer.adData.length} dias de dados
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <AdTrendChart data={offer.adData} />
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-glass rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Média</div>
                <div className="font-bold">{stats.avg.toFixed(1)}</div>
              </div>
              <div className="bg-glass rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Máximo</div>
                <div className="font-bold">{stats.max}</div>
              </div>
              <div className="bg-glass rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Mínimo</div>
                <div className="font-bold">{stats.min}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card className="border border-gray-800 card-gradient">
            <CardHeader>
              <CardTitle className="text-base">Análise da Oferta</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-0">
              <ScoreBadge score={score} size="lg" className="mb-4" />
              
              <div className="w-full bg-glass rounded-lg p-3 flex justify-between items-center">
                <div className="flex items-center">
                  <ChartBar size={16} className="mr-2 text-muted-foreground" />
                  <span>Anúncios Hoje</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold">{latestAds}</span>
                  {adsTrend !== 'stable' && (
                    <span className={`ml-2 ${adsTrend === 'up' ? 'text-score-high' : 'text-score-low'}`}>
                      {adsTrend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <AdDataForm 
            offerId={offer.id} 
            offerName={offer.name}
            onSave={onUpdateAdData} 
          />
        </div>
      </div>
    </div>
  );
};

export default OfferDetails;
