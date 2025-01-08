import React from "react";
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foods: FoodItem[];
  onConfirm: (foods: FoodItem[]) => void;
}

export const FoodVerificationDialog = ({
  open,
  onOpenChange,
  foods,
  onConfirm,
}: FoodVerificationDialogProps) => {
  const {
    editedFoods,
    updating,
    tempNames,
    handleNameChange,
    handleNameBlur,
    handleWeightChange,
    handleDeleteFood
  } = useFoodItems(foods);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verify Food Items</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
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
        <DialogFooter className="bg-background pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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