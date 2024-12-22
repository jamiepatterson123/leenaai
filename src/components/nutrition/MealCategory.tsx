import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronDown } from "lucide-react";
import { FoodItem } from "./FoodItem";

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

  const totalCalories = foods.reduce((acc, food) => acc + (food.nutrition?.calories || 0), 0);

  return (
    <div ref={setNodeRef} className="space-y-2">
      <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/10 hover:bg-secondary/70 transition-colors">
        <span className="font-medium">{name}</span>
        <div className="flex items-center gap-2">
          <span>{totalCalories} kcal</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      {foods.length > 0 && (
        <SortableContext items={foods.map(f => f.id)} strategy={verticalListSortingStrategy}>
          {foods.map((food) => (
            <FoodItem
              key={food.id}
              food={food}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
};