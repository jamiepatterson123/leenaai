import React from "react";
import { FoodDiary } from "@/components/FoodDiary";
import { FoodLoggingCalendar } from "@/components/FoodLoggingCalendar";

const FoodDiaryPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <FoodDiary />
        </div>
        <div>
          <FoodLoggingCalendar />
        </div>
      </div>
    </div>
  );
};

export default FoodDiaryPage;