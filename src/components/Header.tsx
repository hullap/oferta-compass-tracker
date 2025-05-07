
import { ChartLine, Plus } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  onNewOfferClick: () => void;
}

const Header = ({ onNewOfferClick }: HeaderProps) => {
  return (
    <header className="flex justify-between items-center py-6 px-4 md:px-6 border-b border-gray-800">
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-theme-blue to-theme-purple p-2 rounded-md">
          <ChartLine className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold">Oferta Compass</h1>
      </div>
      <Button onClick={onNewOfferClick} className="flex items-center gap-1">
        <Plus className="h-4 w-4" />
        <span>Nova Oferta</span>
      </Button>
    </header>
  );
};

export default Header;
