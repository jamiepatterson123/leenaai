import React, { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { NutritionCard } from "@/components/NutritionCard";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { toast } from "sonner";

// Mock function to simulate GPT-4 Vision API response
const analyzeImage = async (image: File, apiKey: string) => {
  // In a real implementation, this would call the GPT-4 Vision API
  return {
    foods: [
      {
        name: "chicken breast",
        weight_g: 200,
        nutrition: {
          calories: 330,
          protein: 62,
          carbs: 0,
          fat: 7,
        },
      },
      {
        name: "broccoli",
        weight_g: 150,
        nutrition: {
          calories: 51,
          protein: 4,
          carbs: 10,
          fat: 0.5,
        },
      },
    ],
  };
};

const Index = () => {
  const [apiKey, setApiKey] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<any>(null);

  const handleImageSelect = async (image: File) => {
    if (!apiKey) {
      toast.error("Please set your OpenAI API key first");
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeImage(image, apiKey);
      setNutritionData(result);
      toast.success("Food analysis complete!");
    } catch (error) {
      toast.error("Error analyzing image");
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          Nutrition Tracker
        </h1>
        <ApiKeyInput onApiKeySet={setApiKey} />
        <div className="space-y-8">
          <ImageUpload onImageSelect={handleImageSelect} />
          {analyzing && (
            <p className="text-center text-gray-600 animate-pulse">
              Analyzing your meal...
            </p>
          )}
          {nutritionData && <NutritionCard foods={nutritionData.foods} />}
        </div>
      </div>
    </div>
  );
};

export default Index;