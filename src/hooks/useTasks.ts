
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Task {
  id: string;
  offer_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export const useTasks = (offerId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch tasks for the offer
  const fetchTasks = async () => {
    if (!user || !offerId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("offer_id", offerId)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });
        
      if (error) throw error;
      
      setTasks(data || []);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      toast.error("Erro ao buscar tarefas");
    } finally {
      setLoading(false);
    }
  };
  
  // Add new task
  const addTask = async (offerId: string, title: string, description?: string) => {
    if (!user) return;
    
    try {
      const maxPositionResult = await supabase
        .from("tasks")
        .select("position")
        .eq("offer_id", offerId)
        .order("position", { ascending: false })
        .limit(1)
        .single();
        
      const nextPosition = maxPositionResult.error ? 0 : (maxPositionResult.data?.position || 0) + 1;
      
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ 
          offer_id: offerId, 
          title, 
          description: description || null,
          position: nextPosition
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      setTasks(prev => [...prev, data]);
      return data;
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast.error("Erro ao adicionar tarefa");
      throw error;
    }
  };
  
  // Update task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", taskId);
        
      if (error) throw error;
      
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, ...updates, updated_at: new Date().toISOString() } 
            : task
        )
      );
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error("Erro ao atualizar tarefa");
      throw error;
    }
  };
  
  // Delete task
  const deleteTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);
        
      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast.error("Erro ao excluir tarefa");
      throw error;
    }
  };
  
  // Reorder tasks by updating positions
  const reorderTasks = async (taskIds: string[]) => {
    if (!user) return;
    
    try {
      // Create batch update
      const updates = taskIds.map((id, index) => ({
        id,
        position: index
      }));
      
      // Update each task position sequentially
      for (const update of updates) {
        const { error } = await supabase
          .from("tasks")
          .update({ position: update.position })
          .eq("id", update.id);
          
        if (error) throw error;
      }
      
      // Update local state
      setTasks(prev => {
        const updatedTasks = [...prev];
        taskIds.forEach((id, index) => {
          const taskIndex = updatedTasks.findIndex(t => t.id === id);
          if (taskIndex !== -1) {
            updatedTasks[taskIndex] = {
              ...updatedTasks[taskIndex],
              position: index
            };
          }
        });
        return updatedTasks;
      });
    } catch (error: any) {
      console.error("Error reordering tasks:", error);
      toast.error("Erro ao reordenar tarefas");
      throw error;
    }
  };

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user || !offerId) return;
    
    fetchTasks();
    
    // Subscribe to changes in the tasks table for this offer
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `offer_id=eq.${offerId}`
      }, (payload) => {
        console.log('Task change detected:', payload);
        fetchTasks();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(tasksChannel);
    };
  }, [user, offerId]);
  
  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    refreshTasks: fetchTasks
  };
};
