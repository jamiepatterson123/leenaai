import React from "react";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

export const Navigation = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState(null);
  const queryClient = useQueryClient();
  const selectedDate = new Date();

  const handleShare = () => {
    // Implement share functionality
  };

  const handleSignOut = () => {
    // Implement sign out functionality
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

    // Use setTimeout to ensure the analysis section is rendered
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
      <DesktopNav 
        handleShare={handleShare}
        handleSignOut={handleSignOut}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <MobileNav 
        onAddClick={() => {}} 
        onFileSelect={handleFileSelect}
      />
    </>
  );
};
