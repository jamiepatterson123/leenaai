
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FoodItemForm } from "./FoodItemForm";
import { useFoodItems } from "./useFoodItems";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  category?: string;
}

interface FoodVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  foods: FoodItem[];
  onConfirm: (foods: FoodItem[], mealName: string) => void;
}

export const FoodVerificationDialog = ({
  isOpen,
  onClose,
  foods,
  onConfirm,
}: FoodVerificationDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("uncategorized");
  const [mealName, setMealName] = useState<string>("");
  const {
    editedFoods,
    updating,
    tempNames,
    handleNameChange,
    handleNameBlur,
    handleWeightChange,
    handleDeleteFood
  } = useFoodItems(foods);

  // Generate a suggested meal name based on the food items
  React.useEffect(() => {
    if (foods.length > 0 && !mealName) {
      const mainItem = foods[0].name;
      
      if (foods.length === 1) {
        setMealName(mainItem);
      } else if (foods.length <= 3) {
        const foodNames = foods.map(food => food.name);
        setMealName(`${mainItem} with ${foodNames.slice(1).join(' & ')}`);
      } else {
        setMealName(`${mainItem} meal`);
      }
    }
  }, [foods, mealName]);

  const handleConfirm = () => {
    // Apply the selected category to all food items
    const foodsWithCategory = editedFoods.map(food => ({
      ...food,
      category: selectedCategory
    }));
    
    // Pass the meal name along with the foods
    onConfirm(foodsWithCategory, mealName);
  };

  const categories = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verify Food Items</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="mealName">Meal Name</Label>
            <Input
              id="mealName"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="Enter a name for this meal"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Meal Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.toLowerCase()} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {editedFoods.map((food, index) => (
            <FoodItemForm
              key={index}
              name={tempNames[index]}
              weight={food.weight_g}
              index={index}
              isUpdating={updating === index}
              nutrition={food.nutrition}
              onNameChange={handleNameChange}
              onNameBlur={handleNameBlur}
              onWeightChange={handleWeightChange}
              onDelete={handleDeleteFood}
            />
          ))}
        </div>
        <DialogFooter className="bg-background pt-2 flex-col-reverse sm:flex-row gap-3">
          <Button 
            onClick={handleConfirm}
            disabled={updating !== null || editedFoods.length === 0}
            className="w-full sm:w-auto order-2 sm:order-1"
            variant="gradient"
          >
            Add to Diary
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
