import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface FoodItemFormProps {
  name: string;
  weight: number;
  index: number;
  isUpdating: boolean;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onNameChange: (index: number, value: string) => void;
  onNameBlur: (index: number) => void;
  onWeightChange: (index: number, value: string) => void;
  onDelete: (index: number) => void;
}

export const FoodItemForm = ({
  name,
  weight,
  index,
  isUpdating,
  nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  },
  onNameChange,
  onNameBlur,
  onWeightChange,
  onDelete,
}: FoodItemFormProps) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor={`food-name-${index}`}>Food Name</Label>
          <Input
            id={`food-name-${index}`}
            value={name}
            onChange={(e) => onNameChange(index, e.target.value)}
            onBlur={() => onNameBlur(index)}
            disabled={isUpdating}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`food-weight-${index}`}>Weight (g)</Label>
          <Input
            id={`food-weight-${index}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={weight || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              onWeightChange(index, value);
            }}
            disabled={isUpdating}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {isUpdating ? (
            <div className="text-primary animate-pulse">
              Updating nutrition info...
            </div>
          ) : (
            <>
              Calories: {Math.round(nutrition?.calories || 0)} kcal | 
              Protein: {(nutrition?.protein || 0).toFixed(1)}g | 
              Carbs: {(nutrition?.carbs || 0).toFixed(1)}g | 
              Fat: {(nutrition?.fat || 0).toFixed(1)}g
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(index)}
          className="h-8 w-8 text-destructive hover:text-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};