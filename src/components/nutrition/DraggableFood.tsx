import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

interface DraggableFoodProps {
  food: {
    id: string;
    name: string;
    weight_g: number;
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  onDelete: (id: string) => void;
}

export const DraggableFood: React.FC<DraggableFoodProps> = ({ food, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: food.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex justify-between items-center p-4 bg-secondary/30 rounded-lg backdrop-blur-sm border border-border/10 cursor-move"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="capitalize">{food.name}</span>
          <span className="text-sm text-muted-foreground">
            {food.weight_g}g
          </span>
        </div>
        {food.nutrition && (
          <span className="text-sm text-muted-foreground">
            {food.nutrition.protein}g protein, {food.nutrition.carbs}g carbs,{" "}
            {food.nutrition.fat}g fat
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {food.nutrition && (
          <span className="text-sm">{food.nutrition.calories} kcal</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(food.id)}
          className="h-8 w-8 text-destructive hover:text-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};