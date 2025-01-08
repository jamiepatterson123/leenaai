import React from "react";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageAnalysisSection } from "./analysis/ImageAnalysisSection";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

export const Navigation = () => {
  const [showAddDialog, setShowAddDialog] = React.useState(false);
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

    // Instead of creating a temporary component, we'll use the dialog
    setShowAddDialog(true);
    setAnalyzing(true);

    // Use setTimeout to ensure the dialog is rendered before we trigger the analysis
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
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <ImageAnalysisSection
            analyzing={analyzing}
            setAnalyzing={setAnalyzing}
            nutritionData={nutritionData}
            setNutritionData={setNutritionData}
            selectedDate={selectedDate}
            onSuccess={() => {
              setShowAddDialog(false);
              queryClient.invalidateQueries({ 
                queryKey: ["foodDiary", format(selectedDate, "yyyy-MM-dd")] 
              });
            }}
          />
        </DialogContent>
      </Dialog>

      <MobileNav 
        onAddClick={() => setShowAddDialog(true)} 
        onFileSelect={handleFileSelect}
      />
    </>
  );
};