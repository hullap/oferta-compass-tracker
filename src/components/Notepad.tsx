
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, FileText, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const Notepad = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState("Nota sem título");
  const [content, setContent] = useState("");
  const [savedNote, setSavedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchNote();
    }
  }, [user]);
  
  const fetchNote = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('performance')
        .select('*')
        .eq('user_id', user.id)
        .eq('reason', 'note')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        // Convert performance record to a note format
        const noteData: Note = {
          id: data.id,
          title: data.today_goals || "Nota sem título",
          content: data.yesterday_achievements || "",
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        setSavedNote(noteData);
        setTitle(noteData.title);
        setContent(noteData.content);
      }
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
    }
  };
  
  const saveNote = async () => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    setLoading(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (savedNote) {
        // Update existing note using the performance table
        const { error } = await supabase
          .from('performance')
          .update({
            today_goals: title,
            yesterday_achievements: content,
            reason: 'note',
            updated_at: new Date().toISOString()
          })
          .eq('id', savedNote.id)
          .select();
        
        if (error) throw error;
        
        setSavedNote({
          ...savedNote,
          title,
          content,
          updated_at: new Date().toISOString()
        });
        
        toast.success("Nota salva com sucesso!");
      } else {
        // Create new note using the performance table
        const { data, error } = await supabase
          .from('performance')
          .insert({
            user_id: user.id,
            date: today,
            today_goals: title,
            yesterday_achievements: content,
            productivity_score: 5,  // Default value required by the schema
            reason: 'note'
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Convert to note format
        const newNote: Note = {
          id: data.id,
          title: data.today_goals || "",
          content: data.yesterday_achievements || "",
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        setSavedNote(newNote);
        toast.success("Nota criada com sucesso!");
      }
      
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Erro ao salvar nota: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const formatText = (format: string) => {
    if (!document.activeElement) return;
    
    // Obtenha o campo de texto ativo
    const textField = document.activeElement as HTMLTextAreaElement;
    
    if (textField && textField.id === 'noteContent') {
      const start = textField.selectionStart;
      const end = textField.selectionEnd;
      const selectedText = content.substring(start, end);
      let formattedText;
      
      switch (format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `_${selectedText}_`;
          break;
        case 'align-left':
          formattedText = `[left]${selectedText}[/left]`;
          break;
        case 'align-center':
          formattedText = `[center]${selectedText}[/center]`;
          break;
        case 'align-right':
          formattedText = `[right]${selectedText}[/right]`;
          break;
        default:
          return;
      }
      
      const newContent = 
        content.substring(0, start) + 
        formattedText + 
        content.substring(end);
      
      setContent(newContent);
      
      // Manter o foco e definir a seleção para depois do texto formatado
      setTimeout(() => {
        textField.focus();
        const newPosition = start + formattedText.length;
        textField.setSelectionRange(newPosition, newPosition);
      }, 10);
    }
  };
  
  const renderFormattedContent = () => {
    if (!content) return <p className="text-slate-400 italic">Sem conteúdo</p>;
    
    let formattedContent = content;
    
    // Converter marcações para HTML
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedContent = formattedContent.replace(/_(.*?)_/g, '<u>$1</u>');
    formattedContent = formattedContent.replace(/\[left\](.*?)\[\/left\]/g, '<div style="text-align:left">$1</div>');
    formattedContent = formattedContent.replace(/\[center\](.*?)\[\/center\]/g, '<div style="text-align:center">$1</div>');
    formattedContent = formattedContent.replace(/\[right\](.*?)\[\/right\]/g, '<div style="text-align:right">$1</div>');
    
    // Converter quebras de linha
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} className="prose prose-invert max-w-none" />;
  };
  
  return (
    <Card className="w-96 border border-slate-700 overflow-hidden shadow-xl">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-400" />
          <span>Bloco de Notas</span>
        </CardTitle>
        <Button 
          size="icon" 
          variant="ghost"
          className="h-8 w-8 hover:bg-slate-800 rounded-full"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Ver' : <Pencil size={16} />}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da nota"
              className="font-medium text-lg border-slate-700 bg-slate-800/30"
            />
            
            <div className="flex justify-center space-x-1 bg-slate-800 rounded-md p-1">
              <Button 
                type="button" 
                size="icon"
                variant="ghost"
                className="h-8 w-8" 
                onClick={() => formatText('bold')}
                title="Negrito"
              >
                <Bold size={16} />
              </Button>
              <Button 
                type="button" 
                size="icon"
                variant="ghost" 
                className="h-8 w-8"
                onClick={() => formatText('italic')}
                title="Itálico"
              >
                <Italic size={16} />
              </Button>
              <Button 
                type="button" 
                size="icon"
                variant="ghost" 
                className="h-8 w-8"
                onClick={() => formatText('underline')}
                title="Sublinhado"
              >
                <Underline size={16} />
              </Button>
              <div className="h-8 border-r border-slate-600 mx-1"></div>
              <Button 
                type="button" 
                size="icon"
                variant="ghost" 
                className="h-8 w-8"
                onClick={() => formatText('align-left')}
                title="Alinhar à esquerda"
              >
                <AlignLeft size={16} />
              </Button>
              <Button 
                type="button" 
                size="icon"
                variant="ghost" 
                className="h-8 w-8"
                onClick={() => formatText('align-center')}
                title="Centralizar"
              >
                <AlignCenter size={16} />
              </Button>
              <Button 
                type="button" 
                size="icon"
                variant="ghost" 
                className="h-8 w-8"
                onClick={() => formatText('align-right')}
                title="Alinhar à direita"
              >
                <AlignRight size={16} />
              </Button>
            </div>
            
            <Textarea
              id="noteContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva sua nota aqui..."
              className="h-48 border-slate-700 bg-slate-800/30 resize-none"
            />
            
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={saveNote}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Nota"}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">{title || "Nota sem título"}</h3>
            <div className="bg-slate-800/30 p-3 rounded-md border border-slate-700/50 min-h-[200px]">
              {renderFormattedContent()}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-slate-400 pt-0 flex justify-between">
        <span>
          {savedNote ? `Atualizado: ${new Date(savedNote.updated_at).toLocaleString('pt-BR')}` : "Nota não salva"}
        </span>
      </CardFooter>
    </Card>
  );
};
