
import { useState, useMemo } from "react";
import { Offer } from "@/types/offer";
import { generateMockOffers } from "@/services/mockData";
import Header from "@/components/Header";
import OfferCard from "@/components/OfferCard";
import OfferDetails from "@/components/OfferDetails";
import NewOfferForm from "@/components/NewOfferForm";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search } from "lucide-react";

const Index = () => {
  // Estado para gerenciar ofertas
  const [offers, setOffers] = useState<Offer[]>(() => generateMockOffers());
  // Estado para a oferta selecionada (detalhes)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  // Estado para o modo de criação de oferta
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  // Estado para o termo de busca
  const [searchTerm, setSearchTerm] = useState("");

  // Filtragem das ofertas com base no termo de busca
  const filteredOffers = useMemo(() => {
    if (!searchTerm.trim()) return offers;
    
    const term = searchTerm.toLowerCase().trim();
    return offers.filter(offer => 
      offer.name.toLowerCase().includes(term) || 
      offer.description.toLowerCase().includes(term)
    );
  }, [offers, searchTerm]);

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
            <h2 className="text-2xl font-bold">Ofertas</h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar ofertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-700 bg-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredOffers.length > 0 ? (
                filteredOffers.map(offer => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onClick={setSelectedOffer}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  {searchTerm ? "Nenhuma oferta encontrada" : "Nenhuma oferta cadastrada"}
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
