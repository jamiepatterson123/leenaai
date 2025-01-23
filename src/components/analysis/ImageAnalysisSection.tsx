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

const loadingMessages = [
  "Counting calories...",
  "Calculating carbs...",
  "Calculating protein...",
  "Calculating fats..."
];

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
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (analyzing && !showVerification) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [analyzing, showVerification]);

  const handleImageSelect = async (image: File) => {
    console.log("ImageAnalysisSection: handleImageSelect called with image");
    if (!image) {
      toast.error("No image selected");
      return;
    }

    if (analyzing) {
      toast.error("Please wait for the current analysis to complete");
      return;
    }

    setAnalyzing(true);
    setResetUpload(false);
    setCurrentMessageIndex(0);
    
    try {
      console.log("Starting image analysis...");
      const result = await analyzeImage(image, {
        setNutritionData,
        saveFoodEntries: async () => {}, // Don't save immediately
      });
      
      console.log("Analysis result:", result);
      
      if (result?.foods) {
        setAnalyzedFoods(result.foods);
        setShowVerification(true);
      } else {
        throw new Error("Invalid analysis result");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      const errorMessage = error instanceof Error ? error.message : "Error analyzing image";
      toast.error(errorMessage);
      setAnalyzing(false);
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
      setAnalyzing(false);
      setNutritionData(null);
      toast.success("Food added to diary!");
      
      if (isMobile) {
        navigate("/food-diary");
      } else {
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error saving food entries:", error);
      toast.error("Failed to save food entries");
    }
  };

  // Expose handleImageSelect through ref
  useImperativeHandle(ref, () => ({
    handleImageSelect
  }));

  return (
    <div className="space-y-8" data-image-analysis>
      <ImageUpload onImageSelect={handleImageSelect} resetPreview={resetUpload} />
      {analyzing && !showVerification && !isMobile && (
        <p className="text-center text-gray-500 animate-fade-in font-light">
          {loadingMessages[currentMessageIndex]}
        </p>
      )}
      {analyzing && !showVerification && isMobile && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-[100]">
          <div className="text-center space-y-6 px-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <p className="text-2xl font-light text-gray-500 animate-fade-in">
              {loadingMessages[currentMessageIndex]}
            </p>
          </div>
        </div>
      )}
      <FoodVerificationDialog
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        foods={analyzedFoods}
        onConfirm={handleConfirmFoods}
      />
    </div>
  );
});

ImageAnalysisSection.displayName = "ImageAnalysisSection";