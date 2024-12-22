import React, { useState, useEffect } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { NutritionCard } from "@/components/NutritionCard";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      model: "gpt-4o-mini", // Updated to use the mini model for faster results
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
    
    // Clean up the response by removing markdown code blocks if present
    const cleanedContent = content.replace(/```json\n|\n```/g, '');
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('Error parsing GPT response:', data.choices[0].message.content);
    throw new Error('Invalid response format from GPT');
  }
};

const Index = () => {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    const savedKey = localStorage.getItem("openai_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

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

  const handleImageSelect = async (image: File) => {
    if (!apiKey) {
      toast.error("Please set your OpenAI API key in API Settings first");
      navigate("/api-settings");
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeImage(image, apiKey);
      setNutritionData(result);
      await saveFoodEntries(result.foods);
      toast.success("Food analysis complete!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error analyzing image");
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = () => {
    // No-op since we don't want to allow deletion from the analysis view
    // Users should go to the food diary page to manage their entries
  };

  const handleUpdateCategory = async (foodId: string, category: string) => {
    // No-op since we don't want to allow category updates from the analysis view
    // Users should go to the food diary page to manage their entries
  };

  return (
    <div className="max-w-4xl mx-auto px-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">
        Nutrition Tracker
      </h1>
      <div className="space-y-8">
        <ImageUpload onImageSelect={handleImageSelect} />
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
          />
        )}
        <div className="text-center">
          <Link
            to="/food-diary"
            className="text-primary hover:text-primary/80 font-medium"
          >
            View Food Diary →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;