import React, { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { NutritionCard } from "@/components/NutritionCard";
import { ApiKeyInput } from "@/components/ApiKeyInput";
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
      model: "gpt-4o", // Updated to use the correct model
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
    console.log('GPT Response:', content); // Add logging to help debug
    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing GPT response:', data.choices[0].message.content);
    throw new Error('Invalid response format from GPT');
  }
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
      toast.error(error instanceof Error ? error.message : "Error analyzing image");
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