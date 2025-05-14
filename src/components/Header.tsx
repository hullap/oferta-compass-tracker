
import { Plus, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  onNewOfferClick: () => void;
  onRefreshData?: () => void;
  minimal?: boolean;
}

const Header = ({ onNewOfferClick, onRefreshData, minimal = false }: HeaderProps) => {
  const { user, signOut } = useAuth();
  
  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : "U";
    
  return (
    <header className="flex justify-between items-center py-4 px-4 md:px-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-90 relative">
      {!minimal && (
        <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
          <div className="bg-gradient-to-br from-red-600 to-red-700 p-2.5 rounded-xl shadow-lg">
            <span className="text-white text-sm">✓</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-400 text-transparent bg-clip-text">OfferTracker</h1>
            <p className="text-xs text-slate-400">Monitoramento de anúncios</p>
          </div>
        </Link>
      )}
      
      {/* Espaço flexível central */}
      <div className="flex-1"></div>
      
      {/* Área de perfil à direita */}
      <div className="flex items-center gap-3">
        {!minimal && (
          <Button 
            onClick={onNewOfferClick} 
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Oferta</span>
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full border border-slate-700 hover:bg-slate-800 transition-colors">
              <Avatar className="border-2 border-slate-600">
                <AvatarFallback className="bg-gradient-to-br from-red-600 to-red-700 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border border-slate-700 bg-slate-900 shadow-xl z-50">
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
