
import { useMemo, useState } from "react";
import { calculateScore } from "@/services/scoreService";
import { Offer, AdData } from "@/types/offer";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import AdDataForm from "./AdDataForm";
import AdTrendChart from "./AdTrendChart";
import ScoreBadge from "./ScoreBadge";
import { ChartBar, Calendar, ArrowUp, ArrowDown, MessageSquare, Tag, Link, ExternalLink, Edit2, ListChecks } from "lucide-react";
import AdDataCalendar from "./AdDataCalendar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import EditOfferForm from "./EditOfferForm";
import AdDataEntryActions from "./AdDataEntryActions";
import { Textarea } from "./ui/textarea";
import TaskList from "./TaskList";
import { useTasks } from "@/hooks/useTasks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OfferDetailsProps {
  offer: Offer;
  onBack: () => void;
  onUpdateOfferDetails?: (offerId: string, name: string, description: string) => Promise<void>;
  onUpdateAdData: (offerId: string, activeAds: number, date: string, observation: string, time?: string) => void;
  onUpdateTotalPageAds?: (offerId: string, totalPageAds: number) => void;
  onUpdateKeywords?: (offerId: string, keywords: string[]) => void;
  onUpdateFacebookAdLibraryUrl?: (offerId: string, url: string) => void;
  onDeleteAdData?: (offerId: string, date: string) => void;
}

