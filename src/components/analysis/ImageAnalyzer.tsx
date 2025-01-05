import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageAnalyzerProps {
  imageFile: File;
  onAnalysisComplete: (foods: Array<{
    name: string;
    weight_g: number;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>) => void;
  onCancel: () => void;
}

export const ImageAnalyzer = ({ 
  imageFile, 
  onAnalysisComplete,
  onCancel 
}: ImageAnalyzerProps) => {
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeImage = async () => {
    setAnalyzing(true);
    try {
      const { data: { value: apiKey } } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'OPENAI_API_KEY')
        .single();

      if (!apiKey) {
        toast.error('OpenAI API key not found');
        return;
      }

      // Convert image to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });

      // First API call to analyze the image
      const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "What food items do you see in this image? List each item on a new line with its estimated weight in grams."
                },
                {
                  type: "image_url",
                  image_url: base64Image
                }
              ]
            }
          ]
        }),
      });

      if (!visionResponse.ok) {
        throw new Error('Failed to analyze image');
      }

      const visionData = await visionResponse.json();
      const foodList = visionData.choices[0].message.content;

      // Second API call to get nutritional information
      const nutritionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a nutrition expert. Provide accurate nutritional information for the specified foods."
            },
            {
              role: "user",
              content: `Provide nutritional information for these foods in JSON format:
              ${foodList}
              
              Return in this exact format:
              {
                "foods": [
                  {
                    "name": "food name",
                    "weight_g": number,
                    "nutrition": {
                      "calories": number,
                      "protein": number,
                      "carbs": number,
                      "fat": number
                    }
                  }
                ]
              }`
            }
          ],
        }),
      });

      if (!nutritionResponse.ok) {
        throw new Error('Failed to get nutrition information');
      }

      const nutritionData = await nutritionResponse.json();
      const result = JSON.parse(nutritionData.choices[0].message.content);
      
      onAnalysisComplete(result.foods);
      toast.success('Food analysis complete!');
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <img 
        src={URL.createObjectURL(imageFile)} 
        alt="Food preview" 
        className="w-full h-48 object-cover rounded-lg"
      />
      <div className="flex justify-between gap-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          onClick={analyzeImage} 
          disabled={analyzing}
          className="flex-1"
        >
          {analyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>
    </div>
  );
};