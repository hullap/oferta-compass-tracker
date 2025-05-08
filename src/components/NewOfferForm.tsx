
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { Link } from "lucide-react";

interface NewOfferFormProps {
  onSubmit: (name: string, description: string, facebookAdLibraryUrl: string) => void;
  onCancel: () => void;
}

const NewOfferForm = ({ onSubmit, onCancel }: NewOfferFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [facebookAdLibraryUrl, setFacebookAdLibraryUrl] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("O nome da oferta é obrigatório");
      return;
    }
    
    onSubmit(name.trim(), description.trim(), facebookAdLibraryUrl.trim());
    setName("");
    setDescription("");
    setFacebookAdLibraryUrl("");
  };
  
  return (
    <Card className="border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader className="border-b border-slate-700/50 pb-4">
          <CardTitle className="text-xl bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Nova Oferta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Nome da Oferta</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Curso de Marketing Digital"
              className="border-slate-700 bg-slate-800/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição da oferta..."
              className="resize-none h-20 border-slate-700 bg-slate-800/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebookAdLibraryUrl" className="text-slate-300 flex items-center gap-1.5">
              <Link size={16} className="text-blue-400" />
              Link da Biblioteca de Anúncios
            </Label>
            <Input
              id="facebookAdLibraryUrl"
              type="url"
              value={facebookAdLibraryUrl}
              onChange={(e) => setFacebookAdLibraryUrl(e.target.value)}
              placeholder="URL da biblioteca de anúncios do Facebook"
              className="border-slate-700 bg-slate-800/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400">
              URL da página do Facebook Ad Library para esta oferta (opcional)
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2 border-t border-slate-700/50">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
          >
            Adicionar Oferta
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NewOfferForm;
