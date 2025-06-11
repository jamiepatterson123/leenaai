import React, { useState, useEffect } from "react";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { Menu, User, MessageCircle, UserCheck, Download } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Send, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    session
  } = useSession();
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
      setIsOpen(false);
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
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
    
    console.log("Navigation handleFileSelect called, redirecting to home...");
    
    // Navigate to home page where the ImageAnalysisSection is available
    navigate("/");
    
    // Small delay to ensure the page loads
    setTimeout(() => {
      const imageAnalysisSection = document.querySelector('[data-image-analysis]');
      if (imageAnalysisSection && 'handleImageSelect' in imageAnalysisSection) {
        console.log("Found image analysis section, processing file...");
        (imageAnalysisSection as any).handleImageSelect(file);
      } else {
        console.error("Image analysis section not found on home page");
        toast.error("Please use the camera feature from the home page");
      }
    }, 500);
  };

  const handleDownloadApp = () => {
    // For now, just show a toast message - this can be updated later with actual app store links
    toast.info("Mobile app coming soon! Stay tuned for updates.");
    setIsOpen(false);
  };
  
  return (
    <div className="border-b">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/dashboard" className="text-slate-950 font-semibold text-xl">
          Leena.ai
        </Link>
        
        <div className="absolute top-0 right-0 mt-4 mr-4 z-10">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground text-right">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-4 mt-6">
                <Button variant="ghost" className="flex items-center justify-start gap-3" onClick={() => handleNavigation("/profile")}>
                  <User className="h-4 w-4" />
                  Profile
                </Button>
                <Button variant="ghost" className="flex items-center justify-start gap-3" onClick={() => handleNavigation("/consultation")}>
                  <UserCheck className="h-4 w-4" />
                  Nutrition Consultation
                </Button>
                <Button variant="ghost" className="flex items-center justify-start gap-3" onClick={() => handleNavigation("/chat")}>
                  <MessageCircle className="h-4 w-4" />
                  Nutrition Coach
                </Button>
                <Button variant="ghost" className="flex items-center justify-start gap-3" onClick={handleDownloadApp}>
                  <Download className="h-4 w-4" />
                  Download app
                </Button>
                <Button variant="ghost" className="flex items-center justify-start gap-3" onClick={() => { handleShare(); setIsOpen(false); }}>
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
