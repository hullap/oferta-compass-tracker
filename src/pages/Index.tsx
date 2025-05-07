
import { useState, useMemo } from "react";
import { Offer } from "@/types/offer";
import { generateMockOffers } from "@/services/mockData";
import Header from "@/components/Header";
import OfferCard from "@/components/OfferCard";
import OfferDetails from "@/components/OfferDetails";
import NewOfferForm from "@/components/NewOfferForm";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Search, 
  LayoutGrid, 
  LayoutList, 
  Star,
  Archive as ArchiveIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

const Index = () => {
  // Estado para gerenciar ofertas
  const [offers, setOffers] = useState<Offer[]>(() => generateMockOffers());
  // Estado para a oferta selecionada (detalhes)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  // Estado para o modo de criação de oferta
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  // Estado para o termo de busca
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para o modo de visualização
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  // Estado para ofertas favoritadas, fixadas e arquivadas
  const [pinnedOffers, setPinnedOffers] = useState<Set<string>>(new Set());
  const [favoriteOffers, setFavoriteOffers] = useState<Set<string>>(new Set());
  const [archivedOffers, setArchivedOffers] = useState<Set<string>>(new Set());
  // Estado para filtro de visualização
  const [viewFilter, setViewFilter] = useState<"all" | "pinned" | "favorites" | "archived">("all");

  // Filtragem das ofertas com base no termo de busca
  const filteredOffers = useMemo(() => {
    // Filtro inicial pelo termo de busca
    let result = offers;
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(offer => 
        offer.name.toLowerCase().includes(term) || 
        offer.description.toLowerCase().includes(term)
      );
    }
    
    // Aplicação do filtro de visualização
    if (viewFilter === "pinned") {
      result = result.filter(offer => pinnedOffers.has(offer.id));
    } else if (viewFilter === "favorites") {
      result = result.filter(offer => favoriteOffers.has(offer.id));
    } else if (viewFilter === "archived") {
      result = result.filter(offer => archivedOffers.has(offer.id));
    } else if (viewFilter === "all") {
      // No filtro "all", exibe as não arquivadas por padrão
      result = result.filter(offer => !archivedOffers.has(offer.id));
    }
    
    // Ordenação: primeiro as fixadas, depois as normais
    return result.sort((a, b) => {
      // Se ambas estão fixadas ou ambas não estão, mantém a ordem original
      if (pinnedOffers.has(a.id) === pinnedOffers.has(b.id)) return 0;
      // Se apenas a primeira está fixada, ela vem primeiro
      if (pinnedOffers.has(a.id)) return -1;
      // Se apenas a segunda está fixada, ela vem primeiro
      return 1;
    });
  }, [offers, searchTerm, viewFilter, pinnedOffers, favoriteOffers, archivedOffers]);

  // Handler para adicionar uma nova oferta
  const handleAddOffer = (name: string, description: string) => {
    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      name,
      description,
      adData: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setOffers(prev => [newOffer, ...prev]);
    setIsCreatingOffer(false);
    toast.success("Oferta criada com sucesso!");
  };

  // Handler para atualizar os dados de anúncios de uma oferta
  const handleUpdateAdData = (offerId: string, activeAds: number, date: string = new Date().toISOString().split('T')[0]) => {
    setOffers(prev => prev.map(offer => {
      if (offer.id !== offerId) return offer;
      
      // Verifica se já existe um registro para a data informada
      const existingDateIndex = offer.adData.findIndex(data => data.date.startsWith(date));
      
      let updatedAdData;
      if (existingDateIndex >= 0) {
        // Atualiza o registro existente
        updatedAdData = [...offer.adData];
        updatedAdData[existingDateIndex] = { date, activeAds };
      } else {
        // Adiciona novo registro e ordena por data
        updatedAdData = [...offer.adData, { date, activeAds }]
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      
      // Atualiza o objeto da oferta
      return {
        ...offer,
        adData: updatedAdData,
        updatedAt: new Date().toISOString()
      };
    }));
    
    // Se estiver na visualização de detalhes, atualiza o selectedOffer também
    if (selectedOffer && selectedOffer.id === offerId) {
      const updatedOffer = offers.find(o => o.id === offerId);
      if (updatedOffer) {
        setSelectedOffer(current => {
          if (!current) return null;
          
          // Verifica se já existe um registro para a data informada
          const existingDateIndex = current.adData.findIndex(data => data.date.startsWith(date));
          
          let updatedAdData;
          if (existingDateIndex >= 0) {
            // Atualiza o registro existente
            updatedAdData = [...current.adData];
            updatedAdData[existingDateIndex] = { date, activeAds };
          } else {
            // Adiciona novo registro e ordena por data
            updatedAdData = [...current.adData, { date, activeAds }]
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          }
          
          return {
            ...current,
            adData: updatedAdData,
            updatedAt: new Date().toISOString()
          };
        });
      }
    }
    
    toast.success("Dados atualizados com sucesso!");
  };

  // Handler para fixar/desfixar ofertas
  const handlePinOffer = (offer: Offer) => {
    setPinnedOffers(prev => {
      const newPinned = new Set(prev);
      if (newPinned.has(offer.id)) {
        newPinned.delete(offer.id);
        toast.success("Oferta desfixada com sucesso!");
      } else {
        newPinned.add(offer.id);
        toast.success("Oferta fixada com sucesso!");
      }
      return newPinned;
    });
  };

  // Handler para favoritar/desfavoritar ofertas
  const handleFavoriteOffer = (offer: Offer) => {
    setFavoriteOffers(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(offer.id)) {
        newFavorites.delete(offer.id);
        toast.success("Oferta removida dos favoritos!");
      } else {
        newFavorites.add(offer.id);
        toast.success("Oferta adicionada aos favoritos!");
      }
      return newFavorites;
    });
  };

  // Handler para arquivar/desarquivar ofertas
  const handleArchiveOffer = (offer: Offer) => {
    setArchivedOffers(prev => {
      const newArchived = new Set(prev);
      if (newArchived.has(offer.id)) {
        newArchived.delete(offer.id);
        toast.success("Oferta desarquivada com sucesso!");
      } else {
        newArchived.add(offer.id);
        toast.success("Oferta arquivada com sucesso!");
      }
      return newArchived;
    });
  };

  // Handler para excluir ofertas
  const handleDeleteOffer = (offer: Offer) => {
    setOffers(prev => prev.filter(o => o.id !== offer.id));
    
    // Remove de todas as listas se existir
    setPinnedOffers(prev => {
      const newPinned = new Set(prev);
      newPinned.delete(offer.id);
      return newPinned;
    });
    
    setFavoriteOffers(prev => {
      const newFavorites = new Set(prev);
      newFavorites.delete(offer.id);
      return newFavorites;
    });
    
    setArchivedOffers(prev => {
      const newArchived = new Set(prev);
      newArchived.delete(offer.id);
      return newArchived;
    });
    
    toast.success("Oferta excluída com sucesso!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNewOfferClick={() => {
        setSelectedOffer(null);
        setIsCreatingOffer(true);
      }} />
      
      <main className="flex-1 container py-6 px-4">
        {isCreatingOffer ? (
          <NewOfferForm 
            onSubmit={handleAddOffer} 
            onCancel={() => setIsCreatingOffer(false)} 
          />
        ) : selectedOffer ? (
          <OfferDetails 
            offer={selectedOffer}
            onBack={() => setSelectedOffer(null)}
            onUpdateAdData={handleUpdateAdData}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Ofertas</h2>
              <div className="flex gap-2">
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
                placeholder="Buscar ofertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-700 bg-transparent"
              />
            </div>
            
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
              : "flex flex-col gap-4"
            }>
              {filteredOffers.length > 0 ? (
                filteredOffers.map(offer => (
                  <div key={offer.id} className={viewMode === "list" ? "w-full" : ""}>
                    <OfferCard
                      offer={offer}
                      onClick={setSelectedOffer}
                      onPin={handlePinOffer}
                      onFavorite={handleFavoriteOffer}
                      onArchive={handleArchiveOffer}
                      onDelete={handleDeleteOffer}
                      isPinned={pinnedOffers.has(offer.id)}
                      isFavorite={favoriteOffers.has(offer.id)}
                      isArchived={archivedOffers.has(offer.id)}
                    />
                  </div>
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
