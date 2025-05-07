
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AdDataFormProps {
  offerId: string;
  offerName: string;
  onSave: (offerId: string, activeAds: number) => void;
}

const AdDataForm = ({ offerId, offerName, onSave }: AdDataFormProps) => {
  const [activeAds, setActiveAds] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const adsCount = parseInt(activeAds);
    
    if (isNaN(adsCount) || adsCount < 0) {
      toast.error("Digite um número válido de anúncios");
      return;
    }
    
    onSave(offerId, adsCount);
    setActiveAds("");
    toast.success("Dados registrados com sucesso!");
  };
  
  return (
    <Card className="border border-gray-800 card-gradient">
      <CardHeader>
        <CardTitle className="text-base">Registrar anúncios para {offerName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activeAds">Anúncios ativos hoje</Label>
            <Input
              id="activeAds"
              type="number"
              min="0"
              placeholder="Quantidade de anúncios"
              value={activeAds}
              onChange={(e) => setActiveAds(e.target.value)}
              className="border-gray-700"
              required
            />
          </div>
          <Button type="submit" className="w-full">Registrar</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdDataForm;
