
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AdDataFormProps {
  offerId: string;
  offerName: string;
  onSave: (offerId: string, activeAds: number, date: string, observation: string, time?: string) => void;
  initialObservation?: string;
  initialActiveAds?: number;
}

const AdDataForm = ({ offerId, offerName, onSave, initialObservation = "", initialActiveAds = 0 }: AdDataFormProps) => {
  const [activeAds, setActiveAds] = useState(initialActiveAds ? initialActiveAds.toString() : "");
  const [date, setDate] = useState<Date>(new Date());
  const [observation, setObservation] = useState(initialObservation);
  const [time, setTime] = useState<string>(format(new Date(), 'HH:mm'));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const adsCount = parseInt(activeAds);
    
    if (isNaN(adsCount) || adsCount < 0) {
      toast.error("Digite um número válido de anúncios");
      return;
    }

    const formattedDate = format(date, "yyyy-MM-dd");
    
    onSave(offerId, adsCount, formattedDate, observation, time);
    setActiveAds("");
    setObservation("");
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
            <Label htmlFor="observation">Observações do dia</Label>
            <Textarea
              id="observation"
              placeholder="Observações sobre os anúncios deste dia"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="border-gray-700 min-h-[80px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Data e hora do registro</Label>
            <div className="flex gap-2">
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
              
              <div className="relative">
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border-gray-700 pl-9"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          <Button type="submit" className="w-full">Registrar</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdDataForm;
