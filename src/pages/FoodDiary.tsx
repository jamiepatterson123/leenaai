import React from "react";
import { FoodDiary } from "@/components/FoodDiary";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { useSearchParams, useNavigate } from "react-router-dom";
import { parse, format } from "date-fns";

const FoodDiaryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dateParam = searchParams.get('date');
  
  // Parse the date from URL or use current date as fallback
  const selectedDate = dateParam 
    ? parse(dateParam, 'yyyy-MM-dd', new Date())
    : new Date();

  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState(null);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      navigate(`/food-diary?date=${format(date, 'yyyy-MM-dd')}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto md:px-4 py-6 mb-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-6">
        {/* Main content area - nutrition info */}
        <div className="order-1 md:order-1 px-4 md:px-0">
          <FoodDiary selectedDate={selectedDate} />
        </div>
        
        {/* Sidebar - calendar and image analysis */}
        <div className="order-2 md:order-2 space-y-6">
          <div className="px-4 md:px-0">
            <Card className="w-full rounded-lg bg-white border border-gray-200">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="w-full"
              />
            </Card>
          </div>
          <div className="px-4 md:px-0">
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
    </div>
  );
};

export default FoodDiaryPage;