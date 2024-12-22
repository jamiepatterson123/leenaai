import React, { useState } from "react";
import { FoodDiary } from "@/components/FoodDiary";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

const FoodDiaryPage = () => {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-6">
        <FoodDiary selectedDate={date} />
        <div className="order-first md:order-last">
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FoodDiaryPage;