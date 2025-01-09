import React from "react";
import { Link } from "react-router-dom";
import { Home, Book, User, LineChart } from "lucide-react";
import { MobileNav } from "./navigation/MobileNav";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const selectedDate = new Date();

  const handleShare = () => {
    // Implement share functionality
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

  return (
    <>
      <div className="hidden md:flex items-center space-x-6">
        <Link to="/" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
          <Home className="h-5 w-5" />
        </Link>
        <Link to="/food-diary" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
          <Book className="h-5 w-5" />
        </Link>
        <Link to="/reports" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
          <LineChart className="h-5 w-5" />
        </Link>
        <Link to="/profile" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
          <User className="h-5 w-5" />
        </Link>
      </div>
      <div className="md:hidden">
        <MobileNav 
          onAddClick={() => {}} 
          onFileSelect={handleFileSelect}
        />
      </div>
    </>
  );
};