import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

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

interface FoodVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  foods: FoodItem[];
  onConfirm: (foods: FoodItem[]) => void;
}

export const FoodVerificationDialog = ({
  isOpen,
  onClose,
  foods,
  onConfirm,
}: FoodVerificationDialogProps) => {
  const [editedFoods, setEditedFoods] = React.useState<FoodItem[]>(foods);
  const [updating, setUpdating] = React.useState<number | null>(null);
  const [tempNames, setTempNames] = React.useState<string[]>(foods.map(f => f.name));

  React.useEffect(() => {
    setEditedFoods(foods);
    setTempNames(foods.map(f => f.name));
  }, [foods]);

  const updateNutritionInfo = async (index: number, newName: string) => {
    setUpdating(index);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('openai_api_key')}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
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
    const weight = parseFloat(newWeight);
    if (!isNaN(weight)) {
      setEditedFoods((prev) =>
        prev.map((food, i) =>
          i === index
            ? {
                ...food,
                weight_g: weight,
                nutrition: {
                  calories: (weight / food.weight_g) * food.nutrition.calories,
                  protein: (weight / food.weight_g) * food.nutrition.protein,
                  carbs: (weight / food.weight_g) * food.nutrition.carbs,
                  fat: (weight / food.weight_g) * food.nutrition.fat,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verify Food Items</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {editedFoods.map((food, index) => (
            <div key={index} className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor={`food-name-${index}`}>Food Name</Label>
                  <Input
                    id={`food-name-${index}`}
                    value={tempNames[index]}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    onBlur={() => handleNameBlur(index)}
                    disabled={updating === index}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`food-weight-${index}`}>Weight (g)</Label>
                  <Input
                    id={`food-weight-${index}`}
                    type="number"
                    value={food.weight_g}
                    onChange={(e) => handleWeightChange(index, e.target.value)}
                    disabled={updating === index}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {updating === index ? (
                    <div className="text-primary animate-pulse">
                      Updating nutrition info...
                    </div>
                  ) : (
                    <>
                      Calories: {Math.round(food.nutrition.calories)} kcal | 
                      Protein: {food.nutrition.protein.toFixed(1)}g | 
                      Carbs: {food.nutrition.carbs.toFixed(1)}g | 
                      Fat: {food.nutrition.fat.toFixed(1)}g
                    </>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteFood(index)}
                  className="h-8 w-8 text-destructive hover:text-destructive/90"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className="bg-background pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => onConfirm(editedFoods)}
            disabled={updating !== null || editedFoods.length === 0}
          >
            Add to Diary
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};