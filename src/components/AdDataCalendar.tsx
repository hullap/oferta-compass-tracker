
import { useMemo } from "react";
import { AdData } from "@/types/offer";
import { ArrowDown, ArrowUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdDataCalendarProps {
  adData: AdData[];
}

const AdDataCalendar = ({ adData }: AdDataCalendarProps) => {
  // Sort the ad data by date
  const sortedData = useMemo(() => {
    return [...adData].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }, [adData]);

  // Calculate trend percentages for each day
  const processedData = useMemo(() => {
    // Create a map for easier lookup
    const dataMap = new Map();
    adData.forEach(item => {
      dataMap.set(item.date, item.activeAds);
    });

    // Calculate trends
    return sortedData.map((item, index) => {
      const currentAds = item.activeAds;
      
      // Find the previous day's data
      const currentDate = new Date(item.date);
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateString = prevDate.toISOString().split('T')[0];
      
      const previousAds = dataMap.get(prevDateString);
      
      let trend = 0;
      let trendDirection: "up" | "down" | "stable" = "stable";
      
      if (previousAds !== undefined) {
        if (previousAds === 0) {
          trend = currentAds > 0 ? 100 : 0;
        } else {
          trend = ((currentAds - previousAds) / previousAds) * 100;
        }
        
        if (Math.abs(trend) >= 1) {
          trendDirection = trend > 0 ? "up" : "down";
        }
      }
      
      return {
        ...item,
        trend,
        trendDirection
      };
    });
  }, [sortedData, adData]);

  if (!adData.length) {
    return <div className="text-center py-4 text-muted-foreground">Nenhum registro de anúncios disponível</div>;
  }

  return (
    <div className="max-h-[300px] overflow-y-auto">
      <div className="space-y-2">
        {processedData.map((item, index) => (
          <div 
            key={item.date} 
            className="bg-glass rounded-lg p-3 flex justify-between items-center"
          >
            <div>
              <div className="font-medium">
                {format(new Date(item.date), "dd MMM yyyy", { locale: ptBR })}
              </div>
              <div className="text-xs text-muted-foreground">
                {index === 0 ? "Hoje" : index === 1 ? "Ontem" : `${index} dias atrás`}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-bold">{item.activeAds}</div>
                <div className="text-xs">anúncios</div>
              </div>
              
              {item.trendDirection !== "stable" && item.trend !== undefined && (
                <div 
                  className={`flex items-center ${
                    item.trendDirection === "up" ? "text-score-high" : "text-score-low"
                  }`}
                >
                  {item.trendDirection === "up" ? (
                    <ArrowUp size={18} />
                  ) : (
                    <ArrowDown size={18} />
                  )}
                  <span className="ml-1 font-medium">
                    {Math.abs(item.trend).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdDataCalendar;
