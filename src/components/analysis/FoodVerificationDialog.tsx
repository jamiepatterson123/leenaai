
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

  // Generate a restaurant-style meal name based on the food items
  React.useEffect(() => {
    if (foods.length > 0 && !mealName) {
      const proteinItems = ['beef', 'steak', 'chicken', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'lamb'];
      const mainItems = editedFoods.map(food => food.name.toLowerCase());
      
      // Find protein or main dish item
      let mainDish = foods[0].name;
      
      // Look for protein items first
      for (const food of foods) {
        const foodName = food.name.toLowerCase();
        const isProtein = proteinItems.some(protein => foodName.includes(protein));
        if (isProtein) {
          mainDish = food.name;
          break;
        }
      }
      
      // Check if any name contains "bowl" or "plate"
      const hasBowl = mainItems.some(item => item.includes('bowl'));
      const hasPlate = mainItems.some(item => item.includes('plate'));
      
      if (hasBowl) {
        // Use the main protein with "Bowl" format
        setMealName(`${mainDish} Bowl`);
      } else if (hasPlate) {
        // Use the main protein with "Plate" format
        setMealName(`${mainDish} Plate`);
      } else if (foods.length === 1) {
        // Just use the single item name
        setMealName(mainDish);
      } else if (foods.length <= 3) {
        // For 2-3 items, use "with" format
        const sideItems = foods
          .filter(food => food.name !== mainDish)
          .map(food => food.name);
        setMealName(`${mainDish} with ${sideItems.join(' & ')}`);
      } else {
        // For more than 3 items, use "with sides" or a more generic name
        setMealName(`${mainDish} with Sides`);
      }
    }
  }, [foods, mealName, editedFoods]);

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
