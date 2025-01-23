import React from "react";
import { NutritionCard } from "@/components/NutritionCard";
import { format } from "date-fns";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";
import { useDiaryOperations } from "@/hooks/useDiaryOperations";
import { transformDiaryEntries } from "@/utils/transformDiaryEntries";

interface FoodDiaryProps {
  selectedDate: Date;
}

export const FoodDiary: React.FC<FoodDiaryProps> = ({ selectedDate }) => {
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const { foodData, weightData, isLoading } = useDiaryEntries(formattedDate);
  const { handleDelete, handleUpdateCategory } = useDiaryOperations();

  const transformedEntries = transformDiaryEntries(foodData, weightData, formattedDate);

  const handleEntryDelete = async (id: string) => {
    const entryType = weightData.find(entry => entry.id === id) ? "weight" : "food";
    await handleDelete(id, entryType);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <NutritionCard
      foods={transformedEntries}
      onDelete={handleEntryDelete}
      onUpdateCategory={handleUpdateCategory}
      selectedDate={selectedDate}
    />
  );
};