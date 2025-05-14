
import { useState } from "react";
import { useOffers } from "@/hooks/useOffers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ArrowUp,
  ArrowDown,
  BarChart3,
  TrendingUp,
  Calendar,
  ShoppingCart
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import NewOfferForm from "@/components/NewOfferForm";
import { Offer } from "@/types/offer";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { calculateScore } from "@/services/scoreService";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const { offers, loading, pinnedOffers, favoriteOffers, archivedOffers, refreshOffers } = useOffers();
  const isMobile = useIsMobile();

  const handleCreateOfferSuccess = () => {
    setIsCreatingOffer(false);
    refreshOffers();
  };

  const handleNewOfferClick = () => {
    setIsCreatingOffer(true);
  };

  // Filter out archived offers
  const activeOffers = offers.filter(offer => !archivedOffers.has(offer.id));
  const pinnedOffersList = activeOffers.filter(offer => pinnedOffers.has(offer.id));
  const favoriteOffersList = activeOffers.filter(offer => favoriteOffers.has(offer.id) && !pinnedOffers.has(offer.id));

  // Calculate total active ads
  const totalActiveAds = activeOffers.reduce((total, offer) => {
    const latestData = offer.adData[offer.adData.length - 1];
    return latestData ? total + latestData.activeAds : total;
  }, 0);

  // Calculate total page ads
  const totalPageAds = activeOffers.reduce((total, offer) => total + (offer.totalPageAds || 0), 0);

  // Calculate trend (compare with the previous day's total)
  const todayTotal = totalActiveAds;
  let yesterdayTotal = 0;
  activeOffers.forEach(offer => {
    const dataLength = offer.adData.length;
    if (dataLength >= 2) {
      const yesterdayData = offer.adData[dataLength - 2];
      if (yesterdayData) {
        yesterdayTotal += yesterdayData.activeAds;
      }
    }
  });

  const trend = {
    direction: todayTotal > yesterdayTotal ? 'up' : todayTotal < yesterdayTotal ? 'down' : 'stable',
    percentage: yesterdayTotal ? Math.abs((todayTotal - yesterdayTotal) / yesterdayTotal * 100) : 0
  };

  // Get offerings by score
  const scoreDistribution = {
    high: activeOffers.filter(offer => calculateScore(offer).result === 'high').length,
    medium: activeOffers.filter(offer => calculateScore(offer).result === 'medium').length,
    low: activeOffers.filter(offer => calculateScore(offer).result === 'low').length
  };

  // Prepare chart data
  const chartData = (() => {
    // Get all unique dates
    const dates = new Set<string>();
    activeOffers.forEach(offer => {
      offer.adData.forEach(data => {
        dates.add(data.date);
      });
    });

    // Sort dates
    const sortedDates = Array.from(dates).sort();
    
    // Create data points for each date
    return sortedDates.map(date => {
      let totalAds = 0;
      activeOffers.forEach(offer => {
        const adDataForDate = offer.adData.find(d => d.date === date);
        if (adDataForDate) {
          totalAds += adDataForDate.activeAds;
        }
      });
      
      return {
        date,
        totalAds
      };
    });
  })();

  // Format the trends for display
  const formatTrend = (value: number) => {
    return value.toFixed(1);
  };

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handleNewOfferClick}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
          >
            Nova Oferta
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse text-slate-400">Carregando...</div>
        </div>
      ) : (
        <>
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400">Total de Ofertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-3xl font-bold">{activeOffers.length}</div>
                  <BarChart3 size={24} className="text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400">Anúncios Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-3xl font-bold text-emerald-400">
                      {totalActiveAds}
                    </div>
                    {trend.direction !== 'stable' && (
                      <div className={`mt-1 text-xs flex items-center ${
                        trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {trend.direction === 'up' ? (
                          <>
                            <ArrowUp className="mr-1" size={12} />
                            <span>{formatTrend(trend.percentage)}% em relação a ontem</span>
                          </>
                        ) : (
                          <>
                            <ArrowDown className="mr-1" size={12} />
                            <span>{formatTrend(trend.percentage)}% em relação a ontem</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <TrendingUp size={24} className="text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400">Anúncios das Páginas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-3xl font-bold text-blue-400">{totalPageAds}</div>
                  <ShoppingCart size={24} className="text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400">Dias Monitorados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-3xl font-bold text-purple-400">{chartData.length}</div>
                  <Calendar size={24} className="text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Card */}
          <Card className="mb-6 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Evolução dos Anúncios</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="colorAds" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalAds" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorAds)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Score Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-emerald-900/20 border-emerald-700/30">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-slate-300">Score Alto</div>
                    <div className="text-3xl font-bold text-emerald-400 mt-1">{scoreDistribution.high}</div>
                    <div className="text-xs text-slate-400 mt-1">ofertas com performance alta</div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <ArrowUp className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-900/20 border-yellow-700/30">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-slate-300">Score Médio</div>
                    <div className="text-3xl font-bold text-yellow-400 mt-1">{scoreDistribution.medium}</div>
                    <div className="text-xs text-slate-400 mt-1">ofertas com performance média</div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-900/20 border-red-700/30">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-slate-300">Score Baixo</div>
                    <div className="text-3xl font-bold text-red-400 mt-1">{scoreDistribution.low}</div>
                    <div className="text-xs text-slate-400 mt-1">ofertas com performance baixa</div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <ArrowDown className="h-6 w-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Section */}
          <Card className="mb-6 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Acesso Rápido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/offers">
                  <Card className="h-full bg-blue-900/20 border-blue-700/30 hover:bg-blue-900/30 transition-colors">
                    <CardContent className="p-4 flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-3 text-blue-400" />
                      <div className="flex-1">
                        <h3 className="font-medium">Ver Ofertas</h3>
                        <p className="text-xs text-slate-400 mt-1">Acessar a listagem completa de ofertas</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-500" />
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/analytics">
                  <Card className="h-full bg-purple-900/20 border-purple-700/30 hover:bg-purple-900/30 transition-colors">
                    <CardContent className="p-4 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-3 text-purple-400" />
                      <div className="flex-1">
                        <h3 className="font-medium">Análises</h3>
                        <p className="text-xs text-slate-400 mt-1">Visualizar estatísticas detalhadas</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-500" />
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/notes">
                  <Card className="h-full bg-green-900/20 border-green-700/30 hover:bg-green-900/30 transition-colors">
                    <CardContent className="p-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-3 text-green-400" />
                      <div className="flex-1">
                        <h3 className="font-medium">Notas</h3>
                        <p className="text-xs text-slate-400 mt-1">Gerenciar anotações e lembretes</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-500" />
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* New Offer Dialog */}
      <Dialog open={isCreatingOffer} onOpenChange={setIsCreatingOffer}>
        <DialogContent className="sm:max-w-[600px] bg-slate-900 p-0">
          <NewOfferForm 
            onSuccess={handleCreateOfferSuccess}
            onCancel={() => setIsCreatingOffer(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
