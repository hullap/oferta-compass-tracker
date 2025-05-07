
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdData } from "@/types/offer";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface AdTrendChartProps {
  data: AdData[];
  title?: string;
}

const AdTrendChart = ({ data, title = "Tendência de Anúncios Ativos" }: AdTrendChartProps) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      ads: item.activeAds
    }));
  }, [data]);
  
  const maxValue = useMemo(() => {
    const max = Math.max(...data.map(item => item.activeAds));
    return Math.ceil(max * 1.2); // 20% acima do valor máximo
  }, [data]);

  return (
    <Card className="border border-gray-800 card-gradient h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px]">
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
                  color: 'white'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="ads" 
                name="Anúncios Ativos" 
                stroke="#4F46E5" 
                activeDot={{ r: 6, fill: '#7E22CE' }} 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdTrendChart;
