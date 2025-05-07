
import { calculateScore, calculateTrend } from "@/services/scoreService";
import { Offer } from "@/types/offer";
import { Card, CardContent, CardHeader } from "./ui/card";
import ScoreBadge from "./ScoreBadge";
import { ChartLine, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { useMemo } from "react";
import { Button } from "./ui/button";

interface OfferCardProps {
  offer: Offer;
  onClick: (offer: Offer) => void;
}

const OfferCard = ({ offer, onClick }: OfferCardProps) => {
  const score = useMemo(() => calculateScore(offer), [offer]);
  const trend = useMemo(() => calculateTrend(offer), [offer]);
  
  const lastUpdate = new Date(offer.updatedAt).toLocaleDateString('pt-BR');
  const dayCount = offer.adData.length;
  const latestAds = offer.adData[offer.adData.length - 1]?.activeAds || 0;
  
  // Determina a cor da tendência
  const trendColor = trend.direction === 'up' 
    ? 'text-score-high' 
    : trend.direction === 'down' 
      ? 'text-score-low' 
      : 'text-muted-foreground';
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md card-gradient border border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <div>
          <h3 className="font-bold">{offer.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{offer.description}</p>
        </div>
        <ScoreBadge score={score} size="sm" />
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex justify-between items-center text-xs mt-4 mb-3 bg-glass rounded-lg p-2.5">
          <div className="font-medium">Anúncios ativos</div>
          <div className="flex items-center font-bold">
            {latestAds}
            {trend.direction !== 'stable' && (
              <span className={`ml-1.5 ${trendColor} flex items-center`}>
                {trend.direction === 'up' ? (
                  <>
                    <ArrowUp size={14} />
                    <span className="ml-0.5">{trend.percentage.toFixed(0)}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDown size={14} />
                    <span className="ml-0.5">{Math.abs(trend.percentage).toFixed(0)}%</span>
                  </>
                )}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-3">
          <div className="flex items-center gap-1">
            <ChartLine size={14} className="opacity-70" />
            <span>{dayCount} dias de dados</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} className="opacity-70" />
            <span>Atualizado: {lastUpdate}</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4 border-gray-700" 
          onClick={() => onClick(offer)}
        >
          Ver detalhes
        </Button>
      </CardContent>
    </Card>
  );
};

export default OfferCard;
