
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChartLine, Calendar, CalendarCheck, Circle, CheckCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

interface PerformanceEntry {
  id: string;
  user_id: string;
  date: string;
  yesterday_achievements: string;
  today_goals: string;
  missed_opportunities: string;
  productivity_score: number;
  reason: string;
  created_at: string;
  updated_at: string;
}

const DailyPerformance = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [todayEntry, setTodayEntry] = useState<PerformanceEntry | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceEntry[]>([]);
  
  const [formData, setFormData] = useState({
    yesterday_achievements: "",
    today_goals: "",
    missed_opportunities: "",
    productivity_score: 5,
    reason: ""
  });
  
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Buscar o registro de hoje e o histórico
  useEffect(() => {
    if (!user) return;
    
    const fetchTodayEntry = async () => {
      try {
        const { data, error } = await supabase
          .from('performance')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setTodayEntry(data);
          setFormData({
            yesterday_achievements: data.yesterday_achievements || "",
            today_goals: data.today_goals || "",
            missed_opportunities: data.missed_opportunities || "",
            productivity_score: data.productivity_score || 5,
            reason: data.reason || ""
          });
        }
      } catch (error) {
        console.error('Erro ao buscar registro de hoje:', error);
      }
    };
    
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('performance')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(7);
        
        if (error) throw error;
        
        if (data) {
          setPerformanceHistory(data);
        }
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      }
    };
    
    fetchTodayEntry();
    fetchHistory();
  }, [user, today]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleScoreChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      productivity_score: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    setLoading(true);
    
    try {
      if (todayEntry) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('performance')
          .update({
            yesterday_achievements: formData.yesterday_achievements,
            today_goals: formData.today_goals,
            missed_opportunities: formData.missed_opportunities,
            productivity_score: formData.productivity_score,
            reason: formData.reason,
            updated_at: new Date().toISOString()
          })
          .eq('id', todayEntry.id);
        
        if (error) throw error;
        
        setTodayEntry({
          ...todayEntry,
          ...formData,
          updated_at: new Date().toISOString()
        });
        
        toast.success("Registro atualizado com sucesso!");
      } else {
        // Criar novo registro
        const { data, error } = await supabase
          .from('performance')
          .insert({
            user_id: user.id,
            date: today,
            yesterday_achievements: formData.yesterday_achievements,
            today_goals: formData.today_goals,
            missed_opportunities: formData.missed_opportunities,
            productivity_score: formData.productivity_score,
            reason: formData.reason
          })
          .select()
          .single();
        
        if (error) throw error;
        
        setTodayEntry(data);
        setPerformanceHistory(prev => [data, ...prev]);
        
        toast.success("Registro criado com sucesso!");
      }
      
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const renderScoreStars = (score: number) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <Button 
          key={i}
          type="button"
          size="icon"
          variant="ghost"
          className={`h-8 w-8 ${i <= formData.productivity_score 
            ? 'text-yellow-400 hover:text-yellow-300' 
            : 'text-gray-500 hover:text-gray-400'}`}
          onClick={() => handleScoreChange(i)}
        >
          <Star size={16} className={i <= formData.productivity_score ? 'fill-yellow-400' : ''} />
        </Button>
      );
    }
    return stars;
  };
  
  const renderProductivityChart = () => {
    const chartData = performanceHistory.slice().reverse();
    const maxScore = 10;
    const chartHeight = 60;
    
    return (
      <div className="mt-4">
        <div className="text-sm font-medium mb-2 text-slate-300">Produtividade dos últimos 7 dias</div>
        <div className="relative h-[60px] bg-slate-800/50 rounded-lg border border-slate-700/30 p-2">
          <div className="absolute top-0 left-0 right-0 flex justify-between px-2">
            {chartData.map((entry, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-1.5 bg-blue-500 rounded-t-sm transition-all"
                  style={{ 
                    height: `${(entry.productivity_score / maxScore) * chartHeight}px`,
                    backgroundColor: getProductivityColor(entry.productivity_score)
                  }}
                ></div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {format(new Date(entry.date), 'dd/MM')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const getProductivityColor = (score: number) => {
    if (score >= 8) return 'rgb(16, 185, 129)';  // Verde para alta produtividade
    if (score >= 5) return 'rgb(245, 158, 11)';  // Amarelo para média produtividade
    return 'rgb(239, 68, 68)';  // Vermelho para baixa produtividade
  };
  
  return (
    <Card className={`border border-slate-700 overflow-hidden transition-all ${
      isExpanded ? 'w-96' : 'w-80'
    }`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-blue-400" />
            <span>Desempenho Diário</span>
          </div>
          <Button 
            size="icon" 
            variant="ghost"
            className="h-8 w-8 hover:bg-slate-800 rounded-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '-' : '+'}
          </Button>
        </CardTitle>
        <CardDescription>
          {todayEntry 
            ? `Produtividade de hoje: ${todayEntry.productivity_score}/10` 
            : 'Registre seu desempenho de hoje'}
        </CardDescription>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="yesterday_achievements">O que fiz ontem?</Label>
                <Textarea
                  id="yesterday_achievements"
                  name="yesterday_achievements"
                  value={formData.yesterday_achievements}
                  onChange={handleInputChange}
                  placeholder="Liste suas conquistas de ontem"
                  className="min-h-[80px] border-slate-700 bg-slate-800/30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="today_goals">O que vou fazer hoje?</Label>
                <Textarea
                  id="today_goals"
                  name="today_goals"
                  value={formData.today_goals}
                  onChange={handleInputChange}
                  placeholder="Liste suas metas para hoje"
                  className="min-h-[80px] border-slate-700 bg-slate-800/30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="missed_opportunities">O que deixei de fazer?</Label>
                <Textarea
                  id="missed_opportunities"
                  name="missed_opportunities"
                  value={formData.missed_opportunities}
                  onChange={handleInputChange}
                  placeholder="O que poderia ter feito melhor?"
                  className="min-h-[80px] border-slate-700 bg-slate-800/30"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Produtividade hoje (1-10)</Label>
                <div className="flex flex-wrap gap-1 justify-center">
                  {renderScoreStars(formData.productivity_score)}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo da nota</Label>
                <Input
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Por que você deu esta nota?"
                  className="border-slate-700 bg-slate-800/30"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          ) : (
            <>
              {todayEntry ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-1">O que fiz ontem:</h4>
                    <p className="text-sm text-slate-400 bg-slate-800/30 p-2 rounded border border-slate-700/30">
                      {todayEntry.yesterday_achievements || "Sem registro"}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-1">O que vou fazer hoje:</h4>
                    <p className="text-sm text-slate-400 bg-slate-800/30 p-2 rounded border border-slate-700/30">
                      {todayEntry.today_goals || "Sem registro"}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-1">O que deixei de fazer:</h4>
                    <p className="text-sm text-slate-400 bg-slate-800/30 p-2 rounded border border-slate-700/30">
                      {todayEntry.missed_opportunities || "Sem registro"}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-1">Produtividade:</h4>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold" style={{ color: getProductivityColor(todayEntry.productivity_score) }}>
                        {todayEntry.productivity_score}/10
                      </div>
                      <p className="text-sm text-slate-400">
                        {todayEntry.reason ? `- ${todayEntry.reason}` : ""}
                      </p>
                    </div>
                  </div>
                  
                  {performanceHistory.length > 1 && renderProductivityChart()}
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar registro de hoje
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <Calendar className="h-12 w-12 text-blue-400 mb-2 opacity-70" />
                  <p className="text-sm text-slate-400 text-center mb-4">
                    Você ainda não registrou seu desempenho hoje
                  </p>
                  <Button onClick={() => setIsEditing(true)}>
                    Registrar agora
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
      
      {!isExpanded && todayEntry && (
        <CardFooter className="flex justify-between text-xs text-slate-400 pt-0">
          <div>Última atualização: {format(new Date(todayEntry.updated_at), 'HH:mm')}</div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto hover:bg-transparent hover:text-white"
            onClick={() => {
              setIsExpanded(true);
              setIsEditing(true);
            }}
          >
            Editar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default DailyPerformance;
