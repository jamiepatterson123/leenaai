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
      const mainItems = foods.map(food => food.name.trim()).filter(name => name.length > 0);
      
      if (mainItems.length === 0) return;
      
      // Helper function to capitalize first letter of each word
      const capitalize = (str: string) => {
        return str.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      };
      
      // Sort items to prioritize proteins and mains first
      const proteinKeywords = ['steak', 'chicken', 'fish', 'beef', 'pork', 'tofu', 'salmon', 'tuna', 'eggs', 'egg'];
      const mainItems1 = mainItems.filter(item => 
        proteinKeywords.some(keyword => item.toLowerCase().includes(keyword))
      );
      const mainItems2 = mainItems.filter(item => 
        !proteinKeywords.some(keyword => item.toLowerCase().includes(keyword))
      );
      
      const sortedItems = [...mainItems1, ...mainItems2];
      const primaryItem = capitalize(sortedItems[0]);
      
      // Generate different styles of names based on the food combination
      if (sortedItems.length === 1) {
        // For single items, add a descriptive prefix or cooking method if not present
        if (primaryItem.toLowerCase().includes('steak')) {
          setMealName(`Sizzling ${primaryItem}`);
        } else if (primaryItem.toLowerCase().includes('bowl')) {
          setMealName(`Gourmet ${primaryItem}`);
        } else if (primaryItem.toLowerCase().includes('salad')) {
          setMealName(`Fresh ${primaryItem}`);
        } else {
          // Check if it's likely to be a protein
          if (proteinKeywords.some(keyword => primaryItem.toLowerCase().includes(keyword))) {
            setMealName(`Signature ${primaryItem}`);
          } else {
            // For other items
            setMealName(`Gourmet ${primaryItem}`);
          }
        }
      } else if (sortedItems.length === 2) {
        // For two items, combine them with a complementary description
        const secondaryItem = capitalize(sortedItems[1]);
        setMealName(`${primaryItem} with ${secondaryItem}`);
      } else {
        // For multiple items, focus on the main item and add a description
        const secondaryMentions = sortedItems.slice(1, 3).map(item => capitalize(item));
        
        // Check for bowl-type meals
        if (sortedItems.some(item => item.toLowerCase().includes('bowl'))) {
          const bowlIndex = sortedItems.findIndex(item => item.toLowerCase().includes('bowl'));
          const bowlItem = capitalize(sortedItems[bowlIndex]);
          
          if (bowlIndex === 0) {
            // If bowl is the primary item, name it after the main protein
            const protein = sortedItems.find(item => 
              proteinKeywords.some(keyword => item.toLowerCase().includes(keyword))
            );
            
            if (protein) {
              setMealName(`${capitalize(protein)} ${bowlItem}`);
            } else {
              setMealName(`Signature ${bowlItem}`);
            }
          } else {
            // If bowl is secondary
            setMealName(`${primaryItem} ${bowlItem}`);
          }
        } else if (proteinKeywords.some(keyword => primaryItem.toLowerCase().includes(keyword))) {
          // If primary item is a protein
          setMealName(`${primaryItem} with ${secondaryMentions.join(' & ')}`);
        } else {
          setMealName(`${primaryItem} ${secondaryMentions.length > 0 ? 'Medley' : 'Plate'}`);
        }
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
