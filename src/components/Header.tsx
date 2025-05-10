
import { ChartLine, Plus, LogOut, RefreshCcw, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Link } from "react-router-dom";
import { useState } from "react";
import DailyPerformance from "./DailyPerformance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Notepad } from "./Notepad";

interface HeaderProps {
  onNewOfferClick: () => void;
  onRefreshData?: () => void;
}

const Header = ({ onNewOfferClick, onRefreshData }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const [showPerformance, setShowPerformance] = useState(false);
  const [showNotepad, setShowNotepad] = useState(false);
  
  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : "U";
    
  return (
    <header className="flex justify-between items-center py-4 px-4 md:px-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 sticky top-0 z-10 backdrop-blur-md bg-opacity-90">
      <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-lg">
          <ChartLine className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">Ad Tracker Pro</h1>
          <p className="text-xs text-slate-400">Monitoramento de anúncios</p>
        </div>
      </Link>
      
      <div className="fixed right-1/2 transform translate-x-1/2 z-20 top-16">
        {showPerformance && <DailyPerformance />}
        {showNotepad && <Notepad />}
      </div>
      
      <div className="flex items-center gap-3">
        {onRefreshData && (
          <Button
            onClick={onRefreshData}
            size="icon"
            variant="outline"
            className="rounded-full border border-slate-700 hover:bg-slate-800 hover:border-blue-500"
            title="Atualizar dados"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          className={`border ${showPerformance ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700'} hover:border-blue-500 hover:bg-slate-800`}
          onClick={() => {
            setShowPerformance(!showPerformance);
            if (!showPerformance) setShowNotepad(false);
          }}
        >
          Desempenho
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          className={`border ${showNotepad ? 'border-purple-500 bg-purple-900/20' : 'border-slate-700'} hover:border-purple-500 hover:bg-slate-800`}
          onClick={() => {
            setShowNotepad(!showNotepad);
            if (!showNotepad) setShowPerformance(false);
          }}
        >
          <FileText className="mr-1 h-4 w-4" />
          Notas
        </Button>
        
        <Button 
          onClick={onNewOfferClick} 
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Oferta</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full border border-slate-700 hover:bg-slate-800 transition-colors">
              <Avatar className="border-2 border-slate-600">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border border-slate-700 bg-slate-900 shadow-xl">
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-sm font-medium text-slate-100">{user?.email}</p>
              <p className="text-xs text-slate-400 mt-1">Conta logada</p>
            </div>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="text-red-400 hover:text-red-300 hover:bg-slate-800 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
