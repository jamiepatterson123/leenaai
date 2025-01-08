import React from "react";
import { FoodDiary } from "@/components/FoodDiary";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { useSearchParams } from "react-router-dom";
import { parse } from "date-fns";

const FoodDiaryPage = () => {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  
  // Parse the date from URL or use current date as fallback
  const selectedDate = dateParam 
    ? parse(dateParam, 'yyyy-MM-dd', new Date())
    : new Date();

  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-6">
        {/* Main content area - nutrition info */}
        <div className="order-1 md:order-1">
          <FoodDiary selectedDate={selectedDate} />
        </div>
        
        {/* Sidebar - calendar and image analysis */}
        <div className="order-2 md:order-2 space-y-6">
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(newDate) => newDate && setSearchParams({ date: format(newDate, 'yyyy-MM-dd') })}
              className="rounded-md"
            />
          </Card>
          <ImageAnalysisSection
            analyzing={analyzing}
            setAnalyzing={setAnalyzing}
            nutritionData={nutritionData}
            setNutritionData={setNutritionData}
            selectedDate={selectedDate}
          />
        </div>
      </div>
    </div>
  );
};

export default FoodDiaryPage;