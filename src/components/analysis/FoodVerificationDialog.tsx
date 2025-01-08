import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FoodVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  foodData: {
    name: string;
    weight_g: number;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }[];
}

export const FoodVerificationDialog: React.FC<FoodVerificationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  foodData,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Food Information</DialogTitle>
          <DialogDescription>
            Please verify that the following information is correct before saving to your food diary.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {foodData?.map((food, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <div>
                <p className="font-medium">Food: {food.name}</p>
                <p>Weight: {food.weight_g}g</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <p>Calories: {food.nutrition.calories}</p>
                <p>Protein: {food.nutrition.protein}g</p>
                <p>Carbs: {food.nutrition.carbs}g</p>
                <p>Fat: {food.nutrition.fat}g</p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex space-x-2 sm:space-x-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm and Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};