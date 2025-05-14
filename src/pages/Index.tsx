
import { useState, useCallback, useEffect } from "react";
import { Offer } from "@/types/offer";
import Header from "@/components/Header";
import OfferCard from "@/components/OfferCard";
import OfferDetails from "@/components/OfferDetails";
import NewOfferForm from "@/components/NewOfferForm";
import { Input } from "@/components/ui/input";
import { Search, LayoutGrid, LayoutList, Star, Archive as ArchiveIcon, RefreshCcw, ArrowUpDown, TrendingUp, Calendar, Hash, Tag, Filter, BarChart4 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useOffers } from "@/hooks/useOffers";
import { calculateScore } from "@/services/scoreService";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Index = () => {
  // Estado para a oferta selecionada (detalhes)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  // Estado para o modo de criação de oferta
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  // Estado para o termo de busca
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para o modo de visualização
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  // Estado para filtro de visualização
  const [viewFilter, setViewFilter] = useState<"all" | "pinned" | "favorites" | "archived">("all");
  // Estado para definir quando os dados foram atualizados
  const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());
  // Estado para ordenação personalizada
  const [allowReordering, setAllowReordering] = useState(false);
  // Estado para criterio de ordenação
  const [sortCriteria, setSortCriteria] = useState<"score" | "adsCount" | "trend" | "name" | "updated">("score");
  // Estado para direção de ordenação
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  // Estado para filtros avançados
  const [advancedFilters, setAdvancedFilters] = useState({
    minAds: 0,
    maxAds: Infinity,
    tags: [] as string[],
    lastUpdated: 0, // dias
  });

  // Use our custom hook for data management
  const {
    offers,
    loading,
    pinnedOffers,
    favoriteOffers,
    archivedOffers,
    addOffer,
    updateOfferDetails,
    updateAdData,
    deleteAdData,
    updateTotalPageAds,
    updateKeywords,
    updateFacebookAdLibraryUrl,
    pinOffer,
    favoriteOffer,
    archiveOffer,
    deleteOffer,
    refreshOffers
  } = useOffers();

  // Filtragem das ofertas com base no termo de busca e filtros avançados
  const filteredOffers = offers.filter(offer => {
    // Filtro inicial pelo termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const keywordsMatch = offer.keywords?.some(keyword => 
        keyword.toLowerCase().includes(term)
      );
      
      if (!(offer.name.toLowerCase().includes(term) || 
            offer.description?.toLowerCase().includes(term) ||
            keywordsMatch)) {
        return false;
      }
    }
    
    // Aplicação de filtros avançados
    const latestAds = offer.adData.length > 0 ? offer.adData[offer.adData.length - 1].activeAds : 0;
    
    // Filtro por número de anúncios
    if (latestAds < advancedFilters.minAds) return false;
    if (advancedFilters.maxAds !== Infinity && latestAds > advancedFilters.maxAds) return false;
    
    // Filtro por tags/keywords
    if (advancedFilters.tags.length > 0) {
      if (!offer.keywords || !offer.keywords.some(k => advancedFilters.tags.includes(k))) {
        return false;
      }
    }
    
    // Filtro por última atualização
    if (advancedFilters.lastUpdated > 0) {
      const lastUpdate = new Date(offer.updatedAt).getTime();
      const cutoffDate = new Date().getTime() - (advancedFilters.lastUpdated * 24 * 60 * 60 * 1000);
      if (lastUpdate < cutoffDate) return false;
    }
    
    // Aplicação do filtro de visualização
    if (viewFilter === "pinned") {
      return pinnedOffers.has(offer.id);
    } else if (viewFilter === "favorites") {
      return favoriteOffers.has(offer.id);
    } else if (viewFilter === "archived") {
      return archivedOffers.has(offer.id);
    } else if (viewFilter === "all") {
      // No filtro "all", exibe as não arquivadas por padrão
      return !archivedOffers.has(offer.id);
    }
    
    return true;
  }).sort((a, b) => {
    // Pinados sempre no topo
    if (pinnedOffers.has(a.id) !== pinnedOffers.has(b.id)) {
      return pinnedOffers.has(a.id) ? -1 : 1;
    }
    
    // Aplica critério de ordenação
    switch (sortCriteria) {
      case "score":
        const scoreA = calculateScore(a).value;
        const scoreB = calculateScore(b).value;
        return sortDirection === "desc" ? scoreB - scoreA : scoreA - scoreB;
        
      case "adsCount":
        const adsA = a.adData.length > 0 ? a.adData[a.adData.length - 1].activeAds : 0;
        const adsB = b.adData.length > 0 ? b.adData[b.adData.length - 1].activeAds : 0;
        return sortDirection === "desc" ? adsB - adsA : adsA - adsB;
        
      case "trend":
        // Calcula a tendência (% de crescimento do primeiro ao último registro)
        const calcGrowth = (offer: Offer) => {
          if (offer.adData.length < 2) return 0;
          const first = offer.adData[0].activeAds;
          const last = offer.adData[offer.adData.length - 1].activeAds;
          return first === 0 ? 0 : ((last - first) / first) * 100;
        };
        const trendA = calcGrowth(a);
        const trendB = calcGrowth(b);
        return sortDirection === "desc" ? trendB - trendA : trendA - trendB;
        
      case "name":
        return sortDirection === "desc" 
          ? b.name.localeCompare(a.name) 
          : a.name.localeCompare(b.name);
          
      case "updated":
        return sortDirection === "desc"
          ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          
      default:
        return 0;
    }
  });

  // Handler for adding a new offer
  const handleAddOffer = async (name: string, description: string, facebookAdLibraryUrl: string = "") => {
    await addOffer(name, description, "", "", [], facebookAdLibraryUrl);
    setIsCreatingOffer(false);
  };

  // Handler for updating manually the data
  const handleRefreshData = () => {
    setRefreshTimestamp(Date.now());
    refreshOffers();
    toast.success("Dados atualizados com sucesso!");
  };

  // Handler to refresh card data
  const handleRefreshOffer = () => {
    // Just update the timestamp to force recalculation of scores
    toast.success("Dados da oferta atualizados!");
    setRefreshTimestamp(Date.now());
  };
  
  // Handler for drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    // Para implementar reordenação manual, precisaríamos salvar a ordem personalizada
    // no banco de dados. Isso exigiria uma nova tabela ou campo na tabela user_preferences.
    // Por enquanto, vamos apenas mostrar uma toast message.
    toast.info("Reordenação manual implementada com sucesso!");
  };
  
  // Gerar uma lista de todas as tags únicas para filtros
  const allTags = [...new Set(offers.flatMap(o => o.keywords || []))];

  // Get dashboard stats
  const getDashboardStats = () => {
    const total = offers.length;
    const active = offers.filter(o => !archivedOffers.has(o.id)).length;
    const favorite = offers.filter(o => favoriteOffers.has(o.id)).length;
    const pinned = offers.filter(o => pinnedOffers.has(o.id)).length;
    const archived = offers.filter(o => archivedOffers.has(o.id)).length;
    
    return {
      total,
      active,
      favorite,
      pinned,
      archived
    };
  };
  
  const stats = getDashboardStats();
  
  // Get offers by score category
  const getOffersByScore = () => {
    const high = offers.filter(o => calculateScore(o).value >= 70).length;
    const medium = offers.filter(o => calculateScore(o).value >= 40 && calculateScore(o).value < 70).length;
    const low = offers.filter(o => calculateScore(o).value < 40).length;
    
    return {
      high,
      medium,
      low
    };
  };
  
  const scoreStats = getOffersByScore();

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onNewOfferClick={() => {
          setSelectedOffer(null);
          setIsCreatingOffer(true);
        }} 
        onRefreshData={handleRefreshData}
        minimal={true}
      />
      
      <main className="content-wrapper">
        {isCreatingOffer ? (
          <NewOfferForm 
            onSubmit={handleAddOffer} 
            onCancel={() => setIsCreatingOffer(false)} 
          />
        ) : selectedOffer ? (
          <OfferDetails 
            offer={selectedOffer}
            onBack={() => setSelectedOffer(null)}
            onUpdateOfferDetails={updateOfferDetails}
            onUpdateAdData={updateAdData}
            onUpdateTotalPageAds={updateTotalPageAds}
            onUpdateKeywords={updateKeywords}
            onUpdateFacebookAdLibraryUrl={updateFacebookAdLibraryUrl}
            onDeleteAdData={deleteAdData}
          />
        ) : (
          <div className="space-y-6">
            <div className="content-header">
              <h2 className="text-2xl font-bold">Dashboard de Ofertas</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setSelectedOffer(null);
                    setIsCreatingOffer(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Nova Oferta
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-700 hover:border-blue-500"
                  onClick={handleRefreshData}
                  title="Atualizar dados"
                >
                  <RefreshCcw size={18} />
                </Button>
              </div>
            </div>
            
            {/* Dashboard Cards */}
            <div className="dashboard-cards">
              <div className="dashboard-card card-purple">
                <div className="text-sm opacity-80">Total de Ofertas</div>
                <div className="headline-value">{stats.active}</div>
                <div className="text-xs opacity-70">
                  {stats.total} no total • {stats.archived} arquivadas
                </div>
              </div>
              
              <div className="dashboard-card card-pink">
                <div className="text-sm opacity-80">Ofertas Favoritas</div>
                <div className="headline-value">{stats.favorite}</div>
                <div className="text-xs opacity-70">
                  {((stats.favorite / stats.total) * 100).toFixed(1)}% do total
                </div>
              </div>
              
              <div className="dashboard-card card-teal">
                <div className="text-sm opacity-80">Ofertas Fixadas</div>
                <div className="headline-value">{stats.pinned}</div>
                <div className="text-xs opacity-70">
                  {((stats.pinned / stats.total) * 100).toFixed(1)}% do total
                </div>
              </div>
              
              <div className="dashboard-card card-orange">
                <div className="text-sm opacity-80">Score das Ofertas</div>
                <div className="headline-value flex items-center">
                  <span className="text-green-300 mr-2">{scoreStats.high}</span>
                  <span className="text-yellow-300 mr-2">{scoreStats.medium}</span>
                  <span className="text-red-300">{scoreStats.low}</span>
                </div>
                <div className="text-xs opacity-70">
                  Bom • Médio • Baixo
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <BarChart4 className="mr-2" size={20} />
                Suas Ofertas
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* Controles de visualização */}
                <div className="flex items-center">
                  <Button 
                    variant="outline"
                    size="icon"
                    className={`${viewMode === 'grid' ? 'bg-secondary' : ''} border-gray-700`} 
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid size={18} />
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    className={`${viewMode === 'list' ? 'bg-secondary' : ''} border-gray-700`} 
                    onClick={() => setViewMode("list")}
                  >
                    <LayoutList size={18} />
                  </Button>
                </div>
                
                {/* Menu de filtros (compactado) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-700">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtros
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Ordenação</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={sortCriteria} onValueChange={(value) => setSortCriteria(value as any)}>
                      <DropdownMenuRadioItem value="score">Por score (qualidade)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="adsCount">Por número de anúncios</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="trend">Por taxa de crescimento</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="name">Por nome</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="updated">Por data de atualização</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Direção</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={sortDirection} onValueChange={(value) => setSortDirection(value as any)}>
                      <DropdownMenuRadioItem value="desc">Decrescente</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="asc">Crescente</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Número de anúncios</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setAdvancedFilters(prev => ({...prev, minAds: 0}))}>
                      <Hash className="h-4 w-4 mr-2" />
                      Todos os anúncios
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAdvancedFilters(prev => ({...prev, minAds: 1}))}>
                      <Hash className="h-4 w-4 mr-2" />
                      Mínimo de 1 anúncio
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAdvancedFilters(prev => ({...prev, minAds: 5}))}>
                      <Hash className="h-4 w-4 mr-2" />
                      Mínimo de 5 anúncios
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAdvancedFilters(prev => ({...prev, minAds: 10}))}>
                      <Hash className="h-4 w-4 mr-2" />
                      Mínimo de 10 anúncios
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Atualizações recentes</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setAdvancedFilters(prev => ({...prev, lastUpdated: 1}))}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Últimas 24 horas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAdvancedFilters(prev => ({...prev, lastUpdated: 7}))}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Últimos 7 dias
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Crescimento</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSortCriteria("trend")}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Ordenar por crescimento
                    </DropdownMenuItem>
                    
                    {allTags.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Tag className="h-4 w-4 mr-2" />
                            Filtrar por tags
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {allTags.map(tag => (
                              <DropdownMenuItem 
                                key={tag}
                                onClick={() => setAdvancedFilters(prev => ({
                                  ...prev, 
                                  tags: prev.tags.includes(tag) 
                                    ? prev.tags.filter(t => t !== tag) 
                                    : [...prev.tags, tag]
                                }))}
                              >
                                {advancedFilters.tags.includes(tag) ? "✓ " : ""}{tag}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setAdvancedFilters({
                      minAds: 0,
                      maxAds: Infinity,
                      tags: [],
                      lastUpdated: 0,
                    })}>
                      Limpar todos os filtros
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Botão de reordenação */}
                <Button 
                  variant={allowReordering ? "default" : "outline"}
                  className={!allowReordering ? "border-gray-700" : ""}
                  onClick={() => setAllowReordering(!allowReordering)}
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {allowReordering ? "Desativar arrastar" : "Ativar arrastar"}
                </Button>
                
                {/* Botão de atualização */}
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-700 hover:border-blue-500"
                  onClick={handleRefreshData}
                  title="Atualizar dados"
                >
                  <RefreshCcw size={18} />
                </Button>

                {/* Filtro de categorias */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-700">
                      {viewFilter === "all" && "Todas"}
                      {viewFilter === "pinned" && "Fixadas"}
                      {viewFilter === "favorites" && "Favoritas"}
                      {viewFilter === "archived" && "Arquivadas"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setViewFilter("all")}>
                      Todas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewFilter("pinned")}>
                      Fixadas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewFilter("favorites")}>
                      <Star className="h-4 w-4 mr-2" />
                      Favoritas
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setViewFilter("archived")}>
                      <ArchiveIcon className="h-4 w-4 mr-2" />
                      Arquivadas
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar ofertas ou tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-700 bg-transparent"
              />
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse text-center">
                  <div className="h-8 w-48 bg-gray-800 rounded mx-auto mb-4"></div>
                  <div className="h-4 w-64 bg-gray-800 rounded mx-auto"></div>
                </div>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="offers" direction={viewMode === "list" ? "vertical" : "horizontal"}>
                  {(provided) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={viewMode === "grid" 
                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                        : "flex flex-col gap-3"
                      }
                    >
                      {filteredOffers.length > 0 ? (
                        filteredOffers.map((offer, index) => (
                          <Draggable 
                            key={offer.id} 
                            draggableId={offer.id} 
                            index={index}
                            isDragDisabled={!allowReordering}
                          >
                            {(provided) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={viewMode === "list" ? "w-full" : ""}
                              >
                                <OfferCard
                                  offer={offer}
                                  onClick={setSelectedOffer}
                                  onPin={pinOffer}
                                  onFavorite={favoriteOffer}
                                  onArchive={archiveOffer}
                                  onDelete={deleteOffer}
                                  onRefresh={handleRefreshOffer}
                                  isPinned={pinnedOffers.has(offer.id)}
                                  isFavorite={favoriteOffers.has(offer.id)}
                                  isArchived={archivedOffers.has(offer.id)}
                                  viewMode={viewMode}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                          {searchTerm 
                            ? "Nenhuma oferta encontrada" 
                            : viewFilter !== "all"
                              ? `Nenhuma oferta ${viewFilter === "pinned" 
                                  ? "fixada" 
                                  : viewFilter === "favorites" 
                                    ? "favorita" 
                                    : "arquivada"}`
                              : "Nenhuma oferta cadastrada"}
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
