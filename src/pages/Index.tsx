import React from "react";
import { NutritionCard } from "@/components/NutritionCard";

const Index = () => {
  const foods = [
    {
      id: "1",
      name: "Example Food",
      weight_g: 100,
      category: "breakfast",
      nutrition: {
        calories: 200,
        protein: 20,
        carbs: 10,
        fat: 5,
      },
    },
  ];

  const handleDelete = () => {
    // Example delete handler
  };

  const handleUpdateCategory = (foodId: string, category: string) => {
    // Example update category handler
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <NutritionCard
        foods={foods}
        onDelete={handleDelete}
        onUpdateCategory={handleUpdateCategory}
      />
    </div>
  );
};

export default Index;