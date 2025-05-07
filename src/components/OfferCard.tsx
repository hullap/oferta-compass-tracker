
import { calculateScore, calculateTrend } from "@/services/scoreService";
import { Offer } from "@/types/offer";
import { Card, CardContent, CardHeader } from "./ui/card";
import ScoreBadge from "./ScoreBadge";
import { 
  ChartLine, 
  Calendar, 
  ArrowUp, 
  ArrowDown,
  Star,
  Pin,
  Archive,
  Trash2,
  MoreVertical
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface OfferCardProps {
  offer: Offer;
  onClick: (offer: Offer) => void;
  onPin?: (offer: Offer) => void;
  onFavorite?: (offer: Offer) => void;
  onArchive?: (offer: Offer) => void;
  onDelete?: (offer: Offer) => void;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
}

const OfferCard = ({ 
  offer, 
  onClick, 
  onPin,
  onFavorite,
  onArchive,
  onDelete,
  isPinned = false,
  isFavorite = false,
  isArchived = false
}: OfferCardProps) => {
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
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md card-gradient border border-gray-800",
        isPinned && "border-primary border-2",
        isArchived && "opacity-60"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <div className="flex-1 pr-2">
          <h3 className="font-bold flex items-center gap-1.5">
            {isPinned && <Pin size={14} className="text-primary" />}
            {isFavorite && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
            {offer.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{offer.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <ScoreBadge score={score} size="sm" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onPin && onPin(offer);
              }}>
                <Pin className="mr-2 h-4 w-4" />
                {isPinned ? "Desafixar" : "Fixar"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onFavorite && onFavorite(offer);
              }}>
                <Star className="mr-2 h-4 w-4" />
                {isFavorite ? "Remover favorito" : "Favoritar"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onArchive && onArchive(offer);
              }}>
                <Archive className="mr-2 h-4 w-4" />
                {isArchived ? "Desarquivar" : "Arquivar"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(offer);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
