
import { useState } from "react";
import { useOffers } from "@/hooks/useOffers";
import OfferCard from "@/components/OfferCard";
import { Offer } from "@/types/offer";
import OfferDetails from "@/components/OfferDetails";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  LayoutGrid, 
  LayoutList,
  Search,
  SlidersHorizontal,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import NewOfferForm from "@/components/NewOfferForm";
import { Badge } from "@/components/ui/badge";

const OffersPage = () => {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();
  
  const { 
    offers, 
    loading, 
    pinnedOffers, 
    favoriteOffers,
    archivedOffers,
    pinOffer,
    favoriteOffer,
    archiveOffer,
    deleteOffer,
    refreshOffers
  } = useOffers();

  const handleOfferClick = (offer: Offer) => {
    setSelectedOffer(offer);
  };

  const handleCloseOfferDetails = () => {
    setSelectedOffer(null);
  };

  const handleCreateOfferSuccess = () => {
    setIsCreatingOffer(false);
    refreshOffers();
  };

  const handleNewOfferClick = () => {
    setIsCreatingOffer(true);
  };

  // Filter offers based on search term
  const filteredOffers = offers.filter(offer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      offer.name.toLowerCase().includes(searchLower) || 
      offer.description.toLowerCase().includes(searchLower) ||
      offer.keywords?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  // Separate pinned offers
  const pinnedOffersList = filteredOffers.filter(offer => pinnedOffers.has(offer.id));
  const unpinnedOffersList = filteredOffers.filter(offer => !pinnedOffers.has(offer.id));

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <h1 className="text-2xl font-bold">Ofertas</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handleNewOfferClick}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
          >
            Nova Oferta
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <Input 
            placeholder="Buscar ofertas..." 
            className="pl-10 bg-slate-800/50 border-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            className={viewMode === "grid" ? "bg-slate-700" : ""}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid size={18} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className={viewMode === "list" ? "bg-slate-700" : ""}
            onClick={() => setViewMode("list")}
          >
            <LayoutList size={18} />
          </Button>
          <Button variant="outline" size="icon">
            <SlidersHorizontal size={18} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse text-slate-400">Carregando ofertas...</div>
        </div>
      ) : filteredOffers.length > 0 ? (
        <>
          {pinnedOffersList.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700/50">
                  Fixadas
                </Badge>
              </div>
              <div className={`grid ${viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4" 
                : "grid-cols-1 gap-3"}`}>
                {pinnedOffersList.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onClick={handleOfferClick}
                    onPin={pinOffer}
                    onFavorite={favoriteOffer}
                    onArchive={archiveOffer}
                    onDelete={deleteOffer}
                    onRefresh={refreshOffers}
                    isPinned={pinnedOffers.has(offer.id)}
                    isFavorite={favoriteOffers.has(offer.id)}
                    isArchived={archivedOffers.has(offer.id)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className={`grid ${viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4" 
            : "grid-cols-1 gap-3"}`}>
            {unpinnedOffersList.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onClick={handleOfferClick}
                onPin={pinOffer}
                onFavorite={favoriteOffer}
                onArchive={archiveOffer}
                onDelete={deleteOffer}
                onRefresh={refreshOffers}
                isPinned={pinnedOffers.has(offer.id)}
                isFavorite={favoriteOffers.has(offer.id)}
                isArchived={archivedOffers.has(offer.id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-slate-800/20 rounded-lg border border-slate-700/30">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-xl font-medium text-slate-300 mb-1">Nenhuma oferta encontrada</h3>
          <p className="text-slate-400 mb-4">
            {searchTerm 
              ? "Tente usar termos diferentes na busca"
              : "Comece a monitorar suas ofertas agora mesmo"}
          </p>
          <Button 
            onClick={handleNewOfferClick}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
          >
            Nova Oferta
          </Button>
        </div>
      )}

      {/* Offer Details Dialog */}
      <Dialog open={!!selectedOffer} onOpenChange={open => !open && handleCloseOfferDetails()}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-slate-900 p-0">
          {selectedOffer && (
            <OfferDetails 
              offer={selectedOffer} 
              onClose={handleCloseOfferDetails}
              onRefresh={refreshOffers}
            />
          )}
        </DialogContent>
      </Dialog>

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

export default OffersPage;
