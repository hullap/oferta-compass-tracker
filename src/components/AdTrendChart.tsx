
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { AdData } from "@/types/offer";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface AdTrendChartProps {
  data: AdData[];
  totalPageAds?: number;
  title?: string;
}

const AdTrendChart = ({ data, totalPageAds, title = "Tendência de Anúncios Ativos" }: AdTrendChartProps) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      ads: item.activeAds,
      totalAds: totalPageAds || 0
    }));
  }, [data, totalPageAds]);
  
  const maxValue = useMemo(() => {
    const maxAds = Math.max(...data.map(item => item.activeAds));
    const maxTotalAds = totalPageAds || 0;
    return Math.ceil(Math.max(maxAds, maxTotalAds) * 1.2); // 20% acima do valor máximo
  }, [data, totalPageAds]);

  const chartConfig = {
    offerAds: {
      label: "Anúncios da Oferta",
      theme: {
        light: "#4F46E5",
        dark: "#4F46E5"
      }
    },
    totalAds: {
      label: "Anúncios Totais da Página",
      theme: {
        light: "#10B981",
        dark: "#10B981"
      }
    }
  };

  return (
    <Card className="border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }} 
                stroke="rgba(255,255,255,0.2)"
              />
              <YAxis 
                domain={[0, maxValue]} 
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }} 
                stroke="rgba(255,255,255,0.2)"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 17, 17, 0.9)', 
                  borderColor: 'rgba(255,255,255,0.1)',
                  fontSize: '12px',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }} 
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="ads" 
                name="Anúncios da Oferta" 
                stroke="#4F46E5" 
                activeDot={{ r: 6, fill: '#7E22CE' }} 
                strokeWidth={2} 
                dot={{ r: 3 }}
              />
              {totalPageAds && totalPageAds > 0 && (
                <Line 
                  type="monotone" 
                  dataKey="totalAds" 
                  name="Anúncios Totais da Página" 
                  stroke="#10B981" 
                  activeDot={{ r: 6, fill: '#059669' }} 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdTrendChart;
