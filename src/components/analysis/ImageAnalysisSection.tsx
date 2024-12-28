import { ImageUpload } from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
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

export const ImageAnalysisSection = ({
  apiKey,
  analyzing,
  setAnalyzing,
  nutritionData,
  setNutritionData,
  selectedDate,
  onSuccess,
}: ImageAnalysisSectionProps) => {
  const [resetUpload, setResetUpload] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [analyzedFoods, setAnalyzedFoods] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const processImage = async (image: File) => {
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
      const result = await analyzeImage(image, {
        apiKey,
        setNutritionData,
        saveFoodEntries: async () => {}, // Don't save immediately
      });
      
      if (result?.foods) {
        setAnalyzedFoods(result.foods);
        setShowVerification(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error analyzing image");
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageSelect = (image: File) => {
    if (isMobile) {
      setPendingImage(image);
      setShowConfirmation(true);
    } else {
      processImage(image);
    }
  };

  const handleConfirmUpload = () => {
    if (pendingImage) {
      processImage(pendingImage);
    }
    setShowConfirmation(false);
    setPendingImage(null);
  };

  const handleCancelUpload = () => {
    setShowConfirmation(false);
    setPendingImage(null);
    setResetUpload(true);
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
              Are you happy with the photo you just took?
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
};