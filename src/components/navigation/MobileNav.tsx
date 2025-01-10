import React, { useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Book, User, LineChart, Plus, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MobileNavProps {
  onAddClick: () => void;
  onFileSelect?: (file: File) => void;
}

export const MobileNav = ({ onAddClick, onFileSelect }: MobileNavProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-primary"
      : "text-muted-foreground hover:text-primary transition-colors";
  };

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  if (!isMobile || !session) return null;

  return (
    <>
      {session && (
        <button
          onClick={handleSignOut}
          className="fixed top-5 right-4 z-50 text-muted-foreground hover:text-primary transition-colors"
        >
          <LogOut className="h-6 w-6" />
        </button>
      )}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/40 py-2 px-4 z-50">
        <div className="flex justify-around items-center max-w-xl mx-auto">
          <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
            <Home className="h-6 w-6" />
          </Link>
          
          <Link to="/food-diary" className={`flex flex-col items-center ${isActive('/food-diary')}`}>
            <Book className="h-6 w-6" />
          </Link>
          
          <div className="flex flex-col items-center">
            <button 
              onClick={handlePlusClick}
              className="bg-black rounded-full p-4 hover:bg-black/90 transition-colors"
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
          
          <Link to="/reports" className={`flex flex-col items-center ${isActive('/reports')}`}>
            <LineChart className="h-6 w-6" />
          </Link>
          
          <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile')}`}>
            <User className="h-6 w-6" />
          </Link>
        </div>
      </nav>
    </>
  );
};