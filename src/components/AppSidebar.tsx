
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  PieChart, 
  ShoppingCart, 
  Tags, 
  Package, 
  Users, 
  Settings,
  ChevronDown,
  Plus, 
  RefreshCcw,
  FileText,
  ChartBar,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppSidebarProps {
  onNewOfferClick?: () => void;
  onRefreshData?: () => void;
}

const AppSidebar = ({ onNewOfferClick, onRefreshData }: AppSidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNewOfferClick = () => {
    if (onNewOfferClick) {
      onNewOfferClick();
    }
  };

  const handleRefreshData = () => {
    if (onRefreshData) {
      onRefreshData();
      toast.success("Dados atualizados com sucesso!");
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed top-4 left-4 z-50 bg-slate-800 border-slate-700 shadow-lg"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      )}
      
      <div className={cn(
        "sidebar transition-all duration-300",
        isCollapsed && isMobile ? "translate-x-[-100%]" : "translate-x-0",
        !isCollapsed && "shadow-2xl"
      )}>
        <div className="p-4 flex items-center">
          <div className="text-red-500 font-bold text-xl">
            <span className="bg-red-500 text-white p-1 rounded mr-1">
              <span className="text-sm">✓</span>
            </span>
            OfferTracker
          </div>
        </div>

        {/* Botões de ação principais */}
        <div className="px-4 py-3 space-y-3">
          <Button 
            onClick={handleNewOfferClick} 
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Oferta
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-indigo-900/50 hover:border-indigo-700 hover:bg-indigo-900/20"
            onClick={handleRefreshData}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Atualizar Dados
          </Button>
        </div>
        
        <div className="mt-4">
          <ul>
            <SidebarItem 
              icon={<LayoutDashboard size={18} />} 
              label="Dashboard" 
              path="/" 
              active={isActive("/")} 
            />
            <SidebarItem 
              icon={<ShoppingCart size={18} />} 
              label="Ofertas" 
              path="/offers" 
              active={isActive("/offers")} 
            />
            <SidebarItem 
              icon={<PieChart size={18} />} 
              label="Análises" 
              path="/analytics" 
              active={isActive("/analytics")} 
            />
            <SidebarItem 
              icon={<FileText size={18} />} 
              label="Notas" 
              path="/notes" 
              active={isActive("/notes")} 
            />
            
            <div className="px-4 pt-6 pb-2 text-xs uppercase text-gray-400">
              Gerenciamento
            </div>
            
            <SidebarItem 
              icon={<Tags size={18} />} 
              label="Categorias" 
              path="/categories" 
              active={isActive("/categories")} 
              onClick={() => toast.info("Página de categorias em construção")}
            />
            <SidebarItem 
              icon={<Package size={18} />} 
              label="Produtos" 
              path="/products" 
              active={isActive("/products")} 
              onClick={() => toast.info("Página de produtos em construção")}
            />
            <SidebarItem 
              icon={<Users size={18} />} 
              label="Usuários" 
              path="/users" 
              active={isActive("/users")} 
              onClick={() => toast.info("Página de usuários em construção")}
            />
            <SidebarItem 
              icon={<Settings size={18} />} 
              label="Configurações" 
              path="/settings" 
              active={isActive("/settings")} 
              onClick={() => toast.info("Página de configurações em construção")}
            />
          </ul>
        </div>
        
        {/* User info */}
        <div className="mt-auto p-4 border-t border-gray-800">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-sm font-medium mr-3">
              {user?.email ? user.email.substring(0, 2).toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-white truncate">{user?.email}</p>
              <p className="text-xs text-gray-400">Online</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
  hasChildren?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon, label, path, active, hasChildren, onClick }: SidebarItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
  
  return (
    <li className={cn(
      "relative py-2 px-4 flex items-center",
      active ? "bg-red-900/30 text-white" : "text-gray-400 hover:bg-red-900/20 hover:text-white"
    )}>
      <Link to={path} className="flex items-center w-full" onClick={handleClick}>
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
        {hasChildren && <ChevronDown size={14} className="ml-auto" />}
      </Link>
      {active && <div className="absolute left-0 top-0 h-full w-1 bg-red-500"></div>}
    </li>
  );
};

export default AppSidebar;
