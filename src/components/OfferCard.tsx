
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
  MoreVertical,
  MessageSquare,
  ExternalLink,
  Clock,
  RefreshCcw
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
import { Badge } from "./ui/badge";

interface OfferCardProps {
  offer: Offer;
  onClick: (offer: Offer) => void;
  onPin?: (offer: Offer) => void;
  onFavorite?: (offer: Offer) => void;
  onArchive?: (offer: Offer) => void;
  onDelete?: (offer: Offer) => void;
  onRefresh?: (offer: Offer) => void;
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
  onRefresh,
  isPinned = false,
  isFavorite = false,
  isArchived = false
}: OfferCardProps) => {
  const score = useMemo(() => calculateScore(offer), [offer]);
  const trend = useMemo(() => calculateTrend(offer), [offer]);
  
  const lastUpdate = new Date(offer.updatedAt).toLocaleString('pt-BR');
  const dayCount = offer.adData.length;
  const latestAds = offer.adData[offer.adData.length - 1]?.activeAds || 0;
  
  // Determina a cor da tendência
  const trendColor = trend.direction === 'up' 
    ? 'text-emerald-400' 
    : trend.direction === 'down' 
      ? 'text-red-400' 
      : 'text-slate-400';

  // Check if there are any observations
  const hasObservations = useMemo(() => {
    return offer.adData.some(data => data.observation && data.observation.trim() !== "");
  }, [offer.adData]);
  
  // Open Facebook Ad Library URL in new tab
  const openAdLibraryUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (offer.facebookAdLibraryUrl) {
      window.open(offer.facebookAdLibraryUrl, '_blank');
    }
  };
  
  // Define a classe de borda baseada no score (para priorização visual)
  const scoreBorderClass = score.result === 'high' 
    ? 'border-emerald-500/50 shadow-emerald-900/20 shadow-md hover:border-emerald-400 hover:shadow-emerald-800/40' 
    : score.result === 'low'
    ? 'border-red-500/30 shadow-red-900/10'
    : 'border-slate-700 hover:border-slate-600';
  
  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRefresh && onRefresh(offer);
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 border group",
        isPinned && "border-blue-500 shadow-blue-900/20 shadow-md",
        isArchived && "opacity-60",
        scoreBorderClass,
        "hover:transform hover:scale-[1.02] hover:shadow-xl"
      )}
      onClick={() => onClick(offer)}
    >
      <CardHeader className="flex flex-row items-start justify-between p-4 pb-2 border-b border-slate-700/40">
        <div className="flex-1 pr-6 max-w-[75%]">
          <h3 className="font-bold flex items-center gap-1.5 text-slate-100 group-hover:text-white truncate">
            {isPinned && <Pin size={14} className="text-blue-400 flex-shrink-0" />}
            {isFavorite && <Star size={14} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />}
            <span className="truncate">{offer.name}</span>
          </h3>
          <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-1 mt-0.5">{offer.description}</p>
          {offer.facebookAdLibraryUrl && (
            <div 
              className="text-xs text-blue-400 flex items-center gap-1 mt-1.5 cursor-pointer hover:text-blue-300 hover:underline transition-colors"
              onClick={openAdLibraryUrl}
            >
              <ExternalLink size={12} />
              <span className="truncate">Biblioteca de Anúncios</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 absolute right-10 top-4">
          <ScoreBadge score={score} size="sm" />
        </div>
        <div className="absolute right-2 top-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-800 rounded-full">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 border-slate-700 bg-slate-900">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onRefresh && onRefresh(offer);
              }}
              className="hover:bg-slate-800 focus:bg-slate-800"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Atualizar dados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onPin && onPin(offer);
              }}
              className="hover:bg-slate-800 focus:bg-slate-800"
              >
                <Pin className="mr-2 h-4 w-4" />
                {isPinned ? "Desafixar" : "Fixar"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onFavorite && onFavorite(offer);
              }}
              className="hover:bg-slate-800 focus:bg-slate-800"
              >
                <Star className="mr-2 h-4 w-4" />
                {isFavorite ? "Remover favorito" : "Favoritar"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onArchive && onArchive(offer);
              }}
              className="hover:bg-slate-800 focus:bg-slate-800"
              >
                <Archive className="mr-2 h-4 w-4" />
                {isArchived ? "Desarquivar" : "Arquivar"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-400 hover:text-red-300 hover:bg-slate-800 focus:bg-slate-800" 
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
      <CardContent className="p-4 pt-3 relative">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 absolute top-3 right-3 bg-slate-800/70 hover:bg-slate-700 rounded-full z-10"
          onClick={handleRefresh}
          title="Atualizar dados"
        >
          <RefreshCcw size={14} />
        </Button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 mb-3">
          <div className="flex justify-between items-center text-xs bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
            <div className="font-medium text-slate-300">Anúncios da oferta</div>
            <div className="flex items-center font-bold text-white">
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
          
          {offer.totalPageAds !== undefined && offer.totalPageAds > 0 && (
            <div className="flex justify-between items-center text-xs bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
              <div className="font-medium text-slate-300">Anúncios da página</div>
              <div className="font-bold text-emerald-400">{offer.totalPageAds}</div>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1.5 my-3 min-h-[26px]">
          {(offer.keywords || []).slice(0, 3).map((keyword, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className="text-xs py-0.5 bg-blue-900/20 text-blue-300 border-blue-700/50 hover:bg-blue-800/30"
            >
              {keyword}
            </Badge>
          ))}
          {(offer.keywords || []).length > 3 && (
            <Badge 
              variant="outline" 
              className="text-xs py-0.5 bg-purple-900/20 text-purple-300 border-purple-700/50"
            >
              +{(offer.keywords || []).length - 3}
            </Badge>
          )}
        </div>
        
        <div className="flex justify-between items-center text-xs text-slate-400 mt-3">
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <ChartLine size={14} className="opacity-70" />
              <span>{dayCount} dias</span>
            </div>
            {hasObservations && (
              <div className="flex items-center gap-1">
                <MessageSquare size={14} className="opacity-70" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} className="opacity-70" />
            <span>{lastUpdate}</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4 border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all hover:text-white bg-gradient-to-br from-slate-800 to-slate-900" 
        >
          Ver detalhes
        </Button>
      </CardContent>
    </Card>
  );
};

export default OfferCard;
