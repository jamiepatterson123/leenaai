import React, { useState, forwardRef, useImperativeHandle } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { analyzeImage } from "./ImageAnalyzer";
import { saveFoodEntries } from "./FoodEntrySaver";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FoodVerificationDialog } from "./FoodVerificationDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ImageAnalysisSectionProps {
  apiKey: string;
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  nutritionData: any;
  setNutritionData: (data: any) => void;
  selectedDate: Date;
  onSuccess?: () => void;
}

export const ImageAnalysisSection = forwardRef<any, ImageAnalysisSectionProps>(({
  apiKey,
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const handleImageSelect = async (image: File) => {
    console.log("handleImageSelect called with image:", image);
    
    if (!apiKey) {
      toast.error("Please set your OpenAI API key in API Settings first");
      return;
    }

    if (analyzing) {
      toast.error("Please wait for the current analysis to complete");
      return;
    }

    setAnalyzing(true);
    setResetUpload(false);
    
    try {
      console.log("Starting image analysis...");
      const result = await analyzeImage(image, {
        apiKey,
        setNutritionData,
        saveFoodEntries: async () => {}, // Don't save immediately
      });
      
      console.log("Analysis result:", result);
      
      if (result?.foods) {
        setAnalyzedFoods(result.foods);
        if (isMobile) {
          setShowConfirmation(true);
        } else {
          setShowVerification(true);
        }
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error(error instanceof Error ? error.message : "Error analyzing image");
    } finally {
      setAnalyzing(false);
    }
  };

  useImperativeHandle(ref, () => ({
    handleImageSelect
  }));

  const handleConfirmUpload = () => {
    setShowConfirmation(false);
    setShowVerification(true);
  };

  const handleCancelUpload = () => {
    setShowConfirmation(false);
    setResetUpload(true);
    setAnalyzedFoods([]);
  };

  const handleConfirmFoods = async (foods: any[]) => {
    try {
      await saveFoodEntries(foods, selectedDate);
      queryClient.invalidateQueries({ 
        queryKey: ["foodDiary", format(selectedDate, "yyyy-MM-dd")] 
      });
      setResetUpload(true);
      setShowVerification(false);
      toast.success("Food added to diary!");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save food entries");
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <ImageUpload onImageSelect={handleImageSelect} resetPreview={resetUpload} />
      {analyzing && (
        <p className="text-center text-gray-600 animate-pulse">
          Analyzing your meal...
        </p>
      )}
      <FoodVerificationDialog
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        foods={analyzedFoods}
        onConfirm={handleConfirmFoods}
      />
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finished uploading?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you happy with the analyzed results?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleCancelUpload}>
              No, retake
            </Button>
            <Button onClick={handleConfirmUpload}>
              Yes, continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

ImageAnalysisSection.displayName = "ImageAnalysisSection";