import React from "react";
import { Home, BookOpen, Plus, MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const MobileNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? "text-primary" : "text-muted-foreground";
  };

  const handleHelpClick = () => {
    if (typeof window !== 'undefined' && window.Tawk_API) {
      window.Tawk_API.toggle();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-50">
      <nav className="flex items-center justify-between px-6 h-16">
        <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link to="/food-diary" className={`flex flex-col items-center ${isActive('/food-diary')}`}>
          <BookOpen className="h-6 w-6" />
          <span className="text-xs mt-1">Diary</span>
        </Link>
        
        <Link 
          to="/food-diary" 
          className="flex flex-col items-center -mt-8 relative"
        >
          <div className="bg-primary rounded-full p-4">
            <Plus className="h-6 w-6 text-primary-foreground" />
          </div>
        </Link>
        
        <button 
          onClick={handleHelpClick}
          className="flex flex-col items-center text-muted-foreground"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs mt-1">Help</span>
        </button>
        
        <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile')}`}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
};