import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AnalyzeImageOptions {
  setNutritionData: (data: any) => void;
  saveFoodEntries: (foods: any[]) => Promise<void>;
}

export const analyzeImage = async (
  image: File,
  { setNutritionData, saveFoodEntries }: AnalyzeImageOptions
) => {
  try {
    console.log("Starting image analysis...");
    
    // Convert image to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extract the base64 data after the data URL prefix
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });

    console.log("Image converted to base64, calling analyze-food function...");

    const { data, error } = await supabase.functions.invoke('analyze-food', {
      body: { image: base64Image }
    });

    if (error) {
      console.error("Error calling analyze-food function:", error);
      throw new Error(error.message || 'Failed to analyze image');
    }

    console.log("Analysis result:", data);
    
    if (!data.foods || !Array.isArray(data.foods)) {
      throw new Error('Invalid response format: missing foods array');
    }

    setNutritionData(data);
    return data;
  } catch (error) {
    console.error("Error in analyzeImage:", error);
    throw error;
  }
};