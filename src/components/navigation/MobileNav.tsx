import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Home, LineChart, User, Book, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const MobileNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-primary"
      : "text-muted-foreground hover:text-primary transition-colors";
  };

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 md:hidden">
      <nav className="flex items-center justify-between px-6 py-2 h-16 relative">
        <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link to="/reports" className={`flex flex-col items-center ${isActive('/reports')}`}>
          <LineChart className="h-6 w-6" />
          <span className="text-xs mt-1">Reports</span>
        </Link>
        
        <div className="relative -mt-8">
          <div className="absolute left-1/2 -translate-x-1/2 -top-1">
            <button 
              onClick={() => {}} 
              className="bg-black rounded-full p-4 shadow-lg hover:bg-gray-800 transition-colors border-4 border-background"
            >
              <Plus className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
        
        <Link to="/food-diary" className={`flex flex-col items-center ${isActive('/food-diary')}`}>
          <Book className="h-6 w-6" />
          <span className="text-xs mt-1">Diary</span>
        </Link>
        
        <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile')}`}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
};