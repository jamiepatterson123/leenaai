import React from "react";
import { Link } from "react-router-dom";
import { Home, UtensilsCrossed, Target, ClipboardList, UserCheck, Send, ChevronDown } from "lucide-react";
import { MobileNav } from "./navigation/MobileNav";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MoreDropdown } from "./navigation/MoreDropdown";

export const Navigation = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const selectedDate = new Date();

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
        <Link to="/" className="flex items-center text-muted-foreground hover:text-primary transition-colors gap-2">
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link to="/food-diary" className="flex items-center text-muted-foreground hover:text-primary transition-colors gap-2">
          <UtensilsCrossed className="h-5 w-5" />
          <span>Nutrition</span>
        </Link>
        <Link to="/profile" className="flex items-center text-muted-foreground hover:text-primary transition-colors gap-2">
          <Target className="h-5 w-5" />
          <span>Targets</span>
        </Link>
        <Link to="/reports" className="flex items-center text-muted-foreground hover:text-primary transition-colors gap-2">
          <ClipboardList className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        <Link to="/coach" className="flex items-center text-muted-foreground hover:text-primary transition-colors gap-2">
          <UserCheck className="h-5 w-5" />
          <span>Coach</span>
        </Link>
        <MoreDropdown />
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
        >
          <Send className="h-5 w-5" />
        </Button>
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
