import { FoodDiaryEntry } from "@/types/food";

export const transformDiaryEntries = (
  foodData: any[],
  weightData: any[],
  formattedDate: string
) => {
  // Transform weight entries to food diary format
  const weightAsFoodEntries = weightData.map(weight => ({
    id: weight.id,
    user_id: weight.user_id,
    food_name: `Weight Entry: ${weight.weight_kg} kg`,
    weight_g: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    date: formattedDate,
    category: "uncategorized",
    created_at: weight.created_at,
    state: "weight_entry"
  }));

  console.log("Weight as food entries:", weightAsFoodEntries);

  // Transform all entries to match NutritionCard props format
  const transformedEntries = [...foodData, ...weightAsFoodEntries].map(entry => ({
    id: entry.id,
    name: entry.food_name,
    weight_g: entry.weight_g,
    nutrition: {
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat
    },
    category: entry.category || "uncategorized",
    created_at: entry.created_at
  }));

  console.log("Transformed entries:", transformedEntries);
  return transformedEntries;
};