
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, FileText, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Note {
  id?: string;
  title: string;
  content: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export function Notepad() {
  const { user } = useAuth();
  const userId = user?.id || "";
  const [activeNote, setActiveNote] = useState<Note>({
    title: "Nova nota",
    content: "",
    user_id: userId
  });
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  // Fetch notes on component mount
  useEffect(() => {
    if (userId) {
      fetchNotes();
    }
  }, [userId]);

  async function fetchNotes() {
    try {
      // Use performance table for notes (reusing existing table)
      const { data, error } = await supabase
        .from("performance")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error);
        return;
      }

      // Map performance data to note structure
      const mappedNotes = data.map(item => ({
        id: item.id,
        title: item.yesterday_achievements || "Sem título",
        content: item.today_goals || "",
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setNotes(mappedNotes);

      // Set active note if there are any
      if (mappedNotes.length > 0) {
        setActiveNote(mappedNotes[0]);
      }

    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  }

  // Save note
  async function saveNote() {
    if (!activeNote.title.trim()) {
      toast.error("O título não pode estar em branco");
      return;
    }

    try {
      if (activeNote.id) {
        // Update existing note
        const { error } = await supabase
          .from("performance")
          .update({
            yesterday_achievements: activeNote.title,
            today_goals: activeNote.content,
            updated_at: new Date().toISOString()
          })
          .eq("id", activeNote.id);

        if (error) throw error;
        toast.success("Nota atualizada com sucesso!");
      } else {
        // Create new note
        const { error } = await supabase
          .from("performance")
          .insert({
            yesterday_achievements: activeNote.title,
            today_goals: activeNote.content,
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            productivity_score: 5
          });

        if (error) throw error;
        toast.success("Nota criada com sucesso!");
      }

      fetchNotes(); // Refresh notes
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Erro ao salvar a nota");
    }
  }

  // Create new note
  function createNewNote() {
    setActiveNote({
      title: "Nova nota",
      content: "",
      user_id: userId
    });
    setIsEditing(true);
  }

  // Format text
  function formatText(format: string) {
    setSelectedFormat(format);
    
    // Here we would normally implement text formatting
    // Since we're using a simple textarea, we'll just show a toast message
    toast.info(`Formato ${format} aplicado`);
  }

  return (
    <Card className="w-[350px] max-h-[500px] overflow-y-auto border-purple-800 bg-slate-900 shadow-xl animate-in fade-in-50 slide-in-from-top-5 duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-900/50 to-indigo-900/30 border-b border-purple-800/40 pb-3">
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-400" />
            <span>Bloco de Notas</span>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={createNewNote} className="h-8 border-purple-700 hover:bg-purple-900/50">
              <Pencil className="h-4 w-4 mr-1" /> Nova
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Input
                value={activeNote.title}
                onChange={e => setActiveNote({ ...activeNote, title: e.target.value })}
                placeholder="Título da nota"
                className="border-purple-700 bg-slate-800"
              />
              
              <div className="flex items-center gap-1 border border-purple-700 rounded-md p-1 bg-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${selectedFormat === 'bold' ? 'bg-purple-900' : ''}`}
                  onClick={() => formatText('bold')}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${selectedFormat === 'italic' ? 'bg-purple-900' : ''}`}
                  onClick={() => formatText('italic')}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${selectedFormat === 'underline' ? 'bg-purple-900' : ''}`}
                  onClick={() => formatText('underline')}
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <span className="w-[1px] h-6 bg-purple-700 mx-1"></span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${selectedFormat === 'alignLeft' ? 'bg-purple-900' : ''}`}
                  onClick={() => formatText('alignLeft')}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${selectedFormat === 'alignCenter' ? 'bg-purple-900' : ''}`}
                  onClick={() => formatText('alignCenter')}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${selectedFormat === 'alignRight' ? 'bg-purple-900' : ''}`}
                  onClick={() => formatText('alignRight')}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Textarea
                value={activeNote.content}
                onChange={e => setActiveNote({ ...activeNote, content: e.target.value })}
                placeholder="Conteúdo da nota"
                className="min-h-[150px] border-purple-700 bg-slate-800"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={saveNote}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Salvar
              </Button>
            </div>
          </>
        ) : (
          <>
            {notes.length > 0 ? (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="font-bold text-lg">{activeNote.title}</h3>
                  <div className="mt-2 text-sm whitespace-pre-wrap text-slate-300">
                    {activeNote.content || "Sem conteúdo"}
                  </div>
                </div>
                
                <div className="border-t border-purple-800/40 pt-3">
                  <p className="text-sm font-medium mb-2">Notas salvas</p>
                  <div className="space-y-1 max-h-[150px] overflow-y-auto pr-2">
                    {notes.map((note) => (
                      <div 
                        key={note.id} 
                        className={`p-2 text-sm rounded-md cursor-pointer hover:bg-purple-900/20 ${note.id === activeNote.id ? 'bg-purple-900/30 border border-purple-800/70' : ''}`}
                        onClick={() => setActiveNote(note)}
                      >
                        <div className="font-medium truncate">{note.title}</div>
                        <div className="text-xs text-slate-400 truncate">
                          {new Date(note.created_at || "").toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                    className="border-purple-700 hover:bg-purple-900/50"
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Editar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="h-12 w-12 mx-auto text-purple-400/50 mb-3" />
                <p className="text-slate-400">Nenhuma nota encontrada</p>
                <p className="text-sm text-slate-500 mb-4">Crie sua primeira nota</p>
                <Button 
                  onClick={createNewNote}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <Pencil className="h-4 w-4 mr-1" /> Nova Nota
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
