import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Home, LineChart, User, Book, Users } from "lucide-react";

export const MobileNav = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-primary"
      : "text-muted-foreground hover:text-primary transition-colors";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <nav className="flex items-center justify-between px-6 py-2 h-16">
        <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link to="/reports" className={`flex flex-col items-center ${isActive('/reports')}`}>
          <LineChart className="h-6 w-6" />
          <span className="text-xs mt-1">Reports</span>
        </Link>
        
        <Link to="/food-diary" className={`flex flex-col items-center ${isActive('/food-diary')}`}>
          <Book className="h-6 w-6" />
          <span className="text-xs mt-1">Diary</span>
        </Link>
        
        <Link to="/coach" className={`flex flex-col items-center ${isActive('/coach')}`}>
          <Users className="h-6 w-6" />
          <span className="text-xs mt-1">Coach</span>
        </Link>
        
        <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile')}`}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
};