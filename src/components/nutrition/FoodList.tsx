import React, { useState } from "react";
import { Button } from "../ui/button";
import { Trash2, ChevronDown } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FoodItem } from "./FoodItem";
import { MealCategory } from "./MealCategory";

interface FoodListProps {
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
    category?: string;
  }>;
  onDelete: (id: string) => void;
  onUpdateCategory: (foodId: string, category: string) => void;
}

export const FoodList: React.FC<FoodListProps> = ({ foods, onDelete, onUpdateCategory }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const mealCategories = [
    { id: "breakfast", name: "Breakfast", calories: 855 },
    { id: "lunch", name: "Lunch", calories: 567 },
    { id: "dinner", name: "Dinner", calories: 1000 },
    { id: "snacks", name: "Snacks", calories: 0 },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Check if the over.id matches any meal category
      const targetCategory = mealCategories.find(cat => cat.id === over.id);
      if (targetCategory) {
        onUpdateCategory(active.id as string, targetCategory.id);
      }
    }
    
    setActiveId(null);
  };

  const getFoodsByCategory = (category: string) => {
    return foods.filter((food) => food.category === category);
  };

  const uncategorizedFoods = foods.filter((food) => !food.category);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3">
        {mealCategories.map((category) => (
          <MealCategory
            key={category.id}
            id={category.id}
            name={category.name}
            calories={category.calories}
            foods={getFoodsByCategory(category.id)}
            onDelete={onDelete}
          />
        ))}

        {uncategorizedFoods.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/10">
              <span className="font-medium">Uncategorized</span>
              <div className="flex items-center gap-2">
                <span>{uncategorizedFoods.reduce((acc, food) => acc + (food.nutrition?.calories || 0), 0)} kcal</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <SortableContext items={uncategorizedFoods.map(f => f.id)} strategy={verticalListSortingStrategy}>
              {uncategorizedFoods.map((food) => (
                <FoodItem
                  key={food.id}
                  food={food}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          </div>
        )}
      </div>
    </DndContext>
  );
};