
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";

interface NewOfferFormProps {
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
}

const NewOfferForm = ({ onSubmit, onCancel }: NewOfferFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("O nome da oferta é obrigatório");
      return;
    }
    
    onSubmit(name.trim(), description.trim());
    setName("");
    setDescription("");
  };
  
  return (
    <Card className="border border-gray-800 card-gradient">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-xl">Nova Oferta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Oferta</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Curso de Marketing Digital"
              className="border-gray-700"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição da oferta..."
              className="resize-none h-20 border-gray-700"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Adicionar Oferta</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NewOfferForm;