const OfferDetails = ({ 
  offer, 
  onBack,
  onUpdateOfferDetails,
  onUpdateAdData,
  onUpdateTotalPageAds,
  onUpdateKeywords,
  onUpdateFacebookAdLibraryUrl,
  onDeleteAdData
}: OfferDetailsProps) => {
  const [editingObservation, setEditingObservation] = useState<{index: number, value: string} | null>(null);
  const [totalPageAds, setTotalPageAds] = useState(offer.totalPageAds?.toString() || "");
  const [newKeyword, setNewKeyword] = useState("");
  const [keywords, setKeywords] = useState<string[]>(offer.keywords || []);
  const [facebookAdLibraryUrl, setFacebookAdLibraryUrl] = useState(offer.facebookAdLibraryUrl || "");
  const [activeTab, setActiveTab] = useState<"analytics" | "tasks">("analytics");
  const [totalPageAdsHistory, setTotalPageAdsHistory] = useState<{date: string, count: number}[]>(
    // Initialize with current totalPageAds if available
    offer.totalPageAds ? [{date: new Date().toISOString().split('T')[0], count: offer.totalPageAds}] : []
  );
  
  // Use our tasks hook to manage tasks for this offer
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    reorderTasks,
    loading: tasksLoading 
  } = useTasks(offer.id);
  
  const score = useMemo(() => calculateScore(offer), [offer]);
  
  const latestAds = offer.adData[offer.adData.length - 1]?.activeAds || 0;
  const previousAds = offer.adData[offer.adData.length - 2]?.activeAds || 0;
  const adsDifference = latestAds - previousAds;
  const adsTrend = adsDifference !== 0 ? (adsDifference > 0 ? 'up' : 'down') : 'stable';
  
  // Calculate statistics
  const stats = useMemo(() => {
    if (!offer.adData.length) return { avg: 0, max: 0, min: 0 };
    
    const adsValues = offer.adData.map(d => d.activeAds);
    const avg = adsValues.reduce((a, b) => a + b, 0) / adsValues.length;
    const max = Math.max(...adsValues);
    const min = Math.min(...adsValues);
    
    return { avg, max, min };
  }, [offer.adData]);
  
  // Save observation edit
  const saveObservationEdit = (index: number) => {
    if (editingObservation === null) return;
    
    const adData = offer.adData[index];
    if (!adData) return;
    
    onUpdateAdData(offer.id, adData.activeAds, adData.date, editingObservation.value, adData.time);
    setEditingObservation(null);
    
    // Use setTimeout to avoid any UI freezing after saving
    setTimeout(() => {
      toast.success("Observação atualizada com sucesso!");
    }, 100);
  };
  
  // Save total page ads with history
  const handleSaveTotalPageAds = () => {
    if (!onUpdateTotalPageAds) return;
    
    const count = parseInt(totalPageAds);
    if (isNaN(count) || count < 0) {
      toast.error("Digite um número válido de anúncios");
      return;
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Add to history
    const newHistory = [
      ...totalPageAdsHistory,
      { date: today, count: count }
    ];
    
    // Sort history by date
    newHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setTotalPageAdsHistory(newHistory);
    onUpdateTotalPageAds(offer.id, count);
    
    toast.success("Total de anúncios da página atualizado e adicionado ao histórico!");
  };
  
  // Handle update for ad data
  const handleUpdateAdData = (date: string, activeAds: number, observation: string, time?: string) => {
    onUpdateAdData(offer.id, activeAds, date, observation, time);
  };
  
  // Handle delete for ad data
  const handleDeleteAdData = (date: string) => {
    if (onDeleteAdData) {
      onDeleteAdData(offer.id, date);
    }
  };
  
  // Save Facebook Ad Library URL
  const handleSaveFacebookAdLibraryUrl = () => {
    if (!onUpdateFacebookAdLibraryUrl) return;
    
    onUpdateFacebookAdLibraryUrl(offer.id, facebookAdLibraryUrl);
  };
  
  // Add keyword
  const addKeyword = () => {
    if (!newKeyword.trim() || !onUpdateKeywords) return;
    
    if (keywords.includes(newKeyword.trim())) {
      toast.error("Esta tag já existe");
      return;
    }
    
    const updatedKeywords = [...keywords, newKeyword.trim()];
    setKeywords(updatedKeywords);
    onUpdateKeywords(offer.id, updatedKeywords);
    setNewKeyword("");
  };
  
  // Remove keyword
  const removeKeyword = (keyword: string) => {
    if (!onUpdateKeywords) return;
    
    const updatedKeywords = keywords.filter(k => k !== keyword);
    setKeywords(updatedKeywords);
    onUpdateKeywords(offer.id, updatedKeywords);
  };
  
  // Open Facebook Ad Library URL in new tab
  const openAdLibraryUrl = () => {
    if (offer.facebookAdLibraryUrl) {
      window.open(offer.facebookAdLibraryUrl, '_blank');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} className="border-gray-700">
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">{offer.name}</h2>
          {onUpdateOfferDetails && (
            <EditOfferForm 
              offer={offer} 
              onSave={onUpdateOfferDetails}
            />
          )}
        </div>
        <div className="w-[70px]" />
      </div>
      
      <p className="text-muted-foreground">{offer.description}</p>
      
      {offer.facebookAdLibraryUrl && (
        <div 
          className="text-primary flex items-center gap-2 cursor-pointer hover:underline"
          onClick={openAdLibraryUrl}
        >
          <Link size={16} />
          <span>Ver no Facebook Ad Library</span>
        </div>
      )}

      {/* Ad Data Form - melhorado visualmente */}
      <Card className="ad-form-card">
        <CardHeader className="card-header">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <ChartBar size={18} className="text-red-400" />
            Registrar anúncios para hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <AdDataForm 
            offerId={offer.id} 
            offerName={offer.name}
            onSave={onUpdateAdData} 
          />
        </CardContent>
      </Card>

      <Tabs
        defaultValue="analytics"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "analytics" | "tasks")}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full max-w-[400px] mb-4">
          <TabsTrigger value="analytics" className="flex gap-2 items-center">
            <ChartBar size={16} />
            <span>Análise</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex gap-2 items-center">
            <ListChecks size={16} />
            <span>Tarefas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-0">
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
                <AdTrendChart data={offer.adData} totalPageAds={offer.totalPageAds} />
                
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
                
                {/* Daily Observations List */}
                <div className="mt-6">
                  <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Observações Diárias
                  </h3>
                  
                  {offer.adData.length > 0 ? (
                    <div className="space-y-3">
                      {offer.adData.map((data, index) => {
                        // Corrigir o formato da data para exibição
                        const displayDate = new Date(data.date);
                        return (
                          <div key={data.date} className="bg-glass rounded-lg p-3">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-muted-foreground" />
                                <span className="text-sm">{displayDate.toLocaleDateString('pt-BR')}</span>
                                <span className="text-xs text-muted-foreground">{data.time || ""}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-sm">{data.activeAds} anúncios</span>
                                {onDeleteAdData ? (
                                  <AdDataEntryActions 
                                    adData={data}
                                    onUpdate={handleUpdateAdData}
                                    onDelete={handleDeleteAdData}
                                  />
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={() => setEditingObservation({
                                      index,
                                      value: data.observation || ""
                                    })}
                                  >
                                    <Edit2 size={14} />
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {editingObservation !== null && editingObservation.index === index ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingObservation.value}
                                  onChange={(e) => setEditingObservation({
                                    ...editingObservation,
                                    value: e.target.value
                                  })}
                                  className="border-gray-700 text-sm min-h-[60px]"
                                  placeholder="Adicionar observação..."
                                />
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setEditingObservation(null)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => saveObservationEdit(index)}
                                  >
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {data.observation ? data.observation : "Sem observações para este dia"}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma observação disponível. Adicione dados de anúncios para começar a registrar observações.
                    </p>
                  )}
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
              
              {/* Total Page Ads Card com histórico */}
              <Card className="border border-gray-800 card-gradient">
                <CardHeader>
                  <CardTitle className="text-base">Anúncios da Página</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {offer.pageName && (
                      <div className="text-sm text-muted-foreground">
                        Página: {offer.pageName}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="totalPageAds">Total de anúncios ativos da página</Label>
                      <div className="flex gap-2">
                        <Input
                          id="totalPageAds"
                          type="number"
                          min="0"
                          placeholder="Total de anúncios da página"
                          value={totalPageAds}
                          onChange={(e) => setTotalPageAds(e.target.value)}
                          className="border-gray-700 form-control"
                        />
                        <Button 
                          onClick={handleSaveTotalPageAds}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Salvar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Registre aqui o número total de anúncios ativos da página, independente da oferta específica.
                      </p>
                    </div>
                    
                    {/* Histórico de Total Page Ads */}
                    {totalPageAdsHistory.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h4 className="text-sm font-medium">Histórico de anúncios da página</h4>
                        <div className="space-y-1 max-h-[150px] overflow-y-auto pr-2">
                          {totalPageAdsHistory.map((entry, index) => {
                            const entryDate = new Date(entry.date);
                            return (
                              <div 
                                key={index} 
                                className="flex justify-between items-center text-xs p-2 bg-slate-800/40 rounded"
                              >
                                <span>{entryDate.toLocaleDateString('pt-BR')}</span>
                                <span className="font-medium">{entry.count} anúncios</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="facebookAdLibraryUrl" className="flex items-center gap-2">
                        <ExternalLink size={14} className="mr-1" />
                        Link da biblioteca de anúncios
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="facebookAdLibraryUrl"
                          type="url"
                          placeholder="URL da biblioteca de anúncios do Facebook"
                          value={facebookAdLibraryUrl}
                          onChange={(e) => setFacebookAdLibraryUrl(e.target.value)}
                          className="border-gray-700 form-control"
                        />
                        <Button 
                          onClick={handleSaveFacebookAdLibraryUrl}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Salvar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Insira o link da biblioteca de anúncios do Facebook para acessar rapidamente.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Keywords Card */}
              <Card className="border border-gray-800 card-gradient">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Tag size={16} />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newKeyword">Adicionar tag</Label>
                      <div className="flex gap-2">
                        <Input
                          id="newKeyword"
                          placeholder="Nova tag"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          className="border-gray-700 form-control"
                        />
                        <Button 
                          onClick={addKeyword}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Adicionar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Registre as tags para categorizar e encontrar esta oferta facilmente.
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {keywords.length > 0 ? (
                        keywords.map((keyword, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="px-3 py-1 hover:bg-background/40 transition-colors"
                          >
                            {keyword}
                            <button 
                              className="ml-2 text-xs opacity-70 hover:opacity-100"
                              onClick={() => removeKeyword(keyword)}
                            >
                              ✕
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma tag registrada.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Calendar view */}
              <Card className="border border-gray-800 card-gradient">
                <CardHeader>
                  <CardTitle className="text-base">Histórico por Data</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <AdDataCalendar adData={offer.adData} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 lg:col-span-2">
              <TaskList 
                offerId={offer.id}
                offerName={offer.name}
                tasks={tasks}
                onAddTask={addTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onReorderTasks={reorderTasks}
              />
            </div>
            
            <div className="col-span-1">
              <Card className="border border-gray-800 card-gradient">
                <CardHeader>
                  <CardTitle className="text-base">Sobre as Tarefas</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    Use esta seção para criar uma lista de tarefas e acompanhar seu progresso.
                  </p>
                  <ul className="mt-4 text-sm text-muted-foreground list-disc list-inside space-y-2">
                    <li>Crie um passo a passo para executar a oferta</li>
                    <li>Anote ideias para melhorar a oferta</li>
                    <li>Registre ajustes necessários nos anúncios</li>
                    <li>Organize fluxos de trabalho</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OfferDetails;
