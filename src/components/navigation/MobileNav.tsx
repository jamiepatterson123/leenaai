import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LineChart, User, Book, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileNavProps {
  onAddClick: () => void;
  onFileSelect?: (file: File) => void;
}

export const MobileNav = ({ onAddClick, onFileSelect }: MobileNavProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-primary"
      : "text-muted-foreground hover:text-primary transition-colors";
  };

  const handlePlusClick = () => {
    if (location.pathname === '/food-diary') {
      onAddClick(); // Open dialog for manual entry when on food diary page
    } else if (onFileSelect) {
      fileInputRef.current?.click(); // Trigger file input for image upload
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/40 py-2 px-4 z-50">
      <div className="flex justify-around items-center max-w-xl mx-auto">
        <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
          <Home className="h-6 w-6" />
        </Link>
        
        <Link to="/reports" className={`flex flex-col items-center ${isActive('/reports')}`}>
          <LineChart className="h-6 w-6" />
        </Link>
        
        <div className="flex flex-col items-center">
          <button 
            onClick={handlePlusClick}
            className="bg-black rounded-full p-4 hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-6 w-6 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            capture="environment"
          />
        </div>
        
        <Link to="/food-diary" className={`flex flex-col items-center ${isActive('/food-diary')}`}>
          <Book className="h-6 w-6" />
        </Link>
        
        <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile')}`}>
          <User className="h-6 w-6" />
        </Link>
      </div>
    </nav>
  );
};