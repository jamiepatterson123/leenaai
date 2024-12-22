import React from "react";
import { FoodDiary } from "@/components/FoodDiary";

const FoodDiaryPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">
        Food Diary
      </h1>
      <FoodDiary />
    </div>
  );
};

export default FoodDiaryPage;