
import { ChartLine, Plus, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  onNewOfferClick: () => void;
}

const Header = ({ onNewOfferClick }: HeaderProps) => {
  const { user, signOut } = useAuth();
  
  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : "U";
    
  return (
    <header className="flex justify-between items-center py-6 px-4 md:px-6 border-b border-gray-800">
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-theme-blue to-theme-purple p-2 rounded-md">
          <ChartLine className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold">Oferta Compass</h1>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={onNewOfferClick} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Oferta</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-4 py-2">
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
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
