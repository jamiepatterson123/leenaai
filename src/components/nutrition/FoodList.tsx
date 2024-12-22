import React from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DraggableFood } from "./DraggableFood";
import { MealCategory } from "./MealCategory";

interface FoodListProps {
  foods: Array<{
    id: string;
    name: string;
    weight_g: number;
    category?: string | null;
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>;
  onDelete: (id: string) => void;
  onUpdateCategory: (foodId: string, category: string) => void;
}

export const FoodList: React.FC<FoodListProps> = ({ 
  foods, 
  onDelete,
  onUpdateCategory 
}) => {
  const mealCategories = [
    { id: "breakfast", name: "Breakfast" },
    { id: "lunch", name: "Lunch" },
    { id: "dinner", name: "Dinner" },
    { id: "snacks", name: "Snacks" },
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const category = over.id as string;
      const foodId = active.id as string;
      onUpdateCategory(foodId, category);
    }
  };

  const getCategoryCalories = (category: string) => {
    return foods
      .filter((food) => food.category === category)
      .reduce((sum, food) => sum + (food.nutrition?.calories || 0), 0);
  };

  const uncategorizedFoods = foods.filter((food) => !food.category);

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-3">
        {mealCategories.map((category) => (
          <MealCategory
            key={category.id}
            id={category.id}
            name={category.name}
            calories={getCategoryCalories(category.id)}
            foods={foods.filter((food) => food.category === category.id)}
            onDelete={onDelete}
          />
        ))}

        {uncategorizedFoods.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/10">
              <span className="font-medium">Uncategorized</span>
              <span>{getCategoryCalories("")} kcal</span>
            </div>
            <SortableContext items={uncategorizedFoods.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {uncategorizedFoods.map((food) => (
                  <DraggableFood
                    key={food.id}
                    food={food}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        )}
      </div>
    </DndContext>
  );
};