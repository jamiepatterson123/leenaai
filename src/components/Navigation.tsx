import React, { useState } from "react";
import { createRoot } from 'react-dom/client'; // Import createRoot from react-dom/client
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageAnalysisSection } from "./analysis/ImageAnalysisSection";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export const Navigation = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const queryClient = useQueryClient();
  const selectedDate = new Date(); // Default to current date for food entries

  // Mock functions for DesktopNav props
  const handleShare = () => {
    // Implement share functionality
  };

  const handleSignOut = () => {
    // Implement sign out functionality
  };

  const theme = "light" as const; // or "dark"
  const toggleTheme = (checked: boolean) => {
    // Implement theme toggle functionality
  };

  const handleFileSelect = async (file: File) => {
    setShowAddDialog(false); // Close dialog if it was open
    setAnalyzing(true);

    // Create a ref to the ImageAnalysisSection
    const imageAnalysisSectionRef = React.createRef<any>();

    // Create and mount a temporary ImageAnalysisSection
    const tempComponent = (
      <ImageAnalysisSection
        ref={imageAnalysisSectionRef}
        analyzing={analyzing}
        setAnalyzing={setAnalyzing}
        nutritionData={nutritionData}
        setNutritionData={setNutritionData}
        selectedDate={selectedDate}
        onSuccess={() => {
          queryClient.invalidateQueries({ 
            queryKey: ["foodDiary", format(selectedDate, "yyyy-MM-dd")] 
          });
        }}
      />
    );

    // Create a temporary container
    const tempContainer = document.createElement('div');
    document.body.appendChild(tempContainer);

    // Render the component
    const root = createRoot(tempContainer);
    root.render(tempComponent);

    // Wait for the component to mount
    await new Promise(resolve => setTimeout(resolve, 0));

    // Call handleImageSelect on the mounted component
    if (imageAnalysisSectionRef.current) {
      await imageAnalysisSectionRef.current.handleImageSelect(file);
    }

    // Cleanup
    root.unmount();
    document.body.removeChild(tempContainer);
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