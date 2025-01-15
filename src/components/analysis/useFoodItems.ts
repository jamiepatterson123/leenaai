import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FoodItem {
  name: string;
  weight_g: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  state: string;
}

export const useFoodItems = (initialFoods: FoodItem[]) => {
  const [editedFoods, setEditedFoods] = useState<FoodItem[]>(initialFoods);
  const [updating, setUpdating] = useState<number | null>(null);
  const [tempNames, setTempNames] = useState<string[]>(initialFoods.map(f => f.name));

  useEffect(() => {
    setEditedFoods(initialFoods);
    setTempNames(initialFoods.map(f => f.name));
  }, [initialFoods]);

  const updateNutritionInfo = async (index: number, newName: string) => {
    setUpdating(index);
    
    try {
      const { data: secrets, error: secretError } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'OPENAI_API_KEY')
        .single();

      if (secretError || !secrets) {
        toast.error('OpenAI API key not found. Please configure it in settings.');
        setUpdating(null);
        return;
      }

      const apiKey = secrets.value;
      console.log('Updating nutrition info for:', newName);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a nutrition expert. Provide accurate nutritional information for the specified food and weight."
            },
            {
              role: "user",
              content: `Provide nutritional information for ${editedFoods[index].weight_g}g of ${newName} in this exact JSON format:
              {
                "nutrition": {
                  "calories": number,
                  "protein": number,
                  "carbs": number,
                  "fat": number
                }
              }`
            }
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to update nutrition information');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const nutritionData = JSON.parse(content);

      setEditedFoods(prev =>
        prev.map((food, i) =>
          i === index
            ? {
                ...food,
                name: newName,
                nutrition: nutritionData.nutrition
              }
            : food
        )
      );
      toast.success(`Updated nutrition info for ${newName}`);
    } catch (error) {
      console.error('Error updating nutrition:', error);
      toast.error('Failed to update nutrition information');
    } finally {
      setUpdating(null);
    }
  };

  const handleNameChange = (index: number, value: string) => {
    setTempNames(prev => prev.map((name, i) => i === index ? value : name));
  };

  const handleNameBlur = async (index: number) => {
    const newName = tempNames[index];
    if (newName !== editedFoods[index].name) {
      await updateNutritionInfo(index, newName);
    }
  };

  const handleWeightChange = (index: number, newWeight: string) => {
    const weight = newWeight === '' ? 0 : parseFloat(newWeight);
    if (!isNaN(weight) && weight >= 0) {
      const originalFood = editedFoods[index];
      const originalWeight = originalFood.weight_g;
      const ratio = originalWeight === 0 ? 0 : weight / originalWeight;
      
      setEditedFoods((prev) =>
        prev.map((food, i) =>
          i === index
            ? {
                ...food,
                weight_g: weight,
                nutrition: {
                  calories: ratio * food.nutrition.calories,
                  protein: ratio * food.nutrition.protein,
                  carbs: ratio * food.nutrition.carbs,
                  fat: ratio * food.nutrition.fat,
                },
              }
            : food
        )
      );
    }
  };

  const handleDeleteFood = (index: number) => {
    setEditedFoods(prev => prev.filter((_, i) => i !== index));
    setTempNames(prev => prev.filter((_, i) => i !== index));
    toast.success("Food item removed");
  };

  return {
    editedFoods,
    updating,
    tempNames,
    handleNameChange,
    handleNameBlur,
    handleWeightChange,
    handleDeleteFood
  };
};