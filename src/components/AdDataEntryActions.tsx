
import { useState } from "react";
import { Button } from "./ui/button";
import { AdData } from "@/types/offer";
import { Edit2, Trash2, Calendar, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

interface AdDataEntryActionsProps {
  adData: AdData;
  onUpdate: (date: string, activeAds: number, observation: string, time?: string) => void;
  onDelete: (date: string) => void;
}

const AdDataEntryActions = ({ adData, onUpdate, onDelete }: AdDataEntryActionsProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeAds, setActiveAds] = useState(adData.activeAds.toString());
  const [observation, setObservation] = useState(adData.observation || '');
  const [time, setTime] = useState(adData.time || formatTimeForInput(new Date()));
  
  function formatTimeForInput(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  
  const handleUpdate = () => {
    onUpdate(adData.date, parseInt(activeAds, 10), observation, time);
    setEditDialogOpen(false);
  };

  const handleDelete = () => {
    onDelete(adData.date);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
            <Edit2 size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 border-slate-700 bg-slate-900">
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)} className="hover:bg-slate-800">
            <Edit2 className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-400 hover:text-red-300 hover:bg-slate-800"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="border-slate-700 bg-slate-900">
          <DialogHeader>
            <DialogTitle>Editar registro de anúncios</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar size={14} />
                  Data
                </Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={adData.date} 
                  disabled 
                  className="border-slate-700 bg-slate-800/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock size={14} />
                  Horário
                </Label>
                <Input 
                  id="time" 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border-slate-700 bg-slate-800/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="active-ads">Anúncios ativos</Label>
              <Input 
                id="active-ads" 
                type="number" 
                min="0"
                value={activeAds}
                onChange={(e) => setActiveAds(e.target.value)}
                className="border-slate-700 bg-slate-800/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observation">Observação</Label>
              <Textarea 
                id="observation" 
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="border-slate-700 bg-slate-800/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              className="border-slate-700"
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleUpdate}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-slate-700 bg-slate-900">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Tem certeza que deseja excluir o registro de {new Date(adData.date).toLocaleDateString('pt-BR')}?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="border-slate-700"
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdDataEntryActions;
