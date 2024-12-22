import { ImageUpload } from "@/components/ImageUpload";
import { NutritionCard } from "@/components/NutritionCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useState } from "react";

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

  const analyzeImage = async (image: File, apiKey: string) => {
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",  // Updated to use the newer model
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "You are analyzing a photo of food for a nutrition tracking application. Your task is to:\n1. Identify each food item visible in the image.\n2. Determine whether the food is a whole item (e.g., whole chicken) or a portioned item (e.g., chicken breast).\n3. Estimate the weight of each food item in grams, keeping in mind that the photo might include uncooked or unusually large portions.\n\nProvide the output in JSON format with this structure:\n{\n    \"foods\": [\n        {\"name\": \"food name\", \"weight_g\": estimated_weight, \"nutrition\": {\"calories\": number, \"protein\": grams, \"carbs\": grams, \"fat\": grams}}\n    ]\n}\n\nContext and instructions:\n- If you see a whole chicken, specify it as 'whole chicken' not 'chicken breast'\n- Estimate portions based on standard serving sizes\n- Be very specific with food identification\n- Include detailed nutritional information per item",
              },
              {
                type: "image_url",
                image_url: {
                  "url": `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error analyzing image');
    }

    const data = await response.json();
    try {
      const content = data.choices[0].message.content;
      console.log('GPT Response:', content);
      
      const cleanedContent = content.replace(/```json\n|\n```/g, '');
      return JSON.parse(cleanedContent);
    } catch (error) {
      console.error('Error parsing GPT response:', data.choices[0].message.content);
      throw new Error('Invalid response format from GPT');
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
      const result = await analyzeImage(image, apiKey);
      setNutritionData(result);
      await saveFoodEntries(result.foods);
      toast.success("Food analysis complete!");
      // Reset the upload component after successful analysis
      setResetUpload(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error analyzing image");
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveFoodEntries = async (foods: any[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to save food entries");
      return;
    }

    // Format today's date in YYYY-MM-DD format for the database
    const today = format(new Date(), 'yyyy-MM-dd');

    const { error } = await supabase.from("food_diary").insert(
      foods.map((food) => ({
        user_id: user.id,
        food_name: food.name,
        weight_g: food.weight_g,
        calories: food.nutrition.calories,
        protein: food.nutrition.protein,
        carbs: food.nutrition.carbs,
        fat: food.nutrition.fat,
        date: today,
      }))
    );

    if (error) {
      toast.error("Failed to save food entries");
      throw error;
    }

    toast.success("Food entries saved to diary!");
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