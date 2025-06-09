
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
    
    // Validate image
    if (!image.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }
    
    if (image.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Image file is too large. Please select an image under 10MB.');
    }
    
    // Convert image to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extract the base64 data after the data URL prefix
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(image);
    });

    console.log("Image converted to base64, calling analyze-food function...");

    const { data, error } = await supabase.functions.invoke('analyze-food', {
      body: { image: base64Image }
    });

    if (error) {
      console.error("Error calling analyze-food function:", error);
      // Check if it's a deployment/configuration issue
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        throw new Error('Image analysis service is not available. Please try again later.');
      }
      throw new Error(error.message || 'Failed to analyze image');
    }

    console.log("Analysis result:", data);
    
    if (!data) {
      throw new Error('No response from analysis service');
    }
    
    if (!data.foods || !Array.isArray(data.foods)) {
      throw new Error('Invalid response format: missing foods array');
    }
    
    if (data.foods.length === 0) {
      throw new Error('No food items detected in the image. Please try a clearer photo with visible food items.');
    }

    setNutritionData(data);
    return data;
  } catch (error) {
    console.error("Error in analyzeImage:", error);
    throw error;
  }
};
