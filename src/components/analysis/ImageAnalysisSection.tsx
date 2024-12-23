import { ImageUpload } from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { analyzeImage } from "./ImageAnalyzer";
import { saveFoodEntries } from "./FoodEntrySaver";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface ImageAnalysisSectionProps {
  apiKey: string;
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  nutritionData: any;
  setNutritionData: (data: any) => void;
  selectedDate: Date;
}

export const ImageAnalysisSection = ({
  apiKey,
  analyzing,
  setAnalyzing,
  nutritionData,
  setNutritionData,
  selectedDate,
}: ImageAnalysisSectionProps) => {
  const [resetUpload, setResetUpload] = useState(false);
  const queryClient = useQueryClient();

  const handleImageSelect = async (image: File) => {
    if (!apiKey) {
      toast.error("Please set your OpenAI API key in API Settings first");
      return;
    }

    // Prevent multiple simultaneous analyses
    if (analyzing) {
      toast.error("Please wait for the current analysis to complete");
      return;
    }

    setAnalyzing(true);
    setResetUpload(false);
    try {
      const result = await analyzeImage(image, {
        apiKey,
        setNutritionData: () => {}, // Don't set nutrition data directly
        saveFoodEntries: async (foods) => {
          await saveFoodEntries(foods, selectedDate);
          queryClient.invalidateQueries({ 
            queryKey: ["foodDiary", format(selectedDate, "yyyy-MM-dd")] 
          });
          setResetUpload(true);
          toast.success("Food added to diary!");
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error analyzing image");
      console.error(error);
    } finally {
      setAnalyzing(false);
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
    </div>
  );
};