import React, { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Book, MessageSquare, LineChart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { AuthButtons } from "./AuthButtons";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";

interface MobileNavProps {
  onAddClick: () => void;
  onFileSelect?: (file: File) => void;
}

export const MobileNav = ({ onAddClick, onFileSelect }: MobileNavProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = React.useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { dailyLimitReached, redirectToCheckout } = useSubscription();

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
      ? "text-[#D946EF]"
      : "text-muted-foreground hover:text-[#D946EF] transition-colors";
  };

  const handleCircleClick = () => {
    if (dailyLimitReached) {
      // Redirect to Stripe checkout if free uses are exhausted
      redirectToCheckout();
      toast.info("Upgrade to Premium for unlimited food logging");
    } else {
      // Normal file selection flow
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      setIsUploading(true);
      onFileSelect(file);
      e.target.value = '';
      
      // Reset the uploading state after a delay to ensure the loading overlay appears
      // This is a fallback in case the component doesn't reset it
      setTimeout(() => {
        setIsUploading(false);
      }, 30000); // 30 seconds maximum timeout
    }
  };

  // Image analysis-specific loading messages
  const imageAnalysisMessages = [
    { text: "Identifying food items in your photo...", type: "processing" as const },
    { text: "Calculating nutrition information...", type: "nutrition" as const },
    { text: "Measuring portion sizes...", type: "processing" as const },
    { text: "Counting calories in your meal...", type: "nutrition" as const },
    { text: "Estimating macros: protein, carbs, and fats...", type: "nutrition" as const }
  ];

  if (!isMobile) return null;

  return (
    <>
      {session && (
        <>
          <div className="absolute top-5 right-4 z-50">
            <AuthButtons handleShare={() => {}} session={session} />
          </div>
          
          <LoadingOverlay 
            isVisible={isUploading}
            type="image"
            title="Analyzing Your Food"
            messages={imageAnalysisMessages}
            fullScreen={true}
          />
          
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
                  onClick={handleCircleClick}
                  className={`w-14 h-14 rounded-full border-2 ${dailyLimitReached ? 'border-[#D946EF] bg-[#D946EF]/10 hover:bg-[#D946EF]/20' : 'border-[#9a9a9a] hover:bg-gray-50'} transition-colors`}
                  aria-label={dailyLimitReached ? "Upgrade to Premium" : "Upload photo"}
                  disabled={isUploading}
                />
                {!dailyLimitReached && (
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    capture="environment"
                    disabled={isUploading}
                  />
                )}
                {dailyLimitReached && (
                  <span className="text-xs mt-1 text-[#D946EF] font-medium">Upgrade</span>
                )}
              </div>
              
              <Link to="/reports" className={`flex flex-col items-center ${isActive('/reports')}`}>
                <LineChart className="h-6 w-6" />
              </Link>
              
              <Link to="/chat" className={`flex flex-col items-center ${isActive('/chat')}`}>
                <MessageSquare className="h-6 w-6" />
              </Link>
            </div>
          </nav>
        </>
      )}
    </>
  );
};
