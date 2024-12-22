import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ImageAnalysisSectionProps {
  onAnalysisComplete: (result: any) => void;
}

export const ImageAnalysisSection = ({ onAnalysisComplete }: ImageAnalysisSectionProps) => {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);

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
        model: "gpt-4-vision-preview",
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
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      toast.error("Please set your OpenAI API key in API Settings first");
      navigate("/api-settings");
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeImage(image, apiKey);
      await saveFoodEntries(result.foods);
      onAnalysisComplete(result);
      toast.success("Food analysis complete!");
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

    const { error } = await supabase.from("food_diary").insert(
      foods.map((food) => ({
        user_id: user.id,
        food_name: food.name,
        weight_g: food.weight_g,
        calories: food.nutrition.calories,
        protein: food.nutrition.protein,
        carbs: food.nutrition.carbs,
        fat: food.nutrition.fat,
      }))
    );

    if (error) {
      toast.error("Failed to save food entries");
      throw error;
    }

    toast.success("Food entries saved to diary!");
  };

  return (
    <div className="space-y-4">
      <ImageUpload onImageSelect={handleImageSelect} />
      {analyzing && (
        <p className="text-center text-muted-foreground animate-pulse">
          Analyzing your meal...
        </p>
      )}
    </div>
  );
};