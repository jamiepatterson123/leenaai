import React, { useState, forwardRef, useImperativeHandle } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import { analyzeImage } from "./ImageAnalyzer";
import { saveFoodEntries } from "./FoodEntrySaver";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FoodVerificationDialog } from "./FoodVerificationDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ImageAnalysisSectionProps {
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  nutritionData: any;
  setNutritionData: (data: any) => void;
  selectedDate: Date;
  onSuccess?: () => void;
}

export const ImageAnalysisSection = forwardRef<any, ImageAnalysisSectionProps>(({
  analyzing,
  setAnalyzing,
  nutritionData,
  setNutritionData,
  selectedDate,
  onSuccess,
}, ref) => {
  const [resetUpload, setResetUpload] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [analyzedFoods, setAnalyzedFoods] = useState([]);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const componentRef = React.useRef<HTMLDivElement>(null);

  // Add timeout handling
  const analysisTimeoutRef = React.useRef<NodeJS.Timeout>();

  const cleanupStates = () => {
    setResetUpload(true);
    setShowVerification(false);
    setAnalyzing(false);
    setShowLoadingScreen(false);
    setNutritionData(null);
    setAnalyzedFoods([]);
    
    // Clear any pending timeouts
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }
  };

  const handleAnalysisError = () => {
    cleanupStates();
    toast.error("Failed to analyze image. Please try again.");
    if (isMobile) {
      navigate("/");
    }
  };

  const handleImageSelect = async (image: File) => {
    if (!image) {
      toast.error("No image selected");
      return;
    }

    console.log("handleImageSelect called with image:", image);
    
    if (analyzing) {
      toast.error("Please wait for the current analysis to complete");
      return;
    }

    setAnalyzing(true);
    setShowLoadingScreen(true);
    setResetUpload(false);

    // Set a timeout for the analysis
    analysisTimeoutRef.current = setTimeout(() => {
      handleAnalysisError();
    }, 30000); // 30 second timeout
    
    try {
      console.log("Starting image analysis...");
      const result = await analyzeImage(image, {
        setNutritionData,
        saveFoodEntries: async () => {}, // Don't save immediately
      });
      
      // Clear the timeout as analysis succeeded
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
      
      console.log("Analysis result:", result);
      
      if (result?.foods && Array.isArray(result.foods) && result.foods.length > 0) {
        setAnalyzedFoods(result.foods);
        setShowLoadingScreen(false);
        setShowVerification(true);
      } else {
        throw new Error("Invalid analysis result");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      handleAnalysisError();
    }
  };

  useImperativeHandle(ref, () => ({
    handleImageSelect
  }));

  React.useEffect(() => {
    if (componentRef.current) {
      (componentRef.current as any).handleImageSelect = handleImageSelect;
    }

    // Cleanup function
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, []);

  const handleConfirmFoods = async (foods: any[]) => {
    try {
      await saveFoodEntries(foods, selectedDate);
      await queryClient.invalidateQueries({ 
        queryKey: ["foodDiary", format(selectedDate, "yyyy-MM-dd")] 
      });
      
      cleanupStates();
      toast.success("Food added to diary!");
      
      if (isMobile) {
        navigate("/food-diary", { state: { fromVerification: true } });
      } else {
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error saving food entries:", error);
      toast.error("Failed to save food entries");
      if (isMobile) {
        navigate("/");
      }
    }
  };

  if (showLoadingScreen && isMobile) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[100]">
        <div className="text-center space-y-6 px-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          <p className="text-2xl font-semibold text-gray-900 animate-pulse">
            Analyzing your meal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${analyzing && isMobile ? 'hidden' : ''}`} ref={componentRef} data-image-analysis>
      <ImageUpload onImageSelect={handleImageSelect} resetPreview={resetUpload} />
      {analyzing && !isMobile && (
        <p className="text-center text-gray-600 animate-pulse">
          Analyzing your meal...
        </p>
      )}
      <FoodVerificationDialog
        isOpen={showVerification}
        onClose={() => {
          cleanupStates();
        }}
        foods={analyzedFoods}
        onConfirm={handleConfirmFoods}
      />
    </div>
  );
});

ImageAnalysisSection.displayName = "ImageAnalysisSection";