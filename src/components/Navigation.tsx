
import React, { useState } from "react";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Send, LogOut, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

export const Navigation = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    session
  } = useSession();
  const { redirectToCheckout, isSubscribed } = useSubscription();
  const selectedDate = new Date();

  // If there's no session or we're on the auth page, don't render the navigation
  if (!session || window.location.pathname === '/auth') return null;
  
  const handleShare = () => {
    const shareMessage = "This is an AI nutrition app which allows you to track your nutrition with photos of your food. It's free to use, check it out";
    const encodedMessage = encodeURIComponent(shareMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleSignOut = async () => {
    try {
      const {
        error
      } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out");
        return;
      }
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };
  
  const theme = "light" as const;
  const toggleTheme = (checked: boolean) => {
    // Implement theme toggle functionality
  };
  
  const handleFileSelect = async (file: File) => {
    if (!file) {
      toast.error("No file selected");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      const imageAnalysisSection = document.querySelector('[data-image-analysis]');
      if (imageAnalysisSection && 'handleImageSelect' in imageAnalysisSection) {
        (imageAnalysisSection as any).handleImageSelect(file);
      } else {
        console.error("Image analysis section not found");
        toast.error("Failed to analyze image");
        setAnalyzing(false);
      }
    }, 100);
  };
  
  // Function to directly go to Stripe checkout for the $10/month plan
  const handleUpgradeToPremium = () => {
    if (redirectToCheckout) {
      redirectToCheckout();
    } else {
      // Direct link to Stripe as fallback
      window.location.href = "https://buy.stripe.com/eVqaEYgDQ4Bgam54Dqe7m02";
    }
  };
  
  return (
    <div className="border-b">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/dashboard" className="text-slate-950 font-semibold text-xl">
          Leena.ai
        </Link>
        
        <div className="absolute top-0 right-0 mt-4 mr-4 z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground text-right">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-4 mt-6">
                {!isSubscribed && (
                  <Button 
                    variant="gradient" 
                    className="flex items-center justify-start gap-3" 
                    onClick={() => window.location.href = "https://buy.stripe.com/eVqaEYgDQ4Bgam54Dqe7m02"}
                  >
                    <ArrowUp className="h-4 w-4" />
                    Upgrade to Unlimited
                  </Button>
                )}
                <Button variant="ghost" className="flex items-center justify-start gap-3" onClick={handleShare}>
                  <Send className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="ghost" className="flex items-center justify-start gap-3" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="md:hidden">
          <MobileNav onAddClick={() => {}} onFileSelect={handleFileSelect} />
        </div>
      </div>
    </div>
  );
};
