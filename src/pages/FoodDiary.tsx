import React, { useState, useEffect } from "react";
import { FoodDiary } from "@/components/FoodDiary";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { useLocation, useNavigate } from "react-router-dom";

const FoodDiaryPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [showImageAnalysis, setShowImageAnalysis] = useState(false);

  useEffect(() => {
    // Only show image analysis on fresh visits to the page
    const isFromVerification = location.state?.fromVerification;
    
    if (!isFromVerification) {
      setShowImageAnalysis(true);
    }

    // Clear location state only if we came from verification
    if (isFromVerification) {
      // Use a timeout to ensure state updates happen in correct order
      setTimeout(() => {
        navigate(location.pathname, { replace: true });
      }, 0);
    }
  }, [location.pathname]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-6">
        {/* Main content area - nutrition info */}
        <div className="order-1 md:order-1">
          <FoodDiary selectedDate={date} />
        </div>
        
        {/* Sidebar - calendar and image analysis */}
        <div className="order-2 md:order-2 space-y-6">
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md"
            />
          </Card>
          {showImageAnalysis && (
            <ImageAnalysisSection
              analyzing={analyzing}
              setAnalyzing={setAnalyzing}
              nutritionData={nutritionData}
              setNutritionData={setNutritionData}
              selectedDate={date}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodDiaryPage;