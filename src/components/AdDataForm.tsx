
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";

interface AdDataFormProps {
  offerId: string;
  offerName: string;
  onSave: (offerId: string, activeAds: number, date: string, observation: string, time?: string) => void;
  compact?: boolean;
}

const AdDataForm = ({ offerId, offerName, onSave, compact = false }: AdDataFormProps) => {
  const [activeAds, setActiveAds] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [observation, setObservation] = useState<string>("");
  const [time, setTime] = useState<string>("");
  
  // Time options in 30-minute intervals
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    timeOptions.push(`${hour.toString().padStart(2, '0')}:00`);
    timeOptions.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeAds || isNaN(Number(activeAds))) {
      toast.error("Por favor, insira um número válido de anúncios ativos");
      return;
    }

    // Format date as ISO string
    const isoDate = format(date, "yyyy-MM-dd");
    
    onSave(offerId, Number(activeAds), isoDate, observation, time);
    
    // Reset form
    setActiveAds("");
    setObservation("");
    
    toast.success(`Dados de anúncios para ${offerName} salvos com sucesso!`);
  };
  
  // Compact layout with more efficient use of space
  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2 items-center">
          <div>
            <Label htmlFor="active-ads-compact" className="text-xs mb-1 block">Anúncios ativos</Label>
            <Input
              id="active-ads-compact"
              type="number"
              min="0"
              placeholder="Número"
              value={activeAds}
              onChange={(e) => setActiveAds(e.target.value)}
              className="border-gray-700 h-8"
            />
          </div>
          
          <div>
            <Label htmlFor="date-compact" className="text-xs mb-1 block">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-compact"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-gray-700 h-8",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="time-compact" className="text-xs mb-1 block">Horário (opcional)</Label>
            <Select onValueChange={setTime} value={time}>
              <SelectTrigger className="border-gray-700 h-8">
                <SelectValue placeholder="Selecione">
                  {time ? (
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {time}
                    </div>
                  ) : (
                    "Selecione"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button type="submit" className="w-full h-8 text-sm">Registrar</Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor="observation-compact" className="text-xs mb-1 block">Observação (opcional)</Label>
          <Textarea
            id="observation-compact"
            placeholder="Adicione notas ou observações..."
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className="border-gray-700 min-h-[60px] resize-none"
          />
        </div>
      </form>
    );
  }
  
  // Original layout
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="active-ads">Anúncios ativos</Label>
        <Input
          id="active-ads"
          type="number"
          min="0"
          placeholder="Número de anúncios ativos"
          value={activeAds}
          onChange={(e) => setActiveAds(e.target.value)}
          className="border-gray-700"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date" 
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal border-gray-700",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="time">Horário (opcional)</Label>
        <Select onValueChange={setTime} value={time}>
          <SelectTrigger className="border-gray-700">
            <SelectValue placeholder="Selecione um horário">
              {time ? (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {time}
                </div>
              ) : (
                "Selecione um horário"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {timeOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="observation">Observação (opcional)</Label>
        <Textarea
          id="observation"
          placeholder="Adicione notas ou observações sobre os anúncios ativos"
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          className="border-gray-700 min-h-[100px]"
        />
      </div>
      
      <Button type="submit" className="w-full">Registrar Anúncios</Button>
    </form>
  );
};

export default AdDataForm;
