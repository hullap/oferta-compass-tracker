
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  PieChart, 
  ShoppingCart, 
  Tags, 
  Package, 
  Users, 
  Settings,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="sidebar">
      <div className="p-4 flex items-center">
        <div className="text-red-500 font-bold text-xl">
          <span className="bg-red-500 text-white p-1 rounded mr-1">
            <span className="text-sm">✓</span>
          </span>
          OfferTracker
        </div>
      </div>
      
      <div className="mt-6">
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
          
          <div className="px-4 pt-6 pb-2 text-xs uppercase text-gray-400">
            Gerenciamento
          </div>
          
          <SidebarItem 
            icon={<Tags size={18} />} 
            label="Categorias" 
            path="/categories" 
            active={isActive("/categories")} 
          />
          <SidebarItem 
            icon={<Package size={18} />} 
            label="Produtos" 
            path="/products" 
            active={isActive("/products")} 
          />
          <SidebarItem 
            icon={<Users size={18} />} 
            label="Usuários" 
            path="/users" 
            active={isActive("/users")} 
          />
          <SidebarItem 
            icon={<Settings size={18} />} 
            label="Configurações" 
            path="/settings" 
            active={isActive("/settings")} 
          />
        </ul>
      </div>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
  hasChildren?: boolean;
}

const SidebarItem = ({ icon, label, path, active, hasChildren }: SidebarItemProps) => {
  return (
    <li className={cn(
      "relative py-2 px-4 flex items-center",
      active ? "bg-indigo-900/30 text-white" : "text-gray-400 hover:bg-indigo-900/20 hover:text-white"
    )}>
      <Link to={path} className="flex items-center w-full">
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
        {hasChildren && <ChevronDown size={14} className="ml-auto" />}
      </Link>
      {active && <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500"></div>}
    </li>
  );
};

export default AppSidebar;
