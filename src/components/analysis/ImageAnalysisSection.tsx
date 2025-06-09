
import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { MultiPhotoCapture } from "./MultiPhotoCapture";
import { toast } from "sonner";
import { analyzeImages, analyzeImage } from "./ImageAnalyzer";
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
  const [analysisMetadata, setAnalysisMetadata] = useState<any>(null);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const componentRef = React.useRef<HTMLDivElement>(null);
  const { analyzing: globalAnalyzing, setAnalyzing: setGlobalAnalyzing } = useAnalyzing();

  // Update global analyzing state whenever local state changes
  useEffect(() => {
    setGlobalAnalyzing(localAnalyzing);
  }, [localAnalyzing, setGlobalAnalyzing]);

  // Legacy single image handler (for backward compatibility)
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
    
    setLocalAnalyzing(true);
    setResetUpload(false);
    
    try {
      console.log("Starting single image analysis...");
      const result = await analyzeImage(image, {
        setNutritionData,
        saveFoodEntries: async () => {}
      });
      
      console.log("Analysis result:", result);
      
      if (result?.foods && result.foods.length > 0) {
        setAnalyzedFoods(result.foods);
        setAnalysisMetadata(result);
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

  // New multi-photo handler
  const handlePhotosCapture = async (photos: File[]) => {
    if (!photos || photos.length === 0) {
      toast.error("No photos selected");
      return;
    }
    
    console.log(`handlePhotosCapture called with ${photos.length} photo(s)`);
    
    if (localAnalyzing) {
      toast.error("Please wait for the current analysis to complete");
      return;
    }
    
    setLocalAnalyzing(true);
    setResetUpload(false);
    
    try {
      console.log(`Starting analysis of ${photos.length} photos...`);
      const result = await analyzeImages(photos, {
        setNutritionData,
        saveFoodEntries: async () => {}
      });
      
      console.log("Multi-photo analysis result:", result);
      
      if (result?.foods && result.foods.length > 0) {
        setAnalyzedFoods(result.foods);
        setAnalysisMetadata(result);
        setShowVerification(true);
        
        const accuracyMessage = photos.length > 1 
          ? `${photos.length} photos analyzed with enhanced accuracy!`
          : "Photo analyzed successfully!";
        toast.success(accuracyMessage);
      } else {
        throw new Error("No food items detected in the photos");
      }
    } catch (error) {
      console.error("Error analyzing photos:", error);
      const errorMessage = error instanceof Error ? error.message : "Error analyzing photos";
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
      setAnalysisMetadata(null);
      
      // Trigger confetti animation when food is successfully logged
      triggerSuccessConfetti();
      
      const successMessage = analysisMetadata?.image_count > 1 
        ? `Food added with ${analysisMetadata.image_count}-angle analysis!`
        : "Food added to diary!";
      toast.success(successMessage);
      
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
      <MultiPhotoCapture 
        onPhotosCapture={handlePhotosCapture}
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
        analysisMetadata={analysisMetadata}
      />
    </div>
  );
});

ImageAnalysisSection.displayName = "ImageAnalysisSection";
