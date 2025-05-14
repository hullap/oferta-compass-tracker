
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notepad } from "@/components/Notepad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2,
  Save,
  Bookmark,
  CalendarDays
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_favorite?: boolean;
}

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const activeNote = notes.find(note => note.id === activeNoteId);
  
  // Filter notes based on search term
  const filteredNotes = notes.filter(note => {
    const searchLower = searchTerm.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) || 
      note.content.toLowerCase().includes(searchLower)
    );
  });
  
  // Get favorite notes
  const favoriteNotes = filteredNotes.filter(note => note.is_favorite);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      setNotes(data || []);
      
      // Set first note as active if none is selected
      if (data.length > 0 && !activeNoteId) {
        setActiveNoteId(data[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching notes:', error.message);
      toast({
        title: "Erro ao carregar notas",
        description: "Não foi possível carregar suas notas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewNote = async () => {
    if (!user) return;
    
    try {
      const newNote = {
        title: "Nova Nota",
        content: "",
        user_id: user.id,
        is_favorite: false
      };
      
      const { data, error } = await supabase
        .from('notes')
        .insert(newNote)
        .select()
        .single();
      
      if (error) throw error;
      
      setNotes(prevNotes => [data, ...prevNotes]);
      setActiveNoteId(data.id);
      
      toast({
        title: "Nota criada",
        description: "Nova nota criada com sucesso!",
      });
    } catch (error: any) {
      console.error('Error creating note:', error.message);
      toast({
        title: "Erro ao criar nota",
        description: "Não foi possível criar uma nova nota.",
        variant: "destructive"
      });
    }
  };
  
  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setNotes(prevNotes => prevNotes.map(note => {
        if (note.id === id) {
          return {
            ...note,
            ...updates,
            updated_at: new Date().toISOString()
          };
        }
        return note;
      }));
      
      toast({
        title: "Nota salva",
        description: "Suas alterações foram salvas.",
      });
    } catch (error: any) {
      console.error('Error updating note:', error.message);
      toast({
        title: "Erro ao salvar nota",
        description: "Não foi possível salvar suas alterações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const deleteNote = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      
      // If the deleted note was active, select another note
      if (activeNoteId === id) {
        const remainingNotes = notes.filter(note => note.id !== id);
        setActiveNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
      }
      
      toast({
        title: "Nota excluída",
        description: "A nota foi excluída com sucesso.",
      });
    } catch (error: any) {
      console.error('Error deleting note:', error.message);
      toast({
        title: "Erro ao excluir nota",
        description: "Não foi possível excluir a nota.",
        variant: "destructive"
      });
    }
  };
  
  const toggleFavorite = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    await updateNote(id, { is_favorite: !note.is_favorite });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <h1 className="text-2xl font-bold">Notas</h1>
        <div className="flex gap-2">
          <Button 
            onClick={createNewNote}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Plus size={18} className="mr-1" />
            Nova Nota
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lista de Notas</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <Input 
                placeholder="Buscar notas..." 
                className="pl-10 bg-slate-800/50 border-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-slate-900">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="favorites">Favoritas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="m-0">
                <div className="max-h-[500px] overflow-y-auto">
                  {loading ? (
                    <div className="p-6 text-center text-slate-400">
                      Carregando notas...
                    </div>
                  ) : filteredNotes.length > 0 ? (
                    <ul className="divide-y divide-slate-700">
                      {filteredNotes.map((note) => (
                        <li 
                          key={note.id}
                          onClick={() => setActiveNoteId(note.id)}
                          className={`p-4 cursor-pointer hover:bg-slate-700/30 transition-colors ${
                            note.id === activeNoteId ? 'bg-slate-700/50' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              <FileText size={18} className="mt-1 mr-2 text-slate-400" />
                              <div>
                                <h3 className="font-medium">{note.title}</h3>
                                <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                                  {note.content || "Sem conteúdo"}
                                </p>
                              </div>
                            </div>
                            {note.is_favorite && (
                              <Bookmark size={16} className="text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center mt-2 text-xs text-slate-500">
                            <CalendarDays size={12} className="mr-1" />
                            {formatDate(note.updated_at)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-center text-slate-400">
                      {searchTerm ? "Nenhuma nota encontrada" : "Nenhuma nota criada"}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="favorites" className="m-0">
                <div className="max-h-[500px] overflow-y-auto">
                  {loading ? (
                    <div className="p-6 text-center text-slate-400">
                      Carregando notas...
                    </div>
                  ) : favoriteNotes.length > 0 ? (
                    <ul className="divide-y divide-slate-700">
                      {favoriteNotes.map((note) => (
                        <li 
                          key={note.id}
                          onClick={() => setActiveNoteId(note.id)}
                          className={`p-4 cursor-pointer hover:bg-slate-700/30 transition-colors ${
                            note.id === activeNoteId ? 'bg-slate-700/50' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              <FileText size={18} className="mt-1 mr-2 text-slate-400" />
                              <div>
                                <h3 className="font-medium">{note.title}</h3>
                                <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                                  {note.content || "Sem conteúdo"}
                                </p>
                              </div>
                            </div>
                            <Bookmark size={16} className="text-yellow-500 fill-yellow-500" />
                          </div>
                          <div className="flex items-center mt-2 text-xs text-slate-500">
                            <CalendarDays size={12} className="mr-1" />
                            {formatDate(note.updated_at)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-center text-slate-400">
                      {searchTerm ? "Nenhuma nota favorita encontrada" : "Nenhuma nota favorita"}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-start justify-between">
            <div className="flex-1 pr-4">
              {activeNote ? (
                <Input
                  className="text-lg font-medium bg-transparent border-0 border-b border-slate-700 rounded-none px-0 h-auto focus-visible:ring-0 focus-visible:border-slate-500"
                  value={activeNote?.title || ""}
                  onChange={(e) => {
                    const updatedNotes = notes.map(note =>
                      note.id === activeNoteId ? { ...note, title: e.target.value } : note
                    );
                    setNotes(updatedNotes);
                  }}
                  onBlur={() => {
                    if (activeNoteId) {
                      updateNote(activeNoteId, { title: activeNote.title });
                    }
                  }}
                />
              ) : (
                <CardTitle className="text-lg text-slate-400">Selecione ou crie uma nota</CardTitle>
              )}
              {activeNote && (
                <div className="flex items-center text-xs text-slate-400 mt-2">
                  <span>Última atualização: {formatDate(activeNote.updated_at)}</span>
                </div>
              )}
            </div>
            {activeNote && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 hover:bg-slate-700 text-yellow-500 hover:text-yellow-400"
                  onClick={() => toggleFavorite(activeNote.id)}
                >
                  <Bookmark
                    size={16}
                    className={activeNote.is_favorite ? "fill-yellow-500" : ""}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 hover:bg-slate-700 text-blue-500 hover:text-blue-400"
                  onClick={() => {
                    if (activeNoteId) {
                      updateNote(activeNoteId, { content: activeNote.content });
                    }
                  }}
                  disabled={saving}
                >
                  <Save size={16} className="mr-1" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 hover:bg-red-900/30 text-red-500 hover:text-red-400"
                  onClick={() => {
                    if (activeNoteId) {
                      deleteNote(activeNoteId);
                    }
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {activeNote ? (
              <Notepad
                initialValue={activeNote.content}
                onChange={(value) => {
                  const updatedNotes = notes.map(note =>
                    note.id === activeNoteId ? { ...note, content: value } : note
                  );
                  setNotes(updatedNotes);
                }}
                onBlur={() => {
                  if (activeNoteId) {
                    updateNote(activeNoteId, { content: activeNote.content });
                  }
                }}
                className="min-h-[400px]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-10 text-center text-slate-400">
                <FileText size={48} className="mb-4 opacity-40" />
                <h3 className="text-lg font-medium mb-2">Nenhuma nota selecionada</h3>
                <p className="mb-4">Selecione uma nota existente ou crie uma nova para começar</p>
                <Button onClick={createNewNote}>
                  <Plus size={18} className="mr-1" />
                  Nova Nota
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotesPage;
