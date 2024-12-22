import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { ChevronDown } from "lucide-react";
import { DraggableFood } from "./DraggableFood";

interface MealCategoryProps {
  id: string;
  name: string;
  calories: number;
  foods: Array<{
    id: string;
    name: string;
    weight_g: number;
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>;
  onDelete: (id: string) => void;
}

export const MealCategory: React.FC<MealCategoryProps> = ({
  id,
  name,
  calories,
  foods,
  onDelete,
}) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="space-y-2">
      <div
        ref={setNodeRef}
        className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/10 hover:bg-secondary/70 transition-colors"
      >
        <span className="font-medium">{name}</span>
        <div className="flex items-center gap-2">
          <span>{calories} kcal</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      {foods.length > 0 && (
        <div className="space-y-2 pl-4">
          {foods.map((food) => (
            <DraggableFood
              key={food.id}
              food={food}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};