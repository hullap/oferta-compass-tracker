
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ChartLine, ArrowLeft, Link } from "lucide-react";

interface NewOfferFormProps {
  onSubmit: (name: string, description: string, facebookAdLibraryUrl?: string) => void;
  onCancel: () => void;
}

const NewOfferForm = ({ onSubmit, onCancel }: NewOfferFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [facebookAdLibraryUrl, setFacebookAdLibraryUrl] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, description, facebookAdLibraryUrl);
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={onCancel} className="mr-4 border-slate-700">
          <ArrowLeft size={16} className="mr-2" />
          Voltar
        </Button>
        <h2 className="text-xl font-bold">Nova Oferta</h2>
      </div>
      
      <Card className="border-slate-700 card-gradient max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
              <ChartLine className="h-5 w-5" />
            </div>
            <span>Adicionar nova oferta</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="offer-name">Nome da oferta</Label>
              <Input 
                id="offer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Curso de Marketing Digital"
                required
                className="border-slate-700 bg-slate-800/50"
              />
              <p className="text-xs text-muted-foreground">
                Dê um nome claro para identificar a oferta.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="offer-description">Descrição</Label>
              <Textarea 
                id="offer-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Curso de Marketing Digital com foco em tráfego pago"
                className="border-slate-700 bg-slate-800/50"
              />
              <p className="text-xs text-muted-foreground">
                Adicione detalhes que ajudem a identificar esta oferta.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="facebook-ad-library-url" className="flex items-center gap-2">
                <Link size={14} />
                URL da Biblioteca de Anúncios do Facebook
              </Label>
              <Input 
                id="facebook-ad-library-url"
                value={facebookAdLibraryUrl}
                onChange={(e) => setFacebookAdLibraryUrl(e.target.value)}
                placeholder="Ex: https://www.facebook.com/ads/library/..."
                type="url"
                className="border-slate-700 bg-slate-800/50"
              />
              <p className="text-xs text-muted-foreground">
                Cole o link da Biblioteca de Anúncios do Facebook para acessar rapidamente.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="border-slate-700"
              >
                Cancelar
              </Button>
              <Button type="submit">Criar Oferta</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewOfferForm;
