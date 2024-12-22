import { ImageUpload } from "@/components/ImageUpload";
import { NutritionCard } from "@/components/NutritionCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { analyzeImage } from "./ImageAnalyzer";
import { saveFoodEntries } from "./FoodEntrySaver";

interface ImageAnalysisSectionProps {
  apiKey: string;
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  nutritionData: any;
  setNutritionData: (data: any) => void;
}

export const ImageAnalysisSection = ({
  apiKey,
  analyzing,
  setAnalyzing,
  nutritionData,
  setNutritionData,
}: ImageAnalysisSectionProps) => {
  const [resetUpload, setResetUpload] = useState(false);

  const handleDelete = () => {
    // No-op since we don't want to allow deletion from the analysis view
  };

  const handleUpdateCategory = async (foodId: string, newCategory: string) => {
    try {
      const { error } = await supabase
        .from('food_diary')
        .update({ category: newCategory })
        .eq('id', foodId);

      if (error) throw error;
      toast.success(`Food category updated to ${newCategory}`);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update food category');
    }
  };

  const handleImageSelect = async (image: File) => {
    if (!apiKey) {
      toast.error("Please set your OpenAI API key in API Settings first");
      return;
    }

    setAnalyzing(true);
    setResetUpload(false);
    try {
      await analyzeImage(image, {
        apiKey,
        setNutritionData,
        saveFoodEntries,
      });
      setResetUpload(true);
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
      {nutritionData && (
        <NutritionCard 
          foods={nutritionData.foods} 
          onDelete={handleDelete} 
          onUpdateCategory={handleUpdateCategory}
          selectedDate={new Date()}
        />
      )}
    </div>
  );
};