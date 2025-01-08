import { FoodDiaryEntry } from "@/types/food";

export const processCalorieData = (foodData: FoodDiaryEntry[]) => {
  const processedData = foodData.reduce((acc: Record<string, number>, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += entry.calories;
    return acc;
  }, {});

  return Object.entries(processedData).map(([date, calories]) => ({
    date,
    calories: Math.round(calories),
  }));
};

export const processMacroData = (foodData: FoodDiaryEntry[]) => {
  const processedData = foodData.reduce((acc: Record<string, { protein: number; carbs: number; fat: number }>, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = { protein: 0, carbs: 0, fat: 0 };
    }
    acc[date].protein += entry.protein;
    acc[date].carbs += entry.carbs;
    acc[date].fat += entry.fat;
    return acc;
  }, {});

  return Object.entries(processedData).map(([date, macros]) => ({
    date,
    protein: Math.round(macros.protein),
    carbs: Math.round(macros.carbs),
    fat: Math.round(macros.fat),
  }));
};

export const processMealData = (foodData: FoodDiaryEntry[]) => {
  return foodData.map(entry => ({
    calories: entry.calories,
    category: entry.category || 'uncategorized',
    state: entry.state || 'solid',
  }));
};