
import React, { useState, useEffect } from "react";
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
  meal_name?: string;
  meal_id?: string;
}

interface FoodVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  foods: FoodItem[];
  onConfirm: (foods: FoodItem[]) => void;
  mealName?: string;
}

export const FoodVerificationDialog = ({
  isOpen,
  onClose,
  foods,
  onConfirm,
  mealName = "",
}: FoodVerificationDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("uncategorized");
  const [customMealName, setCustomMealName] = useState<string>("");
  
  const {
    editedFoods,
    updating,
    tempNames,
    handleNameChange,
    handleNameBlur,
    handleWeightChange,
    handleDeleteFood
  } = useFoodItems(foods);

  // Set the meal name from props when the dialog opens or foods change
  useEffect(() => {
    if (mealName) {
      setCustomMealName(mealName);
    } else if (foods.length > 0 && foods[0].meal_name) {
      setCustomMealName(foods[0].meal_name);
    }
  }, [mealName, foods, isOpen]);

  const handleConfirm = () => {
    // Generate a unique meal ID to group these foods together
    const mealId = crypto.randomUUID();
    
    // Apply the selected category, meal name, and meal ID to all food items
    const foodsWithCategory = editedFoods.map(food => ({
      ...food,
      category: selectedCategory,
      meal_name: customMealName || "Unlabeled Meal",
      meal_id: mealId
    }));
    
    onConfirm(foodsWithCategory);
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
            <Label htmlFor="meal-name">Meal Name</Label>
            <Input
              id="meal-name"
              placeholder="Enter meal name"
              value={customMealName}
              onChange={(e) => setCustomMealName(e.target.value)}
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
