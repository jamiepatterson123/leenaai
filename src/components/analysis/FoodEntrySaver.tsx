
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

export const saveFoodEntries = async (foods: any[], selectedDate: Date, mealName: string = "", mealId: string = "") => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    toast.error("You must be logged in to save food entries");
    return;
  }

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  // Create a unique meal ID if one wasn't provided
  const groupMealId = mealId || crypto.randomUUID();

  try {
    const { error } = await supabase.from("food_diary").insert(
      foods.map((food) => ({
        user_id: user.id,
        food_name: food.name,
        weight_g: food.weight_g,
        calories: food.nutrition.calories,
        protein: food.nutrition.protein,
        carbs: food.nutrition.carbs,
        fat: food.nutrition.fat,
        date: formattedDate,
        state: food.state,
        category: food.category || 'uncategorized',
        meal_name: mealName, // Add the meal name
        meal_id: groupMealId, // Add the meal ID to group items
      }))
    );

    if (error) {
      console.error("Error saving food entries:", error);
      toast.error("Failed to save food entries");
      throw error;
    }

    // Invalidate the queries to refresh the data
    await Promise.all([
      supabase.from('food_diary')
        .select('*')
        .eq('date', formattedDate)
        .eq('user_id', user.id),
    ]);

    toast.success("Food entries saved to diary!");
  } catch (error) {
    console.error("Error in saveFoodEntries:", error);
    toast.error("Failed to save food entries");
    throw error;
  }
};
