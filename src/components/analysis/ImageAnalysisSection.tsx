
import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import { analyzeImage } from "./ImageAnalyzer";
import { saveFoodEntries } from "./FoodEntrySaver";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FoodVerificationDialog } from "./FoodVerificationDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { triggerSuccessConfetti } from "@/utils/confetti";
import { useAnalyzing } from "@/context/AnalyzingContext";

interface ImageAnalysisSectionProps {
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  nutritionData: any;
  setNutritionData: (data: any) => void;
  selectedDate: Date;
  onSuccess?: () => void;
}

export const ImageAnalysisSection = forwardRef<any, ImageAnalysisSectionProps>(({
  analyzing: localAnalyzing,
  setAnalyzing: setLocalAnalyzing,
  nutritionData,
  setNutritionData,
  selectedDate,
  onSuccess
}, ref) => {
  const [resetUpload, setResetUpload] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [analyzedFoods, setAnalyzedFoods] = useState([]);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const componentRef = React.useRef<HTMLDivElement>(null);
  const { analyzing: globalAnalyzing, setAnalyzing: setGlobalAnalyzing } = useAnalyzing();

  // Update global analyzing state whenever local state changes
  useEffect(() => {
    setGlobalAnalyzing(localAnalyzing);
  }, [localAnalyzing, setGlobalAnalyzing]);

  const handleImageSelect = async (image: File) => {
    if (!image) {
      toast.error("No image selected");
      return;
    }
    
    console.log("handleImageSelect called with image:", image.name, "type:", image.type, "size:", image.size);
    
    if (localAnalyzing) {
      toast.error("Please wait for the current analysis to complete");
      return;
    }
    
    // Always set analyzing to true before starting the process
    setLocalAnalyzing(true);
    setResetUpload(false);
    
    try {
      console.log("Starting image analysis...");
      const result = await analyzeImage(image, {
        setNutritionData,
        saveFoodEntries: async () => {} // Don't save immediately
      });
      
      console.log("Analysis result:", result);
      
      if (result?.foods && result.foods.length > 0) {
        setAnalyzedFoods(result.foods);
        setShowVerification(true);
        toast.success("Image analyzed successfully!");
      } else {
        throw new Error("No food items detected in the image");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      const errorMessage = error instanceof Error ? error.message : "Error analyzing image";
      toast.error(errorMessage);
      setLocalAnalyzing(false);
    }
  };
  
  const handleConfirmFoods = async (foods: any[]) => {
    try {
      await saveFoodEntries(foods, selectedDate);
      await queryClient.invalidateQueries({
        queryKey: ["foodDiary", format(selectedDate, "yyyy-MM-dd")]
      });
      setResetUpload(true);
      setShowVerification(false);
      setLocalAnalyzing(false);
      setNutritionData(null);
      
      // Trigger confetti animation when food is successfully logged
      triggerSuccessConfetti();
      
      toast.success("Food added to diary!");
      if (isMobile) {
        navigate("/food-diary");
      } else {
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error saving food entries:", error);
      toast.error("Failed to save food entries");
      setLocalAnalyzing(false);
    }
  };
  
  useImperativeHandle(ref, () => ({
    handleImageSelect
  }));
  
  React.useEffect(() => {
    if (componentRef.current) {
      (componentRef.current as any).handleImageSelect = handleImageSelect;
    }
  }, []);

  return (
    <div className={`space-y-4`} ref={componentRef} data-image-analysis>
      <ImageUpload 
        onImageSelect={handleImageSelect} 
        resetPreview={resetUpload}
        isAnalyzing={localAnalyzing && !showVerification} 
      />

      <FoodVerificationDialog 
        isOpen={showVerification} 
        onClose={() => {
          setShowVerification(false);
          setLocalAnalyzing(false);
        }} 
        foods={analyzedFoods} 
        onConfirm={handleConfirmFoods} 
      />
    </div>
  );
});

ImageAnalysisSection.displayName = "ImageAnalysisSection";
