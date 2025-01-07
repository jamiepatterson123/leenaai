import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Home, LineChart, User, Book, Users } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { WeightInput } from "@/components/WeightInput";

interface MobileNavProps {
  isAuthenticated: boolean;
}

export const MobileNav = ({ isAuthenticated }: MobileNavProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-primary"
      : "text-muted-foreground hover:text-primary transition-colors";
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <nav className="flex items-center justify-between px-6 h-16">
          <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link to="/reports" className={`flex flex-col items-center ${isActive('/reports')}`}>
            <LineChart className="h-6 w-6" />
            <span className="text-xs mt-1">Reports</span>
          </Link>
          
          <Link to="/learn" className={`flex flex-col items-center ${isActive('/learn')}`}>
            <Book className="h-6 w-6" />
            <span className="text-xs mt-1">Learn</span>
          </Link>
          
          <Link to="/community" className={`flex flex-col items-center ${isActive('/community')}`}>
            <Users className="h-6 w-6" />
            <span className="text-xs mt-1">Community</span>
          </Link>
          
          {isAuthenticated && (
            <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile')}`}>
              <User className="h-6 w-6" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          )}
        </nav>
      </div>
    </>
  );
};