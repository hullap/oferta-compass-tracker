
import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  GripVertical,
  Plus
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  position: number;
}

interface TaskListProps {
  offerId: string;
  offerName: string;
  onAddTask: (offerId: string, title: string, description?: string) => Promise<any>; // Updated return type to be more flexible
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onReorderTasks: (taskIds: string[]) => Promise<void>;
  tasks: Task[];
}

const TaskList = ({ 
  offerId, 
  offerName, 
  onAddTask, 
  onUpdateTask, 
  onDeleteTask, 
  onReorderTasks,
  tasks 
}: TaskListProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error("O título da tarefa não pode estar vazio");
      return;
    }
    
    try {
      await onAddTask(offerId, newTaskTitle.trim());
      setNewTaskTitle("");
      setIsAddingTask(false);
      toast.success("Tarefa adicionada");
    } catch (error) {
      toast.error("Erro ao adicionar tarefa");
      console.error(error);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await onUpdateTask(task.id, { 
        is_completed: !task.is_completed 
      });
    } catch (error) {
      toast.error("Erro ao atualizar tarefa");
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await onDeleteTask(taskId);
      toast.success("Tarefa removida");
    } catch (error) {
      toast.error("Erro ao remover tarefa");
      console.error(error);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const handleSaveEdit = async () => {
    if (!editingTaskId) return;
    if (!editTitle.trim()) {
      toast.error("O título da tarefa não pode estar vazio");
      return;
    }

    try {
      await onUpdateTask(editingTaskId, {
        title: editTitle.trim(),
        description: editDescription.trim() || null
      });
      setEditingTaskId(null);
      toast.success("Tarefa atualizada");
    } catch (error) {
      toast.error("Erro ao atualizar tarefa");
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  // Sort tasks by position
  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

  return (
    <Card className="border border-gray-800 card-gradient">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Lista de Tarefas - {offerName}</span>
          <Button 
            size="sm" 
            variant={isAddingTask ? "destructive" : "default"} 
            onClick={() => setIsAddingTask(!isAddingTask)}
          >
            {isAddingTask ? "Cancelar" : "Nova Tarefa"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAddingTask && (
          <div className="mb-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <Input
              placeholder="Título da tarefa"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="mb-2 border-slate-700"
            />
            <div className="flex justify-end">
              <Button onClick={handleAddTask} size="sm">
                <Plus size={16} className="mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        )}

        {sortedTasks.length > 0 ? (
          <div className="space-y-2">
            {sortedTasks.map((task) => (
              <div 
                key={task.id}
                className={`bg-slate-800/30 border ${task.is_completed ? 'border-green-800/30' : 'border-slate-700'} 
                  rounded-lg p-3 transition-colors`}
              >
                {editingTaskId === task.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="mb-2 border-slate-700"
                    />
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Descrição (opcional)"
                      className="min-h-[80px] border-slate-700"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex gap-2 items-start flex-1 cursor-pointer"
                        onClick={() => handleToggleComplete(task)}
                      >
                        <div className="mt-0.5">
                          {task.is_completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={task.is_completed ? "line-through text-muted-foreground" : ""}>
                            {task.title}
                          </p>
                          {task.description && expandedTaskId === task.id && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-slate-700 rounded-full"
                          onClick={() => setExpandedTaskId(
                            expandedTaskId === task.id ? null : task.id
                          )}
                        >
                          <GripVertical className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-slate-700 rounded-full"
                          onClick={() => handleStartEdit(task)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-800/30 text-red-400 rounded-full"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {task.description && expandedTaskId !== task.id && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-muted-foreground hover:text-white mt-1"
                        onClick={() => setExpandedTaskId(task.id)}
                      >
                        Mostrar detalhes
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma tarefa cadastrada</p>
            <p className="text-sm">Clique em "Nova Tarefa" para adicionar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;
