import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Book, User, LineChart, Send, LogOut, Circle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface MobileNavProps {
  onAddClick: () => void;
  onFileSelect?: (file: File) => void;
}

export const MobileNav = ({ onAddClick, onFileSelect }: MobileNavProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = React.useState(null);
  const navigate = useNavigate();

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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-primary"
      : "text-muted-foreground hover:text-primary transition-colors";
  };

  const handleCircleClick = () => {
    fileInputRef.current?.click();
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
    <>
      {session && (
        <>
          <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
            <button
              onClick={() => {}} // Share functionality placeholder
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Send className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/40 py-2 px-4 z-50">
            <div className="flex justify-around items-center max-w-xl mx-auto">
              <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
                <Home className="h-6 w-6" />
                <span className="text-xs mt-1">Home</span>
              </Link>
              
              <Link to="/food-diary" className={`flex flex-col items-center ${isActive('/food-diary')}`}>
                <Book className="h-6 w-6" />
                <span className="text-xs mt-1">Diary</span>
              </Link>
              
              <div className="flex flex-col items-center">
                <button 
                  onClick={handleCircleClick}
                  className="w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center"
                  aria-label="Upload photo"
                >
                  <Circle className="h-6 w-6" />
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
                <span className="text-xs mt-1">Reports</span>
              </Link>
              
              <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile')}`}>
                <User className="h-6 w-6" />
                <span className="text-xs mt-1">Profile</span>
              </Link>
            </div>
          </nav>
        </>
      )}
    </>
  );
};