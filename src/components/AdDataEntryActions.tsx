import { useState } from "react";
import { AdData } from "@/types/offer";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogClose
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Clock, MoreVertical, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdDataEntryActionsProps {
  adData: AdData;
  onUpdate: (date: string, activeAds: number, observation: string, time?: string) => void;
  onDelete: (date: string) => void;
}

const AdDataEntryActions = ({ adData, onUpdate, onDelete }: AdDataEntryActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form state
  const [activeAds, setActiveAds] = useState(adData.activeAds.toString());
  const [observation, setObservation] = useState(adData.observation || "");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(adData.date));
  const [time, setTime] = useState(adData.time || format(new Date(), 'HH:mm'));
  
  const handleUpdate = () => {
    const adsCount = parseInt(activeAds);
    
    if (isNaN(adsCount) || adsCount < 0) {
      toast.error("Digite um número válido de anúncios");
      return;
    }
    
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    
    onUpdate(formattedDate, adsCount, observation, time);
    setIsEditDialogOpen(false);
    toast.success("Dados atualizados");
  };
  
  const handleDelete = () => {
    onDelete(adData.date);
    setIsDeleteDialogOpen(false);
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
          >
            <MoreVertical size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-gray-700 bg-slate-900">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)} className="cursor-pointer">
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-500 focus:text-red-500 cursor-pointer"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="border-slate-700 bg-slate-900 max-w-md">
          <DialogHeader>
            <DialogTitle>Editar dados de anúncios</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="activeAds">Anúncios ativos</Label>
              <Input
                id="activeAds"
                type="number"
                min="0"
                value={activeAds}
                onChange={(e) => setActiveAds(e.target.value)}
                className="border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observation">Observações</Label>
              <Textarea
                id="observation"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="min-h-[80px] border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Data e hora do registro</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline" 
                      className="w-[240px] justify-start text-left font-normal border-gray-700"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(selectedDate, "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
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
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-gray-700">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleUpdate}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="border-slate-700 bg-slate-900">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza de que deseja excluir este registro de anúncios do dia {format(new Date(adData.date), "dd/MM/yyyy")}?
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-gray-700">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdDataEntryActions;
