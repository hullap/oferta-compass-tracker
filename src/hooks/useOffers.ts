
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Offer, AdData } from "@/types/offer";

export const useOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedOffers, setPinnedOffers] = useState<Set<string>>(new Set());
  const [favoriteOffers, setFavoriteOffers] = useState<Set<string>>(new Set());
  const [archivedOffers, setArchivedOffers] = useState<Set<string>>(new Set());
  
  const { user } = useAuth();
  
  // Fetch all offers for the current user
  const fetchOffers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch offers
      const { data: offersData, error: offersError } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (offersError) throw offersError;
      
      // Fetch ad data for each offer
      const offersWithAdData = await Promise.all(
        offersData.map(async (offer) => {
          const { data: adData, error: adDataError } = await supabase
            .from("ad_data")
            .select("*")
            .eq("offer_id", offer.id)
            .order("date", { ascending: true });
            
          if (adDataError) throw adDataError;
          
          // Transform ad_data to match the AdData type
          const transformedAdData: AdData[] = adData.map(item => ({
            date: item.date,
            activeAds: item.active_ads,
            observation: item.observation || ""
          }));
          
          // Calculate trends for each day
          transformedAdData.forEach((item, idx) => {
            if (idx > 0) {
              const prevAds = transformedAdData[idx - 1].activeAds;
              if (prevAds > 0) {
                const change = item.activeAds - prevAds;
                item.trend = (change / prevAds) * 100;
              }
            }
          });
          
          return {
            id: offer.id,
            name: offer.name,
            description: offer.description || "",
            adData: transformedAdData,
            pageId: offer.page_id || "",
            pageName: offer.page_name || "",
            totalPageAds: offer.total_page_ads || 0,
            keywords: offer.keywords || [],
            createdAt: offer.created_at,
            updatedAt: offer.updated_at
          };
        })
      );
      
      // Fetch user preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id);
        
      if (preferencesError) throw preferencesError;
      
      // Set user preferences
      const pinned = new Set<string>();
      const favorites = new Set<string>();
      const archived = new Set<string>();
      
      preferencesData.forEach(pref => {
        if (pref.is_pinned) pinned.add(pref.offer_id);
        if (pref.is_favorite) favorites.add(pref.offer_id);
        if (pref.is_archived) archived.add(pref.offer_id);
      });
      
      setPinnedOffers(pinned);
      setFavoriteOffers(favorites);
      setArchivedOffers(archived);
      setOffers(offersWithAdData);
    } catch (error: any) {
      console.error("Error fetching offers:", error);
      toast.error("Erro ao buscar ofertas");
    } finally {
      setLoading(false);
    }
  };
  
  // Add new offer
  const addOffer = async (name: string, description: string, pageId: string = "", pageName: string = "", keywords: string[] = []) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("offers")
        .insert([
          { 
            name, 
            description, 
            user_id: user.id,
            page_id: pageId,
            page_name: pageName,
            keywords 
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      const newOffer: Offer = {
        id: data.id,
        name: data.name,
        description: data.description || "",
        adData: [],
        pageId: data.page_id || "",
        pageName: data.page_name || "",
        totalPageAds: data.total_page_ads || 0,
        keywords: data.keywords || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      setOffers(prev => [newOffer, ...prev]);
      toast.success("Oferta criada com sucesso!");
      return data.id;
    } catch (error: any) {
      console.error("Error adding offer:", error);
      toast.error("Erro ao criar oferta");
      return null;
    }
  };
  
  // Update ad data for an offer
  const updateAdData = async (offerId: string, activeAds: number, date: string = new Date().toISOString().split('T')[0], observation: string = "") => {
    if (!user) return;
    
    try {
      // Check if entry already exists
      const { data: existingData } = await supabase
        .from("ad_data")
        .select("*")
        .eq("offer_id", offerId)
        .eq("date", date)
        .maybeSingle();
      
      let result;
      
      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from("ad_data")
          .update({ 
            active_ads: activeAds, 
            observation,
            updated_at: new Date().toISOString() 
          })
          .eq("id", existingData.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from("ad_data")
          .insert([
            { 
              offer_id: offerId, 
              date, 
              active_ads: activeAds,
              observation
            }
          ])
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      // Update offers state with new data
      setOffers(prevOffers => {
        return prevOffers.map(offer => {
          if (offer.id !== offerId) return offer;
          
          // Find if we have an entry for this date
          const dateIndex = offer.adData.findIndex(ad => ad.date === date);
          let updatedAdData = [...offer.adData];
          
          if (dateIndex >= 0) {
            // Update existing entry
            updatedAdData[dateIndex] = { 
              ...updatedAdData[dateIndex], 
              activeAds, 
              date,
              observation
            };
          } else {
            // Add new entry and sort by date
            updatedAdData = [...updatedAdData, { date, activeAds, observation }]
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          }
          
          // Recalculate trends
          updatedAdData.forEach((item, idx) => {
            if (idx > 0) {
              const prevAds = updatedAdData[idx - 1].activeAds;
              if (prevAds > 0) {
                const change = item.activeAds - prevAds;
                item.trend = (change / prevAds) * 100;
              }
            }
          });
          
          return {
            ...offer,
            adData: updatedAdData,
            updatedAt: new Date().toISOString()
          };
        });
      });
      
      toast.success("Dados atualizados com sucesso!");
    } catch (error: any) {
      console.error("Error updating ad data:", error);
      toast.error("Erro ao atualizar dados");
    }
  };
  
  // Update total page ads count
  const updateTotalPageAds = async (offerId: string, totalPageAds: number) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("offers")
        .update({ 
          total_page_ads: totalPageAds,
          updated_at: new Date().toISOString() 
        })
        .eq("id", offerId);
        
      if (error) throw error;
      
      // Update offers state
      setOffers(prevOffers => {
        return prevOffers.map(offer => {
          if (offer.id !== offerId) return offer;
          
          return {
            ...offer,
            totalPageAds,
            updatedAt: new Date().toISOString()
          };
        });
      });
      
      toast.success("Total de anúncios da página atualizado!");
    } catch (error: any) {
      console.error("Error updating total page ads:", error);
      toast.error("Erro ao atualizar total de anúncios");
    }
  };
  
  // Update keywords
  const updateKeywords = async (offerId: string, keywords: string[]) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("offers")
        .update({ 
          keywords,
          updated_at: new Date().toISOString() 
        })
        .eq("id", offerId);
        
      if (error) throw error;
      
      // Update offers state
      setOffers(prevOffers => {
        return prevOffers.map(offer => {
          if (offer.id !== offerId) return offer;
          
          return {
            ...offer,
            keywords,
            updatedAt: new Date().toISOString()
          };
        });
      });
      
      toast.success("Palavras-chave atualizadas!");
    } catch (error: any) {
      console.error("Error updating keywords:", error);
      toast.error("Erro ao atualizar palavras-chave");
    }
  };
  
  // Update user preferences (pin, favorite, archive)
  const updatePreference = async (offerId: string, type: 'pin' | 'favorite' | 'archive', value: boolean) => {
    if (!user) return;
    
    try {
      // Check if preference exists
      const { data: existingPref } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .eq("offer_id", offerId)
        .maybeSingle();
      
      if (existingPref) {
        // Update existing preference
        const updates: Record<string, boolean> = {};
        
        if (type === 'pin') updates.is_pinned = value;
        if (type === 'favorite') updates.is_favorite = value;
        if (type === 'archive') updates.is_archived = value;
        
        const { error } = await supabase
          .from("user_preferences")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", existingPref.id);
          
        if (error) throw error;
      } else {
        // Create new preference
        const newPref = { 
          user_id: user.id, 
          offer_id: offerId,
          is_pinned: false,
          is_favorite: false,
          is_archived: false
        };
        
        if (type === 'pin') newPref.is_pinned = value;
        if (type === 'favorite') newPref.is_favorite = value;
        if (type === 'archive') newPref.is_archived = value;
        
        const { error } = await supabase
          .from("user_preferences")
          .insert(newPref);
          
        if (error) throw error;
      }
      
      // Update local state
      if (type === 'pin') {
        setPinnedOffers(prev => {
          const updated = new Set(prev);
          if (value) {
            updated.add(offerId);
          } else {
            updated.delete(offerId);
          }
          return updated;
        });
      } else if (type === 'favorite') {
        setFavoriteOffers(prev => {
          const updated = new Set(prev);
          if (value) {
            updated.add(offerId);
          } else {
            updated.delete(offerId);
          }
          return updated;
        });
      } else if (type === 'archive') {
        setArchivedOffers(prev => {
          const updated = new Set(prev);
          if (value) {
            updated.add(offerId);
          } else {
            updated.delete(offerId);
          }
          return updated;
        });
      }
      
      const action = value ? 
        (type === 'pin' ? 'fixada' : type === 'favorite' ? 'adicionada aos favoritos' : 'arquivada') :
        (type === 'pin' ? 'desfixada' : type === 'favorite' ? 'removida dos favoritos' : 'desarquivada');
      
      toast.success(`Oferta ${action} com sucesso!`);
    } catch (error: any) {
      console.error(`Error updating ${type}:`, error);
      toast.error(`Erro ao ${value ? 'adicionar' : 'remover'} oferta`);
    }
  };
  
  // Delete an offer
  const deleteOffer = async (offerId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("offers")
        .delete()
        .eq("id", offerId);
        
      if (error) throw error;
      
      // Update local state
      setOffers(prev => prev.filter(offer => offer.id !== offerId));
      
      // Remove from preferences
      setPinnedOffers(prev => {
        const updated = new Set(prev);
        updated.delete(offerId);
        return updated;
      });
      setFavoriteOffers(prev => {
        const updated = new Set(prev);
        updated.delete(offerId);
        return updated;
      });
      setArchivedOffers(prev => {
        const updated = new Set(prev);
        updated.delete(offerId);
        return updated;
      });
      
      toast.success("Oferta excluída com sucesso!");
    } catch (error: any) {
      console.error("Error deleting offer:", error);
      toast.error("Erro ao excluir oferta");
    }
  };

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;
    
    // Subscribe to changes in the ad_data table
    const adDataChannel = supabase
      .channel('ad-data-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ad_data'
      }, async (payload) => {
        // Refresh offers data when ad_data changes
        await fetchOffers();
      })
      .subscribe();
      
    // Subscribe to changes in the offers table
    const offersChannel = supabase
      .channel('offers-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'offers'
      }, async (payload) => {
        // Refresh offers data when offers changes
        await fetchOffers();
      })
      .subscribe();
      
    // Subscribe to changes in the user_preferences table
    const preferencesChannel = supabase
      .channel('preferences-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_preferences',
        filter: `user_id=eq.${user.id}`
      }, async (payload) => {
        // Refresh offers data when preferences change
        await fetchOffers();
      })
      .subscribe();
    
    return () => {
      // Clean up subscriptions
      supabase.removeChannel(adDataChannel);
      supabase.removeChannel(offersChannel);
      supabase.removeChannel(preferencesChannel);
    };
  }, [user]);
  
  // Initialize data loading when user changes
  useEffect(() => {
    if (user) {
      fetchOffers();
    } else {
      setOffers([]);
      setPinnedOffers(new Set());
      setFavoriteOffers(new Set());
      setArchivedOffers(new Set());
    }
  }, [user]);
  
  return {
    offers,
    loading,
    pinnedOffers,
    favoriteOffers,
    archivedOffers,
    addOffer,
    updateAdData,
    updateTotalPageAds,
    updateKeywords,
    pinOffer: (offer: Offer) => updatePreference(offer.id, 'pin', !pinnedOffers.has(offer.id)),
    favoriteOffer: (offer: Offer) => updatePreference(offer.id, 'favorite', !favoriteOffers.has(offer.id)),
    archiveOffer: (offer: Offer) => updatePreference(offer.id, 'archive', !archivedOffers.has(offer.id)),
    deleteOffer,
    refreshOffers: fetchOffers
  };
};
