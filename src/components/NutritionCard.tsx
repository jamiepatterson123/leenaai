
import React from "react";
import { Card } from "@/components/ui/card";
import { TotalNutrition } from "./nutrition/TotalNutrition";
import { FoodList } from "./nutrition/FoodList";
import { useNutritionTargets } from "./nutrition/useNutritionTargets";
import { ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { MacroProgressBar } from "./MacroProgressBar";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionCardProps {
  foods: Array<{
    id: string;
    name: string;
    weight_g: number;
    nutrition: NutritionInfo;
    category?: string;
  }>;
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  selectedDate: Date;
  mealName?: string;
  mealId?: string | null;
  onUpdateMealName?: (mealId: string, mealName: string) => void;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ 
  foods, 
  onDelete,
  onUpdateCategory,
  selectedDate,
  mealName,
  mealId,
  onUpdateMealName
}) => {
  const totalNutrition = TotalNutrition({ foods });
  const { targets } = useNutritionTargets();
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedMealName, setEditedMealName] = useState(mealName || "");

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subDays(selectedDate, 1)
      : addDays(selectedDate, 1);
    
    navigate(`/food-diary?date=${format(newDate, 'yyyy-MM-dd')}`);
  };

  const handleSaveMealName = () => {
    if (mealId && onUpdateMealName && editedMealName) {
      onUpdateMealName(mealId, editedMealName);
      setIsEditingName(false);
    }
  };

  const macros = [
    {
      name: "Calories",
      current: totalNutrition.calories,
      target: targets.calories,
      color: "bg-primary"
    },
    {
      name: "Protein",
      current: totalNutrition.protein,
      target: targets.protein,
      color: "bg-primary"
    },
    {
      name: "Carbs",
      current: totalNutrition.carbs,
      target: targets.carbs,
      color: "bg-primary"
    },
    {
      name: "Fat",
      current: totalNutrition.fat,
      target: targets.fat,
      color: "bg-primary"
    },
  ];

  return (
    <Card className="p-4 md:p-6 bg-background border-border/5 shadow-lg animate-fade-up w-full">
      <div className="space-y-4 md:space-y-6">
        {!mealId ? (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ChevronLeft 
                className="w-6 h-6 text-[#D946EF] cursor-pointer hover:text-[#8B5CF6]" 
                onClick={() => handleDateChange('prev')}
              />
              <h2 className="text-xl md:text-2xl font-bold">
                {format(selectedDate, "MMMM d, yyyy")}
              </h2>
              <ChevronRight 
                className="w-6 h-6 text-[#D946EF] cursor-pointer hover:text-[#8B5CF6]" 
                onClick={() => handleDateChange('next')}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {format(selectedDate, "EEEE - 'Default Macronutrient Targets'")}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {isEditingName ? (
              <div className="flex items-center gap-2 w-full">
                <Input 
                  value={editedMealName}
                  onChange={(e) => setEditedMealName(e.target.value)}
                  className="max-w-xs"
                  placeholder="Meal name"
                  autoFocus
                />
                <Button onClick={handleSaveMealName} size="sm" variant="secondary">Save</Button>
                <Button onClick={() => setIsEditingName(false)} size="sm" variant="ghost">Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{mealName}</h2>
                {mealId && onUpdateMealName && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              {format(selectedDate, "MMM d, yyyy")}
            </span>
          </div>
        )}

        <div className="space-y-4 md:space-y-6">
          {macros.map((macro) => (
            <MacroProgressBar
              key={macro.name}
              label={macro.name}
              current={macro.current}
              target={macro.target}
              color={macro.color}
            />
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">{mealId ? "Food Items" : "Food Diary"}</h3>
          <FoodList 
            foods={foods} 
            onDelete={onDelete} 
            onUpdateCategory={onUpdateCategory}
          />
        </div>
      </div>
    </Card>
  );
};
