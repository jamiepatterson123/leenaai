import React from "react";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

interface FoodListProps {
  foods: Array<{
    id: string;
    name: string;
    weight_g: number;
  }>;
  onDelete: (id: string) => void;
}

export const FoodList: React.FC<FoodListProps> = ({ foods, onDelete }) => {
  return (
    <div className="mt-8">
      <h4 className="font-medium mb-2">Foods Detected</h4>
      <ul className="space-y-2">
        {foods.map((food) => (
          <li
            key={food.id}
            className="flex justify-between items-center text-sm text-gray-600 py-2 border-b last:border-b-0"
          >
            <div className="flex items-center gap-4">
              <span className="capitalize">{food.name}</span>
              <span>{food.weight_g}g</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(food.id)}
              className="h-8 w-8 text-destructive hover:text-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};