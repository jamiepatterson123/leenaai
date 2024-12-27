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

  React.useEffect(() => {
    setEditedFoods(foods);
  }, [foods]);

  const handleNameChange = (index: number, newName: string) => {
    setEditedFoods((prev) =>
      prev.map((food, i) =>
        i === index ? { ...food, name: newName } : food
      )
    );
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
                  ...food.nutrition,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
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
                    value={food.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`food-weight-${index}`}>Weight (g)</Label>
                  <Input
                    id={`food-weight-${index}`}
                    type="number"
                    value={food.weight_g}
                    onChange={(e) => handleWeightChange(index, e.target.value)}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Calories: {Math.round(food.nutrition.calories)} kcal | 
                Protein: {food.nutrition.protein.toFixed(1)}g | 
                Carbs: {food.nutrition.carbs.toFixed(1)}g | 
                Fat: {food.nutrition.fat.toFixed(1)}g
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(editedFoods)}>
            Add to Diary
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};