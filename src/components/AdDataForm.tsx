
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AdDataFormProps {
  offerId: string;
  offerName: string;
  onSave: (offerId: string, activeAds: number, date: string) => void;
}

const AdDataForm = ({ offerId, offerName, onSave }: AdDataFormProps) => {
  const [activeAds, setActiveAds] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const adsCount = parseInt(activeAds);
    
    if (isNaN(adsCount) || adsCount < 0) {
      toast.error("Digite um número válido de anúncios");
      return;
    }

    const formattedDate = format(date, "yyyy-MM-dd");
    
    onSave(offerId, adsCount, formattedDate);
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
            <Label htmlFor="activeAds">Anúncios ativos</Label>
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
          
          <div className="space-y-2">
            <Label>Data do registro</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-gray-700",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Button type="submit" className="w-full">Registrar</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdDataForm;
