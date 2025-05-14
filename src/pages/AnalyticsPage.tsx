
import { useState } from "react";
import { useOffers } from "@/hooks/useOffers";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { 
  ArrowUp, 
  ArrowDown, 
  ChevronRight,
  Search,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScoreBadge from "@/components/ScoreBadge";
import { calculateScore, calculateTrend } from "@/services/scoreService";
import { Offer } from "@/types/offer";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalyticsPage = () => {
  const { offers, loading, pinnedOffers, favoriteOffers } = useOffers();
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("all");
  
  // Filter offers based on search term
  const filteredOffers = offers.filter(offer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      offer.name.toLowerCase().includes(searchLower) || 
      offer.description.toLowerCase().includes(searchLower) ||
      offer.keywords?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  // Calculate statistics
  const totalOffers = filteredOffers.length;
  const totalActiveAds = filteredOffers.reduce((sum, offer) => {
    const latestData = offer.adData[offer.adData.length - 1];
    return latestData ? sum + latestData.activeAds : sum;
  }, 0);

  const totalPageAds = filteredOffers.reduce((sum, offer) => sum + (offer.totalPageAds || 0), 0);
  
  // Prepare data for charts
  const adsByOfferData = filteredOffers.map(offer => {
    const latestData = offer.adData[offer.adData.length - 1];
    const trend = calculateTrend(offer);
    const change = trend.direction === 'up' ? trend.percentage : 
                 trend.direction === 'down' ? -trend.percentage : 0;
    
    return {
      name: offer.name,
      activeAds: latestData?.activeAds || 0,
      totalPageAds: offer.totalPageAds || 0,
      change
    };
  }).sort((a, b) => b.activeAds - a.activeAds);
  
  // Prepare historical data for line chart
  const historicalData = useMemo(() => {
    if (!filteredOffers.length) return [];
    
    // Get all unique dates across all offers
    const allDates = new Set<string>();
    filteredOffers.forEach(offer => {
      offer.adData.forEach(data => {
        allDates.add(data.date);
      });
    });
    
    // Sort dates
    const sortedDates = Array.from(allDates).sort();
    
    // Create data points for each date
    return sortedDates.map(date => {
      const dataPoint: Record<string, any> = { date };
      
      // Add ad count for each offer on this date
      filteredOffers.forEach(offer => {
        const adDataForDate = offer.adData.find(d => d.date === date);
        if (adDataForDate) {
          const safeName = offer.name.replace(/[^a-zA-Z0-9]/g, '_');
          dataPoint[safeName] = adDataForDate.activeAds;
        }
      });
      
      return dataPoint;
    });
  }, [filteredOffers]);

  // Scores distribution
  const scoresDistribution = useMemo(() => {
    const scores = {
      high: 0,
      medium: 0,
      low: 0
    };
    
    filteredOffers.forEach(offer => {
      const score = calculateScore(offer);
      scores[score.result as keyof typeof scores]++;
    });
    
    return [
      { name: "Alta", value: scores.high, color: "#10B981" },
      { name: "Média", value: scores.medium, color: "#F59E0B" },
      { name: "Baixa", value: scores.low, color: "#EF4444" }
    ];
  }, [filteredOffers]);

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <h1 className="text-2xl font-bold">Análises</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => {}}
            variant="outline"
            className="border-slate-700 bg-slate-800/50"
          >
            Exportar Relatório
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <Input 
            placeholder="Filtrar ofertas..." 
            className="pl-10 bg-slate-800/50 border-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="all">Todo o Período</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse text-slate-400">Carregando dados...</div>
        </div>
      ) : filteredOffers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total de Ofertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalOffers}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Anúncios Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-400">{totalActiveAds}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Anúncios das Páginas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">{totalPageAds}</div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="overview" className="mb-6">
            <TabsList className="bg-slate-800">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="comparison">Comparação</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2 bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle>Anúncios por Oferta</CardTitle>
                    <CardDescription>Quantidade atual de anúncios ativos por oferta</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AspectRatio ratio={16/9} className="bg-slate-900/50 rounded-md p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={adsByOfferData.slice(0, 10)} layout="vertical">
                          <XAxis type="number" />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={120} 
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #334155',
                              borderRadius: '8px'
                            }} 
                          />
                          <Legend />
                          <Bar dataKey="activeAds" name="Anúncios Ativos" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </AspectRatio>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle>Distribuição de Scores</CardTitle>
                    <CardDescription>Qualidade das ofertas monitoradas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AspectRatio ratio={16/9} className="bg-slate-900/50 rounded-md p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={scoresDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={40}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {scoresDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #334155',
                              borderRadius: '8px'
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </AspectRatio>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Evolução dos Anúncios</CardTitle>
                  <CardDescription>Histórico de anúncios ativos ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <AspectRatio ratio={21/9} className="bg-slate-900/50 rounded-md p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #334155',
                            borderRadius: '8px'
                          }} 
                        />
                        <Legend />
                        {filteredOffers.slice(0, 5).map((offer, index) => (
                          <Line 
                            key={offer.id}
                            type="monotone" 
                            dataKey={offer.name.replace(/[^a-zA-Z0-9]/g, '_')}
                            name={offer.name}
                            stroke={COLORS[index % COLORS.length]}
                            activeDot={{ r: 8 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </AspectRatio>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comparison" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOffers.slice(0, 6).map(offer => {
                  const score = calculateScore(offer);
                  const trend = calculateTrend(offer);
                  const latestAdCount = offer.adData[offer.adData.length - 1]?.activeAds || 0;
                  
                  return (
                    <Card key={offer.id} className="bg-slate-800/50 border-slate-700">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center">
                              {offer.name}
                              {pinnedOffers.has(offer.id) && (
                                <Badge variant="outline" className="ml-2 bg-blue-900/20 text-blue-300 border-blue-700/50">
                                  Fixada
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="mt-1 line-clamp-1">
                              {offer.keywords?.map((tag, i) => (
                                <span key={i} className="mr-1 text-xs">
                                  #{tag}{i < (offer.keywords?.length || 0) - 1 ? ' ' : ''}
                                </span>
                              ))}
                            </CardDescription>
                          </div>
                          <ScoreBadge score={score} size="sm" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-slate-400">Anúncios Ativos</div>
                            <div className="text-2xl font-bold flex items-center">
                              {latestAdCount}
                              {trend.direction !== 'stable' && (
                                <span className={`ml-2 text-sm ${
                                  trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                  {trend.direction === 'up' ? (
                                    <div className="flex items-center">
                                      <ArrowUp size={14} />
                                      <span className="ml-1">{trend.percentage.toFixed(0)}%</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <ArrowDown size={14} />
                                      <span className="ml-1">{Math.abs(trend.percentage).toFixed(0)}%</span>
                                    </div>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-400">Página</div>
                            <div className="text-2xl font-bold text-blue-400">{offer.totalPageAds || 0}</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 h-[100px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={offer.adData.map(d => ({
                              date: d.date,
                              activeAds: d.activeAds
                            }))}>
                              <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1e293b', 
                                  border: '1px solid #334155',
                                  borderRadius: '8px'
                                }}
                                formatter={(value) => [`${value} anúncios`, 'Ativos']}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="activeAds" 
                                stroke="#3b82f6" 
                                strokeWidth={2} 
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="w-full mt-4 border-slate-700 hover:bg-slate-700"
                          onClick={() => {}}
                        >
                          Ver Detalhes
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
          
        </>
      ) : (
        <div className="text-center py-12 bg-slate-800/20 rounded-lg border border-slate-700/30">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-xl font-medium text-slate-300 mb-1">Nenhuma oferta encontrada</h3>
          <p className="text-slate-400 mb-4">
            {searchTerm 
              ? "Tente usar termos diferentes na busca"
              : "Adicione ofertas para visualizar análises"}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
