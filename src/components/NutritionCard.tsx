import React from "react";
import { Card } from "@/components/ui/card";
import { FoodList } from "./nutrition/FoodList";

interface NutritionCardProps {
  foods: Array<{
    id: string;
    name: string;
    weight_g: number;
    category?: string;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    isWeightEntry?: boolean;
    weightKg?: number;
  }>;
  onDelete: (id: string) => void;
  onDeleteWeight: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  selectedDate: Date;
}

export const NutritionCard = ({
  foods,
  onDelete,
  onDeleteWeight,
  onUpdateCategory,
  selectedDate,
}: NutritionCardProps) => {
  return (
    <Card className="p-4">
      <FoodList
        foods={foods}
        onDelete={onDelete}
        onDeleteWeight={onDeleteWeight}
        onUpdateCategory={onUpdateCategory}
      />
    </Card>
  );
};