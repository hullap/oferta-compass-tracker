
import { useState } from "react";
import { Offer } from "@/types/offer";
import Header from "@/components/Header";
import OfferCard from "@/components/OfferCard";
import OfferDetails from "@/components/OfferDetails";
import NewOfferForm from "@/components/NewOfferForm";
import { Input } from "@/components/ui/input";
import { Search, LayoutGrid, LayoutList, Star, Archive as ArchiveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useOffers } from "@/hooks/useOffers";

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
    deleteOffer
  } = useOffers();

  // Filtragem das ofertas com base no termo de busca
  const filteredOffers = offers.filter(offer => {
    // Filtro inicial pelo termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const keywordsMatch = offer.keywords?.some(keyword => 
        keyword.toLowerCase().includes(term)
      );
      
      if (!(offer.name.toLowerCase().includes(term) || 
            offer.description.toLowerCase().includes(term) ||
            keywordsMatch)) {
        return false;
      }
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
    // Ordenação: primeiro as fixadas, depois as normais
    if (pinnedOffers.has(a.id) === pinnedOffers.has(b.id)) {
      // Se ambas estão fixadas ou ambas não estão, ordena por data de criação (mais recente primeiro)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // Se apenas a primeira está fixada, ela vem primeiro
    if (pinnedOffers.has(a.id)) return -1;
    // Se apenas a segunda está fixada, ela vem primeiro
    return 1;
  });

  // Handler para adicionar uma nova oferta
  const handleAddOffer = async (name: string, description: string, facebookAdLibraryUrl: string = "") => {
    await addOffer(name, description, "", "", [], facebookAdLibraryUrl);
    setIsCreatingOffer(false);
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
            onUpdateOfferDetails={updateOfferDetails}
            onUpdateAdData={updateAdData}
            onUpdateTotalPageAds={updateTotalPageAds}
            onUpdateKeywords={updateKeywords}
            onUpdateFacebookAdLibraryUrl={updateFacebookAdLibraryUrl}
            onDeleteAdData={deleteAdData}
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
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "flex flex-col gap-4"
              }>
                {filteredOffers.length > 0 ? (
                  filteredOffers.map(offer => (
                    <div key={offer.id} className={viewMode === "list" ? "w-full" : ""}>
                      <OfferCard
                        offer={offer}
                        onClick={setSelectedOffer}
                        onPin={pinOffer}
                        onFavorite={favoriteOffer}
                        onArchive={archiveOffer}
                        onDelete={deleteOffer}
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
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
